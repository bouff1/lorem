import Image from "next/image";
import type { Player, Role } from "@/data/team";
import type { TopChampion } from "@/lib/riot";
import type { PlayerStats } from "@/lib/snapshot";

const roleColors: Record<Role, string> = {
  Top: "text-neon-red border-neon-red/40",
  Jungle: "text-neon-green border-neon-green/40",
  Mid: "text-neon-cyan border-neon-cyan/40",
  ADC: "text-neon-gold border-neon-gold/40",
  Support: "text-neon-magenta border-neon-magenta/40",
};

export default function PlayerCard({
  player,
  liveRang,
  champ,
  stats,
}: {
  player: Player;
  /** Rang récupéré en direct via l'API Riot ; null => on affiche player.rang. */
  liveRang?: string | null;
  /** Champion le plus maîtrisé ; sert de fond de carte. */
  champ?: TopChampion | null;
  /** Stats du joueur (winrate, KDA, CS/min). */
  stats?: PlayerStats | null;
}) {
  const rang = liveRang ?? player.rang;
  const isLive = Boolean(liveRang);
  // Couleur du winrate : vert si ≥ 50 %, rouge sinon.
  const wrColor = stats && stats.winrate >= 50 ? "text-neon-green" : "text-neon-red";

  return (
    <article className="card group relative h-80 overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-neon-cyan/50 hover:shadow-neon-cyan">
      {/* Fond : splash art du champion le plus maîtrisé */}
      {champ ? (
        <Image
          src={champ.splashUrl}
          alt={`${player.pseudo} — ${champ.name}`}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover object-top opacity-80 transition-transform duration-500 group-hover:scale-105"
        />
      ) : player.photo ? (
        <Image src={player.photo} alt={player.pseudo} fill className="object-cover" />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-bg-soft to-bg" />
      )}

      {/* Voile dégradé sombre (fixe, indépendant du thème) pour la lisibilité */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/85 to-[#0a0a0f]/10" />

      {/* Contenu */}
      <div className="relative z-10 flex h-full flex-col p-5">
        <div className="flex items-start justify-between gap-2">
          <span
            className={`rounded-md border bg-black/60 px-2 py-1 font-display text-xs font-bold uppercase tracking-wider ${roleColors[player.role]}`}
          >
            {player.role}
          </span>
          {champ && (
            <span className="rounded-md border border-white/15 bg-black/60 px-2 py-1 text-[11px] font-medium text-gray-200">
              {champ.name}
              {champ.points > 0 ? ` · ${Math.round(champ.points / 1000)}k` : ""}
            </span>
          )}
        </div>

        <div className="mt-auto">
          <h3 className="flex items-center gap-2 font-display text-2xl font-bold tracking-wide text-white">
            {player.pseudo}
            {player.isCaptain && (
              <span
                title="Capitaine de l'équipe"
                className="rounded border border-neon-gold/50 bg-neon-gold/10 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-neon-gold"
              >
                ★ Cap
              </span>
            )}
          </h3>
          {player.nomReel && <p className="text-sm text-gray-400">{player.nomReel}</p>}

          <p className="mt-2 flex items-center gap-2 text-sm font-medium text-neon-cyan">
            {rang}
            {isLive && (
              <span
                title="Rang en direct via l'API Riot"
                className="inline-block h-2 w-2 rounded-full bg-neon-green shadow-[0_0_8px_rgba(52,211,153,0.8)]"
              />
            )}
          </p>

          {stats && (
            <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-300">
              <span>
                <span className={`font-bold ${wrColor}`}>{stats.winrate}%</span> WR
              </span>
              <span className="text-gray-600">·</span>
              <span>
                <span className="text-neon-green">{stats.wins}V</span>{" "}
                <span className="text-neon-red">{stats.losses}D</span>
              </span>
              {stats.kda !== null && (
                <>
                  <span className="text-gray-600">·</span>
                  <span>
                    KDA <span className="font-bold text-white">{stats.kda}</span>
                  </span>
                </>
              )}
              {stats.csPerMin !== null && (
                <>
                  <span className="text-gray-600">·</span>
                  <span>{stats.csPerMin} CS/min</span>
                </>
              )}
            </div>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <a
              href={player.opggUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-md bg-neon-gradient px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-[#0a0a0f] transition-transform hover:scale-105"
            >
              OP.GG
            </a>
            {player.socials?.map((social) => (
              <a
                key={social.url}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-md border border-white/15 bg-black/40 px-3 py-1.5 text-xs font-medium text-gray-200 transition-colors hover:border-neon-magenta hover:text-neon-magenta"
              >
                {social.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}
