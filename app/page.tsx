import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Roster from "@/components/Roster";
import Schedule from "@/components/Schedule";
import Standings from "@/components/Standings";
import Footer from "@/components/Footer";

// Rendu dynamique : on relit l'instantané Riot à chaque requête (toujours à jour).
export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Roster />
        <Schedule />
        <Standings />
      </main>
      <Footer />
    </>
  );
}
