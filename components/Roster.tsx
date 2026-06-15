import { players } from "@/data/team";
import PlayerCard from "./PlayerCard";

export default function Roster() {
  return (
    <section id="joueurs" className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
      <div className="mb-12 text-center">
        <h2 className="section-title gradient-text">Nos Joueurs</h2>
        <p className="mt-3 text-gray-400">Le roster qui défend nos couleurs.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {players.map((player) => (
          <PlayerCard key={player.pseudo} player={player} />
        ))}
      </div>
    </section>
  );
}
