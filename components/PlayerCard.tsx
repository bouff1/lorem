import Image from "next/image";
import type { Player, Role } from "@/data/team";
import type { TopChampion } from "@/lib/riot";

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
}: {
  player: Player;
  /** Rang récupéré en direct via l'API Riot ; null => on affiche player.rang. */
  liveRang?: string | null;
  /** Champion le plus maîtrisé ; sert de fond de carte. */
  champ?: TopChampion | null;
}) {
  const rang = liveRang ?? player.rang;
  const isLive = Boolean(liveRang);

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

      {/* Voile dégradé pour la lisibilité du texte */}
      <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/85 to-bg/10" />

      {/* Contenu */}
      <div className="relative z-10 flex h-full flex-col p-5">
        <div className="flex items-start justify-between gap-2">
          <span
            className={`rounded-md border bg-bg/70 px-2 py-1 font-display text-xs font-bold uppercase tracking-wider ${roleColors[player.role]}`}
          >
            {player.role}
          </span>
          {champ && (
            <span className="rounded-md border border-bg-border bg-bg/70 px-2 py-1 text-[11px] font-medium text-gray-300">
              {champ.name}
              {champ.points > 0 ? ` · ${Math.round(champ.points / 1000)}k` : ""}
            </span>
          )}
        </div>

        <div className="mt-auto">
          <h3 className="font-display text-2xl font-bold tracking-wide text-white">
            {player.pseudo}
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

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <a
              href={player.opggUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-md bg-neon-gradient px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-bg transition-transform hover:scale-105"
            >
              OP.GG
            </a>
            {player.socials?.map((social) => (
              <a
                key={social.url}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-md border border-bg-border bg-bg/50 px-3 py-1.5 text-xs font-medium text-gray-300 transition-colors hover:border-neon-magenta hover:text-neon-magenta"
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
