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

## Données Riot en direct + tâche de fond

Le site affiche le rang et le champion le plus maîtrisé de chaque joueur via l'API Riot.

- Une **tâche planifiée** (toutes les 10 min) récupère les données et les écrit dans un
  **instantané** local (`riot-snapshot.json`). Voir [lib/scheduler.ts](lib/scheduler.ts).
- Le site **lit l'instantané** (aucun appel Riot par visite → rapide).
- **Résilience** : si Riot est injoignable (ou clé expirée), l'ancien instantané est
  **conservé** — le site ne montre jamais du vide.

La clé se met dans `.env.local` :

```bash
RIOT_API_KEY=RGAPI-xxxxxxxx
RIOT_PLATFORM=euw1     # euw1, eun1, na1, kr...
RIOT_REGION=europe     # europe, americas, asia
```

> ⚠️ **Clé de dev vs production.** La clé de dev **expire toutes les 24 h** : la tâche
> cessera alors de se mettre à jour (le site gardera le dernier instantané). Pour un
> fonctionnement **24/7**, demande une **clé de production** (gratuite) sur
> [developer.riotgames.com](https://developer.riotgames.com) → **Register Product**,
> puis remplace la clé dans `.env.local`.

---

## Docker (déploiement persistant)

Le plus simple — avec Docker Compose (gère le volume + la clé + le redémarrage auto) :

```bash
npm install          # génère package-lock.json (build reproductible)
docker compose up -d --build
```

Le site est accessible sur **http://localhost:3000**. La clé est lue depuis `.env.local`,
et l'instantané est stocké dans le volume `riot-data` → **il survit aux redéploiements**.

Sans Compose, avec `docker run` (penser au volume pour la persistance) :

```bash
docker build -t ostap-lol .
docker run -d -p 3000:3000 \
  --env-file .env.local \
  -e RIOT_SNAPSHOT_PATH=/data/riot-snapshot.json \
  -v riot-data:/data \
  --restart unless-stopped \
  ostap-lol
```

> Sans le volume (`-v riot-data:/data`), l'instantané est recréé au démarrage mais
> **perdu à chaque redéploiement** — d'où l'intérêt du volume.

---

## Git

Le dépôt est déjà initialisé. Pour le sauvegarder sur GitHub/GitLab :

```bash
git remote add origin <url-du-depot>
git push -u origin main
```
