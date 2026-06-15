// =============================================================================
//  Client API Riot Games (côté serveur uniquement).
//  Récupère le rang Solo/Duo d'un joueur à partir de son Riot ID.
//
//  - Lit la clé dans process.env.RIOT_API_KEY (fichier .env.local).
//  - Renvoie null en cas d'absence de clé, d'erreur ou de joueur introuvable
//    => l'appelant retombe alors sur la valeur saisie à la main (fallback).
//  - Met les réponses en cache (revalidation) pour respecter les quotas Riot.
// =============================================================================

const API_KEY = process.env.RIOT_API_KEY;
const PLATFORM = process.env.RIOT_PLATFORM ?? "euw1"; // euw1, eun1, na1, kr...
const REGION = process.env.RIOT_REGION ?? "europe"; // europe, americas, asia
const DDRAGON = "https://ddragon.leagueoflegends.com";

interface LeagueEntry {
  queueType: string;
  tier: string;
  rank: string;
  leaguePoints: number;
  wins: number;
  losses: number;
}

// Appels Riot toujours frais : c'est le planificateur (toutes les 10 min) qui
// les appelle, l'instantané sert ensuite de cache au site.
async function riotFetch<T>(url: string): Promise<T | null> {
  if (!API_KEY) return null;
  try {
    const res = await fetch(url, {
      headers: { "X-Riot-Token": API_KEY },
      cache: "no-store",
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

/** Riot ID (gameName + tagLine) -> PUUID. */
async function getPuuid(gameName: string, tagLine: string): Promise<string | null> {
  const url = `https://${REGION}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(
    gameName,
  )}/${encodeURIComponent(tagLine)}`;
  const data = await riotFetch<{ puuid: string }>(url);
  return data?.puuid ?? null;
}

/** Met "DIAMOND" -> "Diamond". */
function prettyTier(tier: string): string {
  return tier.charAt(0) + tier.slice(1).toLowerCase();
}

export interface RankData {
  tier: string; // GOLD, DIAMOND, MASTER...
  division: string; // I, II, III, IV
  lp: number;
  /** Valeur numérique sur l'échelle complète (pour le graphe). */
  value: number;
  /** Libellé affiché, ex. "Diamond II — 45 LP". */
  label: string;
  /** Stats de saison Solo/Duo. */
  wins: number;
  losses: number;
  winrate: number; // pourcentage entier 0-100
}

const RANK_TIERS = [
  "IRON",
  "BRONZE",
  "SILVER",
  "GOLD",
  "PLATINUM",
  "EMERALD",
  "DIAMOND",
]; // 7 paliers de 400 (4 divisions × 100 LP)
const DIV_OFFSET: Record<string, number> = { I: 3, II: 2, III: 1, IV: 0 };
const APEX_BASE = RANK_TIERS.length * 400; // 2800 = bas de Master

/** Convertit tier/division/LP en une valeur numérique croissante et continue. */
export function rankToValue(tier: string, division: string, lp: number): number {
  if (["MASTER", "GRANDMASTER", "CHALLENGER"].includes(tier)) return APEX_BASE + lp;
  const ti = RANK_TIERS.indexOf(tier);
  if (ti < 0) return 0;
  return ti * 400 + (DIV_OFFSET[division] ?? 0) * 100 + lp;
}

/** Libellé court d'une valeur numérique (pour l'axe du graphe). */
export function valueToShortLabel(value: number): string {
  if (value >= APEX_BASE) return "Master+";
  const names = ["Iron", "Bronze", "Silver", "Gold", "Plat", "Emerald", "Diamond"];
  const i = Math.max(0, Math.min(6, Math.floor(value / 400)));
  const div = ["IV", "III", "II", "I"][Math.max(0, Math.min(3, Math.floor((value % 400) / 100)))];
  return `${names[i]} ${div}`;
}

/** Données de rang Solo/Duo structurées, ou null si introuvable / non classé. */
export async function getSoloRankData(
  gameName: string,
  tagLine: string,
): Promise<RankData | null> {
  const puuid = await getPuuid(gameName, tagLine);
  if (!puuid) return null;

  const url = `https://${PLATFORM}.api.riotgames.com/lol/league/v4/entries/by-puuid/${puuid}`;
  const entries = await riotFetch<LeagueEntry[]>(url);
  if (!entries) return null;

  const solo = entries.find((e) => e.queueType === "RANKED_SOLO_5x5");
  if (!solo) return null;

  const games = solo.wins + solo.losses;
  return {
    tier: solo.tier,
    division: solo.rank,
    lp: solo.leaguePoints,
    value: rankToValue(solo.tier, solo.rank, solo.leaguePoints),
    label: `${prettyTier(solo.tier)} ${solo.rank} — ${solo.leaguePoints} LP`,
    wins: solo.wins,
    losses: solo.losses,
    winrate: games > 0 ? Math.round((solo.wins / games) * 100) : 0,
  };
}

// --- Stats sur les parties récentes (KDA, CS/min) ---------------------------

export interface RecentStats {
  games: number;
  kills: number;
  deaths: number;
  assists: number;
  kda: number;
  csPerMin: number;
  winrate: number; // sur ces parties récentes
}

interface MatchParticipant {
  puuid: string;
  kills: number;
  deaths: number;
  assists: number;
  totalMinionsKilled: number;
  neutralMinionsKilled?: number;
  win: boolean;
}
interface MatchDto {
  info: { gameDuration: number; participants: MatchParticipant[] };
}

/**
 * Agrège les stats des `count` dernières parties classées Solo/Duo (queue 420).
 * Appels séquentiels pour rester sous les quotas Riot.
 */
export async function getRecentStats(
  gameName: string,
  tagLine: string,
  count = 12,
): Promise<RecentStats | null> {
  const puuid = await getPuuid(gameName, tagLine);
  if (!puuid) return null;

  const ids = await riotFetch<string[]>(
    `https://${REGION}.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?queue=420&count=${count}`,
  );
  if (!ids || ids.length === 0) return null;

  let k = 0, d = 0, a = 0, cs = 0, durationSec = 0, wins = 0, nb = 0;
  for (const id of ids) {
    const m = await riotFetch<MatchDto>(
      `https://${REGION}.api.riotgames.com/lol/match/v5/matches/${id}`,
    );
    const me = m?.info.participants.find((p) => p.puuid === puuid);
    if (!me) continue;
    k += me.kills;
    d += me.deaths;
    a += me.assists;
    cs += me.totalMinionsKilled + (me.neutralMinionsKilled ?? 0);
    durationSec += m!.info.gameDuration;
    if (me.win) wins++;
    nb++;
  }
  if (nb === 0) return null;

  const minutes = durationSec / 60;
  return {
    games: nb,
    kills: +(k / nb).toFixed(1),
    deaths: +(d / nb).toFixed(1),
    assists: +(a / nb).toFixed(1),
    kda: +((d === 0 ? k + a : (k + a) / d)).toFixed(2),
    csPerMin: minutes > 0 ? +(cs / minutes).toFixed(1) : 0,
    winrate: Math.round((wins / nb) * 100),
  };
}

/** Rang Solo/Duo formaté (ex. "Diamond II — 45 LP"), ou null. */
export async function getSoloRank(gameName: string, tagLine: string): Promise<string | null> {
  const data = await getSoloRankData(gameName, tagLine);
  return data?.label ?? null;
}

// --- Champion le plus maîtrisé (pour le fond de carte) ----------------------

export interface TopChampion {
  /** Clé Data Dragon (ex. "Pantheon") — sert à l'URL du splash. */
  id: string;
  /** Nom affiché (ex. "Pantheon"). */
  name: string;
  /** Points de maîtrise. */
  points: number;
  /** URL du splash art officiel. */
  splashUrl: string;
}

/** Dernière version de Data Dragon (mise en cache 24h). */
async function ddragonVersion(): Promise<string> {
  try {
    const res = await fetch(`${DDRAGON}/api/versions.json`, {
      next: { revalidate: 86400 },
    });
    if (!res.ok) return "15.1.1";
    const versions = (await res.json()) as string[];
    return versions[0] ?? "15.1.1";
  } catch {
    return "15.1.1";
  }
}

/** Map championId (numérique) -> { id, name } via Data Dragon (cache 24h). */
async function championIdMap(): Promise<Record<number, { id: string; name: string }>> {
  const version = await ddragonVersion();
  try {
    const res = await fetch(`${DDRAGON}/cdn/${version}/data/fr_FR/champion.json`, {
      next: { revalidate: 86400 },
    });
    if (!res.ok) return {};
    const data = (await res.json()) as {
      data: Record<string, { key: string; id: string; name: string }>;
    };
    const map: Record<number, { id: string; name: string }> = {};
    for (const champ of Object.values(data.data)) {
      map[Number(champ.key)] = { id: champ.id, name: champ.name };
    }
    return map;
  } catch {
    return {};
  }
}

/**
 * Renvoie le champion le plus maîtrisé du joueur (avec son splash art),
 * ou null si introuvable / erreur.
 */
export async function getTopChampion(
  gameName: string,
  tagLine: string,
): Promise<TopChampion | null> {
  const puuid = await getPuuid(gameName, tagLine);
  if (!puuid) return null;

  const url = `https://${PLATFORM}.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-puuid/${puuid}/top?count=1`;
  const top = await riotFetch<Array<{ championId: number; championPoints: number }>>(url);
  if (!top || top.length === 0) return null;

  const map = await championIdMap();
  const champ = map[top[0].championId];
  if (!champ) return null;

  return {
    id: champ.id,
    name: champ.name,
    points: top[0].championPoints,
    splashUrl: `${DDRAGON}/cdn/img/champion/splash/${champ.id}_0.jpg`,
  };
}

/**
 * Renvoie un champion imposé par sa clé Data Dragon (ex. "Hecarim"), avec le
 * splash et, si possible, les points de maîtrise réels du joueur sur ce champion.
 * Le splash fonctionne même sans clé Riot valide (Data Dragon est public).
 */
export async function getChampion(
  gameName: string,
  tagLine: string,
  championKey: string,
): Promise<TopChampion | null> {
  const map = await championIdMap();
  const found = Object.entries(map).find(
    ([, v]) => v.id.toLowerCase() === championKey.toLowerCase(),
  );
  if (!found) return null;

  const championId = Number(found[0]);
  const { id, name } = found[1];

  // Points de maîtrise réels sur ce champion (0 si jamais joué / pas de clé).
  let points = 0;
  const puuid = await getPuuid(gameName, tagLine);
  if (puuid) {
    const m = await riotFetch<{ championPoints: number }>(
      `https://${PLATFORM}.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-puuid/${puuid}/by-champion/${championId}`,
    );
    if (m) points = m.championPoints;
  }

  return {
    id,
    name,
    points,
    splashUrl: `${DDRAGON}/cdn/img/champion/splash/${id}_0.jpg`,
  };
}
