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
import {
  getSoloRankData,
  getTopChampion,
  getChampion,
  getRecentStats,
  type TopChampion,
} from "./riot";

export interface PlayerStats {
  /** Saison (API ranked). */
  winrate: number;
  wins: number;
  losses: number;
  games: number;
  /** Parties récentes (match-v5), null si indisponible. */
  kda: number | null;
  csPerMin: number | null;
  recentWinrate: number | null;
  recentGames: number;
}

export interface PlayerSnapshot {
  pseudo: string;
  rang: string | null;
  /** Valeur numérique du rang Solo/Duo (pour le graphe). */
  rankValue: number | null;
  champ: TopChampion | null;
  stats: PlayerStats | null;
}

export interface Snapshot {
  /** ISO date du dernier rafraîchissement réussi (au moins partiellement). */
  updatedAt: string | null;
  /** Données par joueur, indexées par pseudo. */
  players: Record<string, PlayerSnapshot>;
}

/** Un point d'historique : un instant + la valeur de rang de chaque joueur. */
export interface HistoryPoint {
  t: string; // ISO date
  values: Record<string, number | null>; // pseudo -> valeur de rang
}

export interface History {
  points: HistoryPoint[];
}

const MAX_HISTORY_POINTS = 2000;

// Chemins des fichiers (configurables pour monter un volume Docker).
const SNAPSHOT_PATH =
  process.env.RIOT_SNAPSHOT_PATH ??
  path.join(process.cwd(), "data", "riot-snapshot.json");
const HISTORY_PATH =
  process.env.RIOT_HISTORY_PATH ??
  path.join(path.dirname(SNAPSHOT_PATH), "riot-history.json");

export async function readSnapshot(): Promise<Snapshot | null> {
  try {
    const raw = await fs.readFile(SNAPSHOT_PATH, "utf8");
    return JSON.parse(raw) as Snapshot;
  } catch {
    return null; // pas encore d'instantané
  }
}

export async function readHistory(): Promise<History> {
  try {
    const raw = await fs.readFile(HISTORY_PATH, "utf8");
    return JSON.parse(raw) as History;
  } catch {
    return { points: [] };
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

    const [rankData, champ, recent] = await Promise.all([
      getSoloRankData(gameName, tagLine),
      p.championOverride
        ? getChampion(gameName, tagLine, p.championOverride)
        : getTopChampion(gameName, tagLine),
      getRecentStats(gameName, tagLine),
    ]);

    const prevP = prev?.players[p.pseudo];

    // Stats : winrate de saison (rankData) + KDA/CS récents (recent).
    let stats = prevP?.stats ?? null;
    if (rankData) {
      stats = {
        winrate: rankData.winrate,
        wins: rankData.wins,
        losses: rankData.losses,
        games: rankData.wins + rankData.losses,
        kda: recent?.kda ?? prevP?.stats?.kda ?? null,
        csPerMin: recent?.csPerMin ?? prevP?.stats?.csPerMin ?? null,
        recentWinrate: recent?.winrate ?? prevP?.stats?.recentWinrate ?? null,
        recentGames: recent?.games ?? prevP?.stats?.recentGames ?? 0,
      };
    }

    // Repli sur l'ancienne valeur si l'appel échoue (Riot down / clé expirée).
    result.players[p.pseudo] = {
      pseudo: p.pseudo,
      rang: rankData?.label ?? prevP?.rang ?? null,
      rankValue: rankData?.value ?? prevP?.rankValue ?? null,
      champ: champ ?? prevP?.champ ?? null,
      stats,
    };

    if (rankData || champ) anySuccess = true;
  }

  const now = new Date().toISOString();
  if (anySuccess) result.updatedAt = now;

  await fs.mkdir(path.dirname(SNAPSHOT_PATH), { recursive: true });
  await fs.writeFile(SNAPSHOT_PATH, JSON.stringify(result, null, 2), "utf8");

  // Historise un point — UNIQUEMENT si au moins un joueur a changé de LP
  // (sinon on empilerait des points identiques = lignes plates inutiles).
  if (anySuccess) {
    const history = await readHistory();
    const values = Object.fromEntries(
      Object.values(result.players).map((p) => [p.pseudo, p.rankValue]),
    );
    const last = history.points[history.points.length - 1];
    const changed =
      !last || Object.keys(values).some((k) => values[k] !== last.values[k]);

    if (changed) {
      history.points.push({ t: now, values });
      if (history.points.length > MAX_HISTORY_POINTS) {
        history.points = history.points.slice(-MAX_HISTORY_POINTS);
      }
      await fs.writeFile(HISTORY_PATH, JSON.stringify(history), "utf8");
    }
  }

  return result;
}
