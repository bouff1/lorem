import Image from "next/image";
import { team } from "@/data/team";

export default function Hero() {
  return (
    <section
      id="accueil"
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 text-center"
    >
      {/* Décor animé : grille en perspective + halos néon flottants */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="hero-grid absolute inset-0" />
        <div className="hero-blob absolute left-1/4 top-1/3 h-72 w-72 rounded-full bg-neon-cyan/30" />
        <div
          className="hero-blob absolute right-1/4 bottom-1/4 h-72 w-72 rounded-full bg-neon-magenta/30"
          style={{ animationDelay: "-7s" }}
        />
      </div>

      <div className="animate-fade-up">
        <div className="mx-auto mb-8 flex h-28 w-28 items-center justify-center rounded-2xl border border-bg-border bg-bg-card shadow-neon-cyan sm:h-32 sm:w-32">
          <Image
            src={team.logo}
            alt={`Logo ${team.nom}`}
            width={96}
            height={96}
            className="h-20 w-20 sm:h-24 sm:w-24"
            priority
          />
        </div>

        <h1 className="font-display text-4xl font-black uppercase tracking-widest sm:text-6xl">
          <span className="gradient-text">{team.nom}</span>
        </h1>

        <p className="mx-auto mt-6 max-w-xl text-lg text-gray-400">
          {team.slogan}
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <a
            href="#joueurs"
            className="rounded-lg bg-neon-gradient px-6 py-3 font-display text-sm font-bold uppercase tracking-wider text-bg transition-transform hover:scale-105"
          >
            Découvrir l&apos;équipe
          </a>
          <a
            href="#matchs"
            className="rounded-lg border border-bg-border px-6 py-3 font-display text-sm font-bold uppercase tracking-wider text-gray-200 transition-colors hover:border-neon-cyan hover:text-neon-cyan"
          >
            Nos résultats
          </a>
        </div>
      </div>
    </section>
  );
}
