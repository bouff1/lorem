import { team } from "@/data/team";

const links = [
  { href: "#accueil", label: "Accueil" },
  { href: "#joueurs", label: "Joueurs" },
  { href: "#matchs", label: "Matchs" },
  { href: "#classement", label: "Classement" },
];

export default function Navbar() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-bg-border bg-bg/80 backdrop-blur-md">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <a href="#accueil" className="font-display text-lg font-bold tracking-widest gradient-text">
          {team.nom}
        </a>
        <ul className="flex items-center gap-4 text-sm sm:gap-7">
          {links.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="text-gray-300 transition-colors hover:text-neon-cyan"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
