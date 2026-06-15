import { players } from "@/data/team";
import { getSoloRank } from "@/lib/riot";
import PlayerCard from "./PlayerCard";

export default async function Roster() {
  // Récupère le rang en direct (API Riot) pour chaque joueur, en parallèle.
  // Renvoie null si pas de Riot ID / clé absente / erreur => repli sur `rang`.
  const liveRanks = await Promise.all(
    players.map((p) =>
      p.riotId ? getSoloRank(p.riotId.gameName, p.riotId.tagLine) : Promise.resolve(null),
    ),
  );

  return (
    <section id="joueurs" className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
      <div className="mb-12 text-center">
        <h2 className="section-title gradient-text">Nos Joueurs</h2>
        <p className="mt-3 text-gray-400">Le roster qui défend nos couleurs.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {players.map((player, i) => (
          <PlayerCard key={player.pseudo} player={player} liveRang={liveRanks[i]} />
        ))}
      </div>
    </section>
  );
}
