import { refreshSnapshot } from "@/lib/snapshot";

export const dynamic = "force-dynamic";
// Laisse le temps aux appels Riot (rang + champion + stats des 5 comptes).
export const maxDuration = 60;

/**
 * Déclenche un rafraîchissement de l'instantané Riot.
 * Sécurisé par :
 *  - le Cron Vercel : en-tête `Authorization: Bearer <CRON_SECRET>` (auto), ou
 *  - un cron externe : `?key=<REFRESH_SECRET>`.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const key = url.searchParams.get("key");
  const auth = req.headers.get("authorization");

  const cronOk = process.env.CRON_SECRET && auth === `Bearer ${process.env.CRON_SECRET}`;
  const keyOk = process.env.REFRESH_SECRET && key === process.env.REFRESH_SECRET;
  // Si aucun secret n'est configuré, on autorise (pratique en local).
  const noSecretConfigured = !process.env.CRON_SECRET && !process.env.REFRESH_SECRET;

  if (!cronOk && !keyOk && !noSecretConfigured) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const snap = await refreshSnapshot();
    return Response.json({ ok: true, updatedAt: snap.updatedAt });
  } catch (e) {
    return Response.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
