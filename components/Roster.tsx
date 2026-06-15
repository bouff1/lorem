import Image from "next/image";
import { players } from "@/data/team";
import { readSnapshot, type PlayerStats } from "@/lib/snapshot";
import PlayerCard from "./PlayerCard";

// Winrate utilisé pour le MVP : winrate de saison (le vrai, comme sur la carte).
const wr = (s: PlayerStats) => s.winrate;

export default async function Roster() {
  // Lit l'instantané local (rafraîchi en tâche de fond toutes les 10 min).
  // Aucun appel Riot ici => rapide et résistant aux pannes des serveurs Riot.
  const snap = await readSnapshot();

  const maj = snap?.updatedAt
    ? new Date(snap.updatedAt).toLocaleString("fr-FR", {
        day: "2-digit",
        month: "long",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  // --- MVP de la semaine : meilleure combinaison CS/min + winrate ---
  const withStats = players
    .map((p) => ({ p, s: snap?.players[p.pseudo]?.stats, champ: snap?.players[p.pseudo]?.champ }))
    .filter((x): x is { p: (typeof players)[number]; s: PlayerStats; champ: typeof x.champ } =>
      Boolean(x.s),
    );

  let mvp: (typeof withStats)[number] | null = null;
  if (withStats.length > 0) {
    const csVals = withStats.map((x) => x.s.csPerMin ?? 0);
    const wrVals = withStats.map((x) => wr(x.s));
    const gVals = withStats.map((x) => x.s.games);
    const [minCs, maxCs] = [Math.min(...csVals), Math.max(...csVals)];
    const [minWr, maxWr] = [Math.min(...wrVals), Math.max(...wrVals)];
    const [minG, maxG] = [Math.min(...gVals), Math.max(...gVals)];
    const norm = (v: number, mn: number, mx: number) => (mx > mn ? (v - mn) / (mx - mn) : 1);
    let best = -1;
    for (const x of withStats) {
      // Score = moyenne de 3 métriques normalisées : CS/min, winrate, matchs joués.
      const score =
        (norm(x.s.csPerMin ?? 0, minCs, maxCs) +
          norm(wr(x.s), minWr, maxWr) +
          norm(x.s.games, minG, maxG)) /
        3;
      if (score > best) {
        best = score;
        mvp = x;
      }
    }
  }

  return (
    <section id="joueurs" className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
      <div className="mb-12 text-center">
        <h2 className="section-title gradient-text">Nos Joueurs</h2>
        <p className="mt-3 text-gray-400">Le roster qui défend nos couleurs.</p>
        {maj && (
          <p className="mt-2 text-xs text-gray-600">Données Riot mises à jour le {maj}</p>
        )}
      </div>

      {/* MVP de la semaine */}
      {mvp && (
        <div className="card relative mb-10 flex items-center gap-5 overflow-hidden p-5 shadow-neon-magenta">
          <div className="absolute inset-y-0 left-0 w-1 bg-neon-gradient" />
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-neon-gold/40 bg-bg-soft">
            {mvp.champ ? (
              <Image src={mvp.champ.splashUrl} alt={mvp.p.pseudo} fill className="object-cover object-top" />
            ) : (
              <span className="flex h-full w-full items-center justify-center font-display text-lg gradient-text">
                {mvp.p.pseudo.slice(0, 2).toUpperCase()}
              </span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-display text-xs font-bold uppercase tracking-[0.3em] text-neon-gold">
              ★ MVP de la semaine
            </p>
            <p className="mt-1 truncate font-display text-2xl font-bold text-white">{mvp.p.pseudo}</p>
            <p className="text-sm text-gray-400">
              <span className="text-neon-cyan">{mvp.s.csPerMin ?? "—"} CS/min</span>
              <span className="mx-2 text-gray-600">·</span>
              <span className="text-neon-green">{wr(mvp.s)}% WR</span>
              <span className="mx-2 text-gray-600">·</span>
              <span className="text-neon-gold">{mvp.s.games} matchs</span>
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {players.map((player) => {
          const s = snap?.players[player.pseudo];
          return (
            <PlayerCard
              key={player.pseudo}
              player={player}
              liveRang={s?.rang}
              champ={s?.champ}
              stats={s?.stats}
            />
          );
        })}
      </div>
    </section>
  );
}
