// Point d'entrée appelé une fois au démarrage du serveur Next.js.
// On y lance le planificateur Riot (uniquement côté Node, pas Edge).
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { startRiotScheduler } = await import("./lib/scheduler");
    startRiotScheduler();
  }
}
