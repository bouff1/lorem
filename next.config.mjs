/** @type {import('next').NextConfig} */
const nextConfig = {
  // Génère une build autonome pour une image Docker légère.
  output: "standalone",
  // Autorise les splash arts officiels (Data Dragon) en fond des cartes joueurs.
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "ddragon.leagueoflegends.com" },
    ],
  },
};

export default nextConfig;
