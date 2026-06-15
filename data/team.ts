// =============================================================================
//  SOURCE DE VÉRITÉ DU SITE
//  Modifie simplement les valeurs ci-dessous pour mettre à jour le contenu.
//  Aucune autre partie du code n'a besoin d'être touchée.
// =============================================================================

export type Role = "Top" | "Jungle" | "Mid" | "ADC" | "Support";

export interface Social {
  label: string; // ex. "Twitch", "Twitter/X", "Instagram"
  url: string;
}

export interface Player {
  pseudo: string;
  nomReel?: string;
  role: Role;
  /** Chemin dans /public, ex. "/players/exemple.jpg". Laisse "" pour un avatar généré. */
  photo: string;
  /** Rang saisi à la main, ex. "Challenger — 1240 LP". */
  rang: string;
  /** Lien direct vers le profil OP.GG du joueur. */
  opggUrl: string;
  socials?: Social[];
}

export interface MatchResult {
  date: string; // ex. "12 juin 2026"
  adversaire: string;
  score: string; // ex. "2 - 1"
  resultat: "victoire" | "défaite";
  competition?: string; // ex. "Worlds 2026 — Groupes"
}

export interface Standing {
  position: number;
  equipe: string;
  victoires: number;
  defaites: number;
  points?: number;
  estNous?: boolean; // true pour surligner notre équipe
}

export interface Team {
  nom: string;
  slogan: string;
  /** Chemin du logo dans /public. */
  logo: string;
  socials: Social[];
}

// ----------------------------------------------------------------------------
//  ÉQUIPE
// ----------------------------------------------------------------------------
export const team: Team = {
  nom: "OSTAP ESPORTS",
  slogan: "Une équipe, un objectif : la Faille de l'Invocateur.",
  logo: "/logo.svg",
  socials: [
    { label: "Twitter/X", url: "https://x.com/" },
    { label: "Twitch", url: "https://twitch.tv/" },
    { label: "YouTube", url: "https://youtube.com/" },
  ],
};

// ----------------------------------------------------------------------------
//  JOUEURS (roster)
// ----------------------------------------------------------------------------
export const players: Player[] = [
  {
    pseudo: "Sylas",
    nomReel: "Alex D.",
    role: "Top",
    photo: "",
    rang: "Challenger — 1240 LP",
    opggUrl: "https://www.op.gg/summoners/euw/Sylas-EUW",
    socials: [{ label: "Twitter/X", url: "https://x.com/" }],
  },
  {
    pseudo: "Kha",
    nomReel: "Marco L.",
    role: "Jungle",
    photo: "",
    rang: "Challenger — 980 LP",
    opggUrl: "https://www.op.gg/summoners/euw/Kha-EUW",
  },
  {
    pseudo: "Faê",
    nomReel: "Yanis B.",
    role: "Mid",
    photo: "",
    rang: "Grandmaster — 720 LP",
    opggUrl: "https://www.op.gg/summoners/euw/Fae-EUW",
    socials: [{ label: "Twitch", url: "https://twitch.tv/" }],
  },
  {
    pseudo: "Vael",
    nomReel: "Tom R.",
    role: "ADC",
    photo: "",
    rang: "Challenger — 1100 LP",
    opggUrl: "https://www.op.gg/summoners/euw/Vael-EUW",
  },
  {
    pseudo: "Lumi",
    nomReel: "Sarah M.",
    role: "Support",
    photo: "",
    rang: "Grandmaster — 640 LP",
    opggUrl: "https://www.op.gg/summoners/euw/Lumi-EUW",
    socials: [{ label: "Instagram", url: "https://instagram.com/" }],
  },
];

// ----------------------------------------------------------------------------
//  DERNIERS RÉSULTATS (du plus récent au plus ancien)
// ----------------------------------------------------------------------------
export const results: MatchResult[] = [
  {
    date: "12 juin 2026",
    adversaire: "Nova Dragons",
    score: "2 - 1",
    resultat: "victoire",
    competition: "Worlds 2026 — Groupes",
  },
  {
    date: "9 juin 2026",
    adversaire: "Titan Gaming",
    score: "0 - 2",
    resultat: "défaite",
    competition: "Worlds 2026 — Groupes",
  },
  {
    date: "5 juin 2026",
    adversaire: "Crimson Foxes",
    score: "2 - 0",
    resultat: "victoire",
    competition: "Worlds 2026 — Groupes",
  },
  {
    date: "1 juin 2026",
    adversaire: "Aether Wolves",
    score: "2 - 1",
    resultat: "victoire",
    competition: "Qualifications",
  },
];

// ----------------------------------------------------------------------------
//  CLASSEMENT WORLDS
// ----------------------------------------------------------------------------
export const standings: Standing[] = [
  { position: 1, equipe: "Titan Gaming", victoires: 5, defaites: 1, points: 15 },
  { position: 2, equipe: "OSTAP ESPORTS", victoires: 4, defaites: 2, points: 12, estNous: true },
  { position: 3, equipe: "Nova Dragons", victoires: 3, defaites: 3, points: 9 },
  { position: 4, equipe: "Crimson Foxes", victoires: 2, defaites: 4, points: 6 },
  { position: 5, equipe: "Aether Wolves", victoires: 1, defaites: 5, points: 3 },
];
