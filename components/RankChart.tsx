import { players } from "@/data/team";
import { readHistory, readSnapshot } from "@/lib/snapshot";
import { valueToShortLabel } from "@/lib/riot";
import RankChartClient from "./RankChartClient";

// Une couleur distincte par joueur.
const COLORS = ["#22d3ee", "#d946ef", "#fbbf24", "#34d399", "#fb7185"];

export default async function RankChart() {
  const [history, snap] = await Promise.all([readHistory(), readSnapshot()]);
  const points = history.points;
  const roster = players.filter((p) => p.riotId);

  const allVals: number[] = [];
  for (const pt of points) {
    for (const p of roster) {
      const v = pt.values[p.pseudo];
      if (typeof v === "number") allVals.push(v);
    }
  }
  const hasData = points.length >= 1 && allVals.length > 0;

  // Échelle Y fixe (ne bouge pas quand on masque une courbe via la légende).
  const minRaw = hasData ? Math.min(...allVals) : 0;
  const maxRaw = hasData ? Math.max(...allVals) : 100;
  const span = Math.max(100, maxRaw - minRaw);
  // Faible marge en bas (évite la grande bande vide), un peu plus en haut.
  const yMin = minRaw - span * 0.04;
  const yMax = maxRaw + span * 0.1;
  const ticks = Array.from({ length: 5 }, (_, k) => {
    const value = yMin + (k * (yMax - yMin)) / 4;
    return { value, label: valueToShortLabel(value) };
  });

  const times = points.map((pt) => pt.t);
  const series = roster.map((p, idx) => ({
    pseudo: p.pseudo,
    color: COLORS[idx % COLORS.length],
    current: snap?.players[p.pseudo]?.rang ?? "—",
    values: points.map((pt) =>
      typeof pt.values[p.pseudo] === "number" ? (pt.values[p.pseudo] as number) : null,
    ),
  }));

  return (
    <section id="evolution" className="mx-auto max-w-5xl px-4 py-24 sm:px-6">
      <div className="mb-12 text-center">
        <h2 className="section-title gradient-text">Évolution du rang</h2>
        <p className="mt-3 text-gray-400">Progression Solo/Duo des joueurs dans le temps.</p>
      </div>

      <div className="card p-4 sm:p-6">
        {hasData ? (
          <RankChartClient times={times} series={series} yMin={yMin} yMax={yMax} ticks={ticks} />
        ) : (
          <p className="py-12 text-center text-gray-500">
            Pas encore de données — le graphe se remplit automatiquement (un point toutes les 10 min).
          </p>
        )}
      </div>
    </section>
  );
}
