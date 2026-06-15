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

/**
 * Renvoie le rang Solo/Duo formaté (ex. "Diamond II — 45 LP"),
 * ou null si introuvable / non classé / erreur.
 */
export async function getSoloRank(gameName: string, tagLine: string): Promise<string | null> {
  const puuid = await getPuuid(gameName, tagLine);
  if (!puuid) return null;

  const url = `https://${PLATFORM}.api.riotgames.com/lol/league/v4/entries/by-puuid/${puuid}`;
  const entries = await riotFetch<LeagueEntry[]>(url);
  if (!entries) return null;

  const solo = entries.find((e) => e.queueType === "RANKED_SOLO_5x5");
  if (!solo) return null;

  return `${prettyTier(solo.tier)} ${solo.rank} — ${solo.leaguePoints} LP`;
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
