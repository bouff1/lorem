// =============================================================================
//  Planificateur intégré : rafraîchit l'instantané Riot toutes les 10 minutes.
//  Démarré au lancement du serveur via instrumentation.ts.
// =============================================================================

import cron from "node-cron";
import { refreshSnapshot } from "./snapshot";

let started = false;

export function startRiotScheduler() {
  if (started) return; // évite les doubles démarrages (HMR en dev)
  started = true;

  const run = (label: string) =>
    refreshSnapshot()
      .then((s) => console.log(`[riot] ${label} — instantané à jour (${s.updatedAt})`))
      .catch((e) => console.error(`[riot] ${label} — échec`, e));

  // Rafraîchissement immédiat au démarrage, puis toutes les 10 minutes.
  run("démarrage");
  cron.schedule("*/10 * * * *", () => run("cron 10 min"));

  console.log("[riot] planificateur démarré (rafraîchissement toutes les 10 min)");
}
