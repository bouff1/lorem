import { results } from "@/data/team";

export default function Results() {
  return (
    <section id="resultats" className="bg-bg-soft py-24">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <div className="mb-12 text-center">
          <h2 className="section-title gradient-text">Derniers Résultats</h2>
          <p className="mt-3 text-gray-400">Nos matchs les plus récents.</p>
        </div>

        <ul className="space-y-3">
          {results.map((match, i) => {
            const win = match.resultat === "victoire";
            return (
              <li
                key={i}
                className="card flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-4">
                  <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-md border font-display text-sm font-bold ${
                      win
                        ? "border-neon-green/50 text-neon-green"
                        : "border-neon-red/50 text-neon-red"
                    }`}
                  >
                    {win ? "V" : "D"}
                  </span>
                  <div>
                    <p className="font-display font-bold tracking-wide text-white">
                      OSTAP <span className="text-gray-500">vs</span>{" "}
                      {match.adversaire}
                    </p>
                    <p className="text-sm text-gray-500">
                      {match.date}
                      {match.competition ? ` · ${match.competition}` : ""}
                    </p>
                  </div>
                </div>

                <span
                  className={`self-start rounded-md px-4 py-1.5 font-display text-lg font-bold tracking-widest sm:self-auto ${
                    win ? "text-neon-green" : "text-neon-red"
                  }`}
                >
                  {match.score}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
