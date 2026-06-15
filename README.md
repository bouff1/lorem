# OSTAP ESPORTS — Site de l'équipe

Site vitrine **one-page** pour présenter l'équipe League of Legends : présentation,
roster des joueurs (avec liens OP.GG), derniers résultats et classement.

- **Stack** : Next.js (App Router) · React · TypeScript · Tailwind CSS
- **Style** : esports néon sombre
- **Données** : éditées à la main dans un seul fichier

---

## Prérequis

- **Node.js ≥ 18** et **npm** — https://nodejs.org (ou `brew install node`)
- **Docker** (optionnel, pour le déploiement) — https://www.docker.com/products/docker-desktop

---

## Démarrer en local

```bash
npm install      # installe les dépendances (crée package-lock.json)
npm run dev      # lance le serveur de développement
```

Ouvre ensuite **http://localhost:3000**.

---

## Modifier le contenu

Tout le contenu du site se trouve dans **un seul fichier** :

> [`data/team.ts`](data/team.ts)

Tu peux y modifier :

- **`team`** — nom, slogan, logo, réseaux sociaux de l'équipe
- **`players`** — chaque joueur : pseudo, rôle, rang, **lien OP.GG**, réseaux
- **`results`** — les derniers matchs (date, adversaire, score, victoire/défaite)
- **`standings`** — le classement (mets `estNous: true` sur la ligne de l'équipe)

### Ajouter une photo de joueur

1. Dépose l'image dans `public/players/` (ex. `public/players/sylas.jpg`)
2. Renseigne le champ `photo: "/players/sylas.jpg"` dans `data/team.ts`

Si `photo` est vide (`""`), un avatar avec les initiales est généré automatiquement.

---

## Build de production

```bash
npm run build
npm run start
```

---

## Docker

```bash
# Construire l'image
docker build -t ostap-lol .

# Lancer le conteneur
docker run -p 3000:3000 ostap-lol
```

Le site est alors accessible sur **http://localhost:3000**.

> Astuce : lance `npm install` au moins une fois avant le build Docker pour générer
> `package-lock.json` (build plus rapide et reproductible via `npm ci`).

---

## Git

Le dépôt est déjà initialisé. Pour le sauvegarder sur GitHub/GitLab :

```bash
git remote add origin <url-du-depot>
git push -u origin main
```
