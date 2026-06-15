import { standings } from "@/data/team";

export default function Standings() {
  return (
    <section id="classement" className="mx-auto max-w-4xl px-4 py-24 sm:px-6">
      <div className="mb-12 text-center">
        <h2 className="section-title gradient-text">Classement Worlds</h2>
        <p className="mt-3 text-gray-400">Notre position dans la compétition.</p>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-bg-border font-display text-xs uppercase tracking-wider text-gray-400">
              <th className="px-4 py-3">#</th>
              <th className="px-4 py-3">Équipe</th>
              <th className="px-4 py-3 text-center">V</th>
              <th className="px-4 py-3 text-center">D</th>
              <th className="px-4 py-3 text-center">Pts</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((row) => (
              <tr
                key={row.position}
                className={`border-b border-bg-border/60 last:border-0 ${
                  row.estNous
                    ? "bg-neon-cyan/5 text-white"
                    : "text-gray-300"
                }`}
              >
                <td className="px-4 py-3 font-display font-bold">
                  {row.estNous ? (
                    <span className="text-neon-cyan">{row.position}</span>
                  ) : (
                    row.position
                  )}
                </td>
                <td className="px-4 py-3 font-medium">
                  {row.estNous ? (
                    <span className="gradient-text font-display font-bold">
                      {row.equipe}
                    </span>
                  ) : (
                    row.equipe
                  )}
                </td>
                <td className="px-4 py-3 text-center text-neon-green">
                  {row.victoires}
                </td>
                <td className="px-4 py-3 text-center text-neon-red">
                  {row.defaites}
                </td>
                <td className="px-4 py-3 text-center font-display font-bold">
                  {row.points ?? "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
