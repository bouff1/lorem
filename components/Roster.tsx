import { players } from "@/data/team";
import { readSnapshot } from "@/lib/snapshot";
import PlayerCard from "./PlayerCard";

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

  return (
    <section id="joueurs" className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
      <div className="mb-12 text-center">
        <h2 className="section-title gradient-text">Nos Joueurs</h2>
        <p className="mt-3 text-gray-400">Le roster qui défend nos couleurs.</p>
        {maj && (
          <p className="mt-2 text-xs text-gray-600">Données Riot mises à jour le {maj}</p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {players.map((player) => {
          const s = snap?.players[player.pseudo];
          return (
            <PlayerCard
              key={player.pseudo}
              player={player}
              liveRang={s?.rang}
              champ={s?.champ}
            />
          );
        })}
      </div>
    </section>
  );
}
