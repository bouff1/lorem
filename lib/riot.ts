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

interface LeagueEntry {
  queueType: string;
  tier: string;
  rank: string;
  leaguePoints: number;
  wins: number;
  losses: number;
}

async function riotFetch<T>(url: string, revalidateSeconds = 3600): Promise<T | null> {
  if (!API_KEY) return null;
  try {
    const res = await fetch(url, {
      headers: { "X-Riot-Token": API_KEY },
      next: { revalidate: revalidateSeconds },
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
