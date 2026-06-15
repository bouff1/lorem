import { team } from "@/data/team";

export default function Footer() {
  return (
    <footer className="border-t border-bg-border bg-bg-soft py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-5 px-4 text-center sm:px-6">
        <p className="font-display text-lg font-bold tracking-widest gradient-text">
          {team.nom}
        </p>

        <ul className="flex flex-wrap items-center justify-center gap-4">
          {team.socials.map((social) => (
            <li key={social.url}>
              <a
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-gray-400 transition-colors hover:text-neon-cyan"
              >
                {social.label}
              </a>
            </li>
          ))}
        </ul>

        <p className="text-xs text-gray-600">
          © {team.nom}. Site non affilié à Riot Games.
        </p>
      </div>
    </footer>
  );
}
