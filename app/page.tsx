import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Roster from "@/components/Roster";
import Results from "@/components/Results";
import Standings from "@/components/Standings";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Roster />
        <Results />
        <Standings />
      </main>
      <Footer />
    </>
  );
}
