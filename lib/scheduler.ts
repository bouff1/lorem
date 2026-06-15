// =============================================================================
//  Planificateur LOCAL (dev / Docker) : rafraîchit l'instantané toutes les 10 min.
//  Sur Vercel (serverless), il est désactivé : c'est le Cron + /api/refresh
//  qui déclenchent le rafraîchissement.
// =============================================================================

import { refreshSnapshot } from "./snapshot";

let started = false;
const INTERVAL_MS = 10 * 60 * 1000;

export function startRiotScheduler() {
  if (started) return;
  if (process.env.VERCEL) return; // sur Vercel : géré par le cron, pas ici
  started = true;

  const run = (label: string) =>
    refreshSnapshot()
      .then((s) => console.log(`[riot] ${label} — à jour (${s.updatedAt})`))
      .catch((e) => console.error(`[riot] ${label} — échec`, e));

  run("démarrage");
  setInterval(() => run("interval 10 min"), INTERVAL_MS);
  console.log("[riot] planificateur local démarré (toutes les 10 min)");
}
