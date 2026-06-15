"use client";

import { useMemo, useRef, useState } from "react";

interface Series {
  pseudo: string;
  color: string;
  current: string;
  values: (number | null)[];
}
interface Tick {
  value: number;
  label: string;
}

const W = 880;
const H = 380;
const PAD_L = 64;
const PAD_R = 20;
const PAD_T = 24;
const PAD_B = 44;

export default function RankChartClient({
  times,
  series,
  yMin,
  yMax,
  ticks,
}: {
  times: string[];
  series: Series[];
  yMin: number;
  yMax: number;
  ticks: Tick[];
}) {
  const [hidden, setHidden] = useState<Record<string, boolean>>({});
  const [hover, setHover] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const n = times.length;
  const x = (i: number) => (n <= 1 ? (PAD_L + (W - PAD_R)) / 2 : PAD_L + (i * (W - PAD_L - PAD_R)) / (n - 1));
  const y = (v: number) => PAD_T + ((yMax - v) * (H - PAD_T - PAD_B)) / (yMax - yMin);

  const fmt = (iso: string) =>
    new Date(iso).toLocaleString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  const xLabelIdx = useMemo(
    () => [...new Set([0, Math.floor((n - 1) / 2), n - 1])].filter((i) => i >= 0 && i < n),
    [n],
  );

  const visible = series.filter((s) => !hidden[s.pseudo]);

  // Trouve l'index de point le plus proche du curseur.
  const onMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const svg = svgRef.current;
    if (!svg || n === 0) return;
    const rect = svg.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * W;
    if (n === 1) return setHover(0);
    const i = Math.round(((px - PAD_L) / (W - PAD_L - PAD_R)) * (n - 1));
    setHover(Math.max(0, Math.min(n - 1, i)));
  };

  const buildPath = (s: Series, close: boolean) => {
    const pts = s.values
      .map((v, i) => ({ i, v }))
      .filter((d): d is { i: number; v: number } => typeof d.v === "number");
    if (pts.length === 0) return "";
    let d = pts.map((q, j) => `${j === 0 ? "M" : "L"} ${x(q.i).toFixed(1)} ${y(q.v).toFixed(1)}`).join(" ");
    if (close) {
      const baseline = y(yMin);
      d += ` L ${x(pts[pts.length - 1].i).toFixed(1)} ${baseline.toFixed(1)} L ${x(pts[0].i).toFixed(1)} ${baseline.toFixed(1)} Z`;
    }
    return d;
  };

  return (
    <div className="relative">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        role="img"
        aria-label="Évolution du rang"
        onMouseMove={onMove}
        onMouseLeave={() => setHover(null)}
      >
        {/* Grille + libellés de paliers */}
        {ticks.map((t, k) => (
          <g key={k}>
            <line x1={PAD_L} y1={y(t.value)} x2={W - PAD_R} y2={y(t.value)} stroke="var(--bg-border)" strokeWidth="1" />
            <text x={PAD_L - 8} y={y(t.value) + 4} textAnchor="end" fontSize="11" fill="var(--text-faint)">
              {t.label}
            </text>
          </g>
        ))}

        {/* Libellés temps */}
        {xLabelIdx.map((i) => (
          <text key={i} x={x(i)} y={H - PAD_B + 22} textAnchor="middle" fontSize="10" fill="var(--text-faint)">
            {fmt(times[i])}
          </text>
        ))}

        {/* Lignes (une par joueur) */}
        {visible.map((s) => (
          <path
            key={s.pseudo}
            d={buildPath(s, false)}
            fill="none"
            stroke={s.color}
            strokeWidth="2.5"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        ))}

        {/* Survol : ligne verticale + points */}
        {hover !== null && (
          <g>
            <line x1={x(hover)} y1={PAD_T} x2={x(hover)} y2={H - PAD_B} stroke="#3f3f5a" strokeWidth="1" strokeDasharray="4 4" />
            {visible.map((s) => {
              const v = s.values[hover];
              if (typeof v !== "number") return null;
              return <circle key={s.pseudo} cx={x(hover)} cy={y(v)} r={4} fill={s.color} stroke="var(--bg-card)" strokeWidth="1.5" />;
            })}
          </g>
        )}
      </svg>

      {/* Infobulle HTML positionnée en % (suit l'échelle responsive) */}
      {hover !== null && (
        <div
          className="pointer-events-none absolute top-2 z-10 -translate-x-1/2 rounded-lg border border-bg-border bg-bg/95 px-3 py-2 text-xs shadow-neon-cyan"
          style={{ left: `${(x(hover) / W) * 100}%` }}
        >
          <p className="mb-1 font-medium text-gray-400">{fmt(times[hover])}</p>
          <ul className="space-y-0.5">
            {visible.map((s) => (
              <li key={s.pseudo} className="flex items-center gap-2 whitespace-nowrap">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: s.color }} />
                <span className="text-gray-300">{s.pseudo}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Légende interactive (clic = afficher/masquer) */}
      <ul className="mt-5 flex flex-wrap gap-x-6 gap-y-2">
        {series.map((s) => {
          const off = hidden[s.pseudo];
          return (
            <li key={s.pseudo}>
              <button
                type="button"
                onClick={() => setHidden((h) => ({ ...h, [s.pseudo]: !h[s.pseudo] }))}
                className={`flex items-center gap-2 text-sm transition-opacity ${off ? "opacity-35" : "opacity-100"}`}
              >
                <span className="h-3 w-3 rounded-full" style={{ backgroundColor: s.color }} />
                <span className="font-display font-bold text-white">{s.pseudo}</span>
                <span className="text-gray-500">{s.current}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
