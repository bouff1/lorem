import Image from "next/image";
import { team, matches, type Match, type MatchType } from "@/data/team";

const typeColors: Record<MatchType, string> = {
  Officiel: "text-neon-gold border-neon-gold/40",
  Scrim: "text-neon-cyan border-neon-cyan/40",
  Clash: "text-neon-magenta border-neon-magenta/40",
};

/** Petit logo d'équipe : image si dispo, sinon pastille avec initiales. */
function TeamBadge({ name, logo }: { name: string; logo?: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-bg-border bg-bg-soft">
        {logo ? (
          <Image src={logo} alt={name} width={44} height={44} className="h-full w-full object-cover" />
        ) : (
          <span className="font-display text-sm font-bold gradient-text">
            {name.slice(0, 2).toUpperCase()}
          </span>
        )}
      </div>
      <span className="font-display font-bold tracking-wide text-white">{name}</span>
    </div>
  );
}

function TypeBadge({ type }: { type: MatchType }) {
  return (
    <span
      className={`rounded-md border bg-bg/60 px-2 py-0.5 font-display text-[11px] font-bold uppercase tracking-wider ${typeColors[type]}`}
    >
      {type}
    </span>
  );
}

/** Bandeau "Prochain match" mis en avant. */
function NextMatch({ match }: { match: Match }) {
  return (
    <div className="card relative overflow-hidden p-6 shadow-neon-magenta">
      <div className="absolute inset-x-0 top-0 h-1 bg-neon-gradient" />
      <p className="mb-4 font-display text-xs font-bold uppercase tracking-[0.3em] text-neon-cyan">
        Prochain match
      </p>
      <div className="flex flex-col items-center gap-5 sm:flex-row sm:justify-between">
        <TeamBadge name={team.nom} logo={team.logo} />
        <div className="text-center">
          <p className="font-display text-2xl font-black gradient-text">VS</p>
          <p className="mt-1 text-sm text-gray-400">
            {match.date}
            {match.heure ? ` · ${match.heure}` : ""}
          </p>
          <div className="mt-2 flex justify-center">
            <TypeBadge type={match.type} />
          </div>
        </div>
        <TeamBadge name={match.adversaire} logo={match.adversaireLogo} />
      </div>
      {match.competition && (
        <p className="mt-4 text-center text-xs text-gray-500">{match.competition}</p>
      )}
    </div>
  );
}

/** Ligne de match (à venir ou résultat). */
function MatchRow({ match }: { match: Match }) {
  const win = match.resultat === "victoire";
  const played = Boolean(match.score);

  return (
    <li className="card flex items-center gap-4 p-4">
      <div className="w-28 shrink-0 text-sm text-gray-400">
        <p className="font-medium text-gray-300">{match.date}</p>
        {match.heure && <p className="text-xs">{match.heure}</p>}
      </div>

      <div className="flex flex-1 items-center gap-2 truncate">
        <span className="truncate font-display font-bold tracking-wide text-white">
          {team.nom.split(" ")[0]}
        </span>
        <span className="text-gray-600">vs</span>
        <span className="truncate text-gray-300">{match.adversaire}</span>
        <span className="ml-2 hidden sm:inline">
          <TypeBadge type={match.type} />
        </span>
      </div>

      {played ? (
        <span
          className={`shrink-0 font-display text-lg font-bold tracking-widest ${
            win ? "text-neon-green" : "text-neon-red"
          }`}
        >
          {match.score}
        </span>
      ) : (
        <span className="shrink-0 font-display text-xs font-bold uppercase tracking-wider text-neon-cyan">
          À venir
        </span>
      )}
    </li>
  );
}

export default function Schedule() {
  const upcoming = matches.filter((m) => !m.score);
  const played = matches.filter((m) => m.score);
  const [next, ...restUpcoming] = upcoming;

  return (
    <section id="matchs" className="bg-bg-soft py-24">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <div className="mb-12 text-center">
          <h2 className="section-title gradient-text">Calendrier des matchs</h2>
          <p className="mt-3 text-gray-400">Nos prochaines rencontres et nos résultats.</p>
        </div>

        {next && (
          <div className="mb-12">
            <NextMatch match={next} />
          </div>
        )}

        {restUpcoming.length > 0 && (
          <div className="mb-12">
            <h3 className="mb-4 font-display text-sm font-bold uppercase tracking-widest text-gray-400">
              À venir
            </h3>
            <ul className="space-y-3">
              {restUpcoming.map((m, i) => (
                <MatchRow key={`up-${i}`} match={m} />
              ))}
            </ul>
          </div>
        )}

        {played.length > 0 && (
          <div>
            <h3 className="mb-4 font-display text-sm font-bold uppercase tracking-widest text-gray-400">
              Résultats
            </h3>
            <ul className="space-y-3">
              {played.map((m, i) => (
                <MatchRow key={`pl-${i}`} match={m} />
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
