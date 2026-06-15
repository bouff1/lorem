// =============================================================================
//  Instantané local des données Riot.
//
//  - refreshSnapshot() : récupère rang + champion des 5 comptes et écrit un
//    fichier JSON. Si un appel Riot échoue (serveurs down, clé expirée...),
//    on CONSERVE l'ancienne valeur => le site garde les dernières données.
//  - readSnapshot()    : lecture rapide pour le site (aucun appel Riot).
// =============================================================================

import { promises as fs } from "fs";
import path from "path";
import { players } from "@/data/team";
import { getSoloRank, getTopChampion, getChampion, type TopChampion } from "./riot";

export interface PlayerSnapshot {
  pseudo: string;
  rang: string | null;
  champ: TopChampion | null;
}

export interface Snapshot {
  /** ISO date du dernier rafraîchissement réussi (au moins partiellement). */
  updatedAt: string | null;
  /** Données par joueur, indexées par pseudo. */
  players: Record<string, PlayerSnapshot>;
}

// Chemin du fichier d'instantané (configurable pour monter un volume Docker).
const SNAPSHOT_PATH =
  process.env.RIOT_SNAPSHOT_PATH ??
  path.join(process.cwd(), "data", "riot-snapshot.json");

export async function readSnapshot(): Promise<Snapshot | null> {
  try {
    const raw = await fs.readFile(SNAPSHOT_PATH, "utf8");
    return JSON.parse(raw) as Snapshot;
  } catch {
    return null; // pas encore d'instantané
  }
}

export async function refreshSnapshot(): Promise<Snapshot> {
  const prev = await readSnapshot();
  const result: Snapshot = {
    updatedAt: prev?.updatedAt ?? null,
    players: { ...(prev?.players ?? {}) },
  };
  let anySuccess = false;

  for (const p of players) {
    if (!p.riotId) continue;
    const { gameName, tagLine } = p.riotId;

    const [rang, champ] = await Promise.all([
      getSoloRank(gameName, tagLine),
      p.championOverride
        ? getChampion(gameName, tagLine, p.championOverride)
        : getTopChampion(gameName, tagLine),
    ]);

    const prevP = prev?.players[p.pseudo];
    // Repli sur l'ancienne valeur si l'appel échoue (Riot down / clé expirée).
    result.players[p.pseudo] = {
      pseudo: p.pseudo,
      rang: rang ?? prevP?.rang ?? null,
      champ: champ ?? prevP?.champ ?? null,
    };

    if (rang || champ) anySuccess = true;
  }

  if (anySuccess) result.updatedAt = new Date().toISOString();

  await fs.mkdir(path.dirname(SNAPSHOT_PATH), { recursive: true });
  await fs.writeFile(SNAPSHOT_PATH, JSON.stringify(result, null, 2), "utf8");
  return result;
}
