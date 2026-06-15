// =============================================================================
//  Instantané des données Riot (stocké via lib/store : KV sur Vercel, sinon
//  fichiers en local/Docker).
//
//  - refreshSnapshot() : récupère rang + champion + stats des 5 comptes.
//    Si un appel Riot échoue, on CONSERVE l'ancienne valeur (résilience).
//  - readSnapshot()/readHistory() : lecture rapide pour le site.
// =============================================================================

import { players } from "@/data/team";
import {
  getSoloRankData,
  getTopChampion,
  getChampion,
  getRecentStats,
  type TopChampion,
} from "./riot";
import { readJSON, writeJSON } from "./store";

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
  updatedAt: string | null;
  players: Record<string, PlayerSnapshot>;
}

/** Un point d'historique : un instant + la valeur de rang de chaque joueur. */
export interface HistoryPoint {
  t: string;
  values: Record<string, number | null>;
}
export interface History {
  points: HistoryPoint[];
}

const MAX_HISTORY_POINTS = 2000;
const SEASON_START_MS = Date.parse("2026-01-10T12:00:00Z");

export async function readSnapshot(): Promise<Snapshot | null> {
  return readJSON<Snapshot>("snapshot");
}

export async function readHistory(): Promise<History> {
  return (await readJSON<History>("history")) ?? { points: [] };
}

/**
 * Historique de démarrage : chaque joueur part de Fer IV (0) en début de saison
 * et grimpe jusqu'à sa valeur actuelle (comme l'affichage OP.GG).
 */
function buildSeedHistory(current: Record<string, number | null>, nowISO: string): History {
  const keys = Object.keys(current).filter((k) => typeof current[k] === "number");
  const N = 60;
  const end = Date.parse(nowISO);

  const series: Record<string, number[]> = {};
  for (const k of keys) {
    const target = current[k] as number;
    const raw = [0];
    for (let i = 1; i < N; i++) raw.push(raw[i - 1] + (Math.random() - 0.25));
    const min = Math.min(...raw);
    const shifted = raw.map((r) => r - min);
    const lastv = shifted[N - 1] || 1;
    series[k] = shifted.map((r, i) =>
      i === 0 ? 0 : i === N - 1 ? target : Math.max(0, Math.round((r / lastv) * target + (Math.random() * 36 - 18))),
    );
  }

  const points: HistoryPoint[] = [];
  for (let i = 0; i < N; i++) {
    const t = new Date(SEASON_START_MS + ((end - SEASON_START_MS) * i) / (N - 1)).toISOString();
    const values: Record<string, number | null> = {};
    for (const k of keys) values[k] = series[k][i];
    points.push({ t, values });
  }
  return { points };
}

export async function refreshSnapshot(): Promise<Snapshot> {
  const prev = await readSnapshot();

  // Tous les joueurs en parallèle (rapide pour rester sous le timeout serverless).
  const fetched = await Promise.all(
    players.map(async (p) => {
      if (!p.riotId) return { p, rankData: null, champ: null, recent: null };
      const { gameName, tagLine } = p.riotId;
      const [rankData, champ, recent] = await Promise.all([
        getSoloRankData(gameName, tagLine),
        p.championOverride
          ? getChampion(gameName, tagLine, p.championOverride)
          : getTopChampion(gameName, tagLine),
        getRecentStats(gameName, tagLine),
      ]);
      return { p, rankData, champ, recent };
    }),
  );

  const result: Snapshot = {
    updatedAt: prev?.updatedAt ?? null,
    players: { ...(prev?.players ?? {}) },
  };
  let anySuccess = false;

  for (const { p, rankData, champ, recent } of fetched) {
    if (!p.riotId) continue;
    const prevP = prev?.players[p.pseudo];

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
  await writeJSON("snapshot", result);

  // Historique du graphe.
  if (anySuccess) {
    const values = Object.fromEntries(
      Object.values(result.players).map((p) => [p.pseudo, p.rankValue]),
    );
    let history = await readHistory();

    if (history.points.length === 0) {
      // Premier passage : on sème la courbe de saison (Fer IV -> actuel).
      history = buildSeedHistory(values, now);
      await writeJSON("history", history);
    } else {
      // Ensuite : un point UNIQUEMENT si un joueur a changé de LP.
      const last = history.points[history.points.length - 1];
      const changed = Object.keys(values).some((k) => values[k] !== last.values[k]);
      if (changed) {
        history.points.push({ t: now, values });
        if (history.points.length > MAX_HISTORY_POINTS) {
          history.points = history.points.slice(-MAX_HISTORY_POINTS);
        }
        await writeJSON("history", history);
      }
    }
  }

  return result;
}
