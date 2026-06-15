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
  /** Rang saisi à la main. Utilisé en repli si l'API Riot ne répond pas. */
  rang: string;
  /** Lien direct vers le profil OP.GG du joueur. */
  opggUrl: string;
  /**
   * Riot ID (nouveau format Pseudo#TAG) pour récupérer le rang en direct via
   * l'API Riot. Optionnel : sans lui, on affiche le champ `rang` saisi à la main.
   */
  riotId?: { gameName: string; tagLine: string };
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
// Rang affiché automatiquement via l'API Riot si la clé est valide ; sinon le
// champ `rang` ci-dessous (saisie manuelle) est utilisé en repli.
export const players: Player[] = [
  {
    pseudo: "klexandre",
    role: "Top",
    photo: "",
    rang: "—",
    riotId: { gameName: "klexandre", tagLine: "EUW" },
    opggUrl: "https://www.op.gg/summoners/euw/klexandre-EUW",
  },
  {
    pseudo: "gOfursel",
    role: "Jungle",
    photo: "",
    rang: "—",
    riotId: { gameName: "gOfursel", tagLine: "pidid" },
    opggUrl: "https://www.op.gg/summoners/euw/gOfursel-pidid",
  },
  {
    pseudo: "TheGATmPaulo",
    role: "Mid",
    photo: "",
    rang: "—",
    riotId: { gameName: "TheGATmPaulo", tagLine: "EUW" },
    opggUrl: "https://www.op.gg/summoners/euw/TheGATmPaulo-EUW",
  },
  {
    pseudo: "Faller Ω",
    role: "ADC",
    photo: "",
    rang: "—",
    riotId: { gameName: "Faller Ω", tagLine: "SamAD" },
    opggUrl: "https://www.op.gg/summoners/euw/Faller%20%CE%A9-SamAD",
  },
  {
    pseudo: "Mirage75015",
    role: "Support",
    photo: "",
    rang: "—",
    riotId: { gameName: "Mirage75015", tagLine: "EUW" },
    opggUrl: "https://www.op.gg/summoners/euw/Mirage75015-EUW",
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
