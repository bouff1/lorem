import Image from "next/image";
import type { Player, Role } from "@/data/team";

const roleColors: Record<Role, string> = {
  Top: "text-neon-red border-neon-red/40",
  Jungle: "text-neon-green border-neon-green/40",
  Mid: "text-neon-cyan border-neon-cyan/40",
  ADC: "text-neon-gold border-neon-gold/40",
  Support: "text-neon-magenta border-neon-magenta/40",
};

export default function PlayerCard({ player }: { player: Player }) {
  const initials = player.pseudo.slice(0, 2).toUpperCase();

  return (
    <article className="card group flex flex-col overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-neon-cyan/50 hover:shadow-neon-cyan">
      {/* Visuel / avatar */}
      <div className="relative flex h-44 items-center justify-center bg-gradient-to-br from-bg-soft to-bg">
        {player.photo ? (
          <Image
            src={player.photo}
            alt={player.pseudo}
            fill
            className="object-cover"
          />
        ) : (
          <span className="font-display text-5xl font-black gradient-text">
            {initials}
          </span>
        )}
        <span
          className={`absolute left-3 top-3 rounded-md border bg-bg/70 px-2 py-1 font-display text-xs font-bold uppercase tracking-wider ${roleColors[player.role]}`}
        >
          {player.role}
        </span>
      </div>

      {/* Infos */}
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-xl font-bold tracking-wide text-white">
          {player.pseudo}
        </h3>
        {player.nomReel && (
          <p className="text-sm text-gray-500">{player.nomReel}</p>
        )}

        <p className="mt-3 text-sm font-medium text-neon-cyan">{player.rang}</p>

        <div className="mt-auto flex flex-wrap items-center gap-2 pt-5">
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
              className="rounded-md border border-bg-border px-3 py-1.5 text-xs font-medium text-gray-300 transition-colors hover:border-neon-magenta hover:text-neon-magenta"
            >
              {social.label}
            </a>
          ))}
        </div>
      </div>
    </article>
  );
}
