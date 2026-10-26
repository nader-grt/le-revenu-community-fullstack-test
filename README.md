# Le Revenu Community

Application communautaire développée dans le cadre d’un test technique Full Stack. Elle permet aux lecteurs du média *Le Revenu* d’échanger autour de l’information financière, des placements et de l’investissement.

## Stack technique

- **Frontend :** Next.js 16, React 19, TypeScript, Tailwind CSS
- **Backend :** Strapi v5, TypeScript, API REST
- **Base de données :** PostgreSQL 17
- **Environnement local :** Docker Compose, Node.js et npm

## Architecture

```text
le-revenu-community-fullstack-test/
├── backend/          # API Strapi
├── frontend/         # Application Next.js
├── docker-compose.yml
└── README.md
```

Le frontend communique avec le backend via l’API REST de Strapi. PostgreSQL assure la persistance des données. Le frontend ne se connecte pas directement à la base de données.

## Prérequis

Installer les outils suivants :

- Git
- Node.js compatible avec les versions déclarées dans les `package.json`
- npm
- Docker et Docker Compose

## Installation et démarrage

### 1. Cloner le dépôt

```bash
git clone <URL_DU_DEPOT>
cd le-revenu-community-fullstack-test
```

Remplacer `<URL_DU_DEPOT>` par l’URL du dépôt GitHub.

### 2. Démarrer PostgreSQL

Depuis la racine du projet :

```bash
docker compose up -d postgres
docker compose ps
```

Le service PostgreSQL utilise le port `5433` sur la machine hôte et le port `5432` dans le conteneur.

La base de données locale est configurée avec les paramètres suivants dans `docker-compose.yml` :

- Base : `le_revenu`
- Utilisateur : `le_revenu_user`
- Port hôte : `5433`

Le mot de passe défini dans le fichier Compose est destiné au développement local uniquement.

### 3. Configurer et démarrer le backend

Vérifier les variables d’environnement requises par Strapi et PostgreSQL. Utiliser les fichiers d’exemple disponibles lorsqu’ils existent, sans publier de secrets réels.

Puis exécuter :

```bash
cd backend
npm install
npm run develop
```

L’API Strapi est accessible à `http://localhost:1337` si le port par défaut est conservé. L’interface d’administration est accessible à `http://localhost:1337/admin`.

Vérifier que la configuration de la base de données correspond au mode de lancement : depuis la machine hôte, PostgreSQL est accessible sur le port `5433`; depuis un autre conteneur du même réseau Docker, utiliser le nom du service et le port interne `5432`.

### 4. Configurer et démarrer le frontend

Dans un autre terminal :

```bash
cd frontend
npm install
npm run dev
```

Le frontend Next.js est accessible à `http://localhost:3000`.

Vérifier que l’URL de l’API configurée dans le frontend correspond à l’adresse du backend.

## Fonctionnalités

Le périmètre fonctionnel comprend :

- Consultation des discussions.
- Filtrage par catégorie.
- Consultation du détail d’une discussion.
- Affichage des réponses associées.
- Création de discussions.
- Publication de réponses avec authentification.

L’état de validation de chaque fonctionnalité doit être confirmé par les tests effectués sur l’environnement local avant la livraison.

## API REST

Les endpoints de lecture suivants sont documentés pour l’application :

| Méthode | Endpoint | Description |
|---|---|---|
| GET | `/api/categories` | Récupération des catégories |
| GET | `/api/discussions` | Récupération des discussions |
| GET | `/api/discussions/:documentId` | Détail d’une discussion |
| GET | `/api/replies` | Récupération des réponses |

Pour les relations, les paramètres `populate` de Strapi peuvent être utilisés selon les besoins de l’interface et les permissions configurées.

Les endpoints de création doivent être testés avec les règles d’authentification et d’autorisation applicables.

## Validation et sécurité

Les règles métier doivent être appliquées côté backend, indépendamment des contrôles du frontend. Les vérifications à effectuer comprennent notamment :

- Authentification obligatoire pour les opérations protégées.
- Attribution de l’auteur à partir de l’utilisateur authentifié.
- Refus de faire confiance à un identifiant d’auteur fourni par le client.
- Validation des champs obligatoires et des longueurs minimales.
- Vérification de la cohérence des relations entre discussions, catégories et réponses.
- Configuration des permissions Strapi par rôle.
- Gestion cohérente des codes HTTP et des erreurs.

## Tests

Le backend dispose d’un script Jest accessible depuis le dossier `backend` :

```bash
npm test
```

Le frontend dispose notamment des scripts suivants :

```bash
npm run lint
npm run build
```

Exécuter ces commandes dans les dossiers concernés et corriger les erreurs avant la livraison. Les résultats des tests ne doivent être annoncés comme validés qu’après leur exécution effective.

## Docker Compose

Le fichier `docker-compose.yml` configure actuellement le service PostgreSQL et son volume persistant.

Démarrer les services définis :

```bash
docker compose up -d
```

Consulter les logs :

```bash
docker compose logs -f postgres
```

Arrêter les services :

```bash
docker compose down
```

La commande `docker compose down` conserve le volume de données. Ne pas utiliser `docker compose down -v` si les données locales doivent être conservées.

Le frontend et le backend se lancent séparément avec les commandes indiquées plus haut.

## Améliorations possibles

- Recherche et pagination des discussions.
- Tests end-to-end.
- Données de démonstration reproductibles.
- Amélioration de la gestion des erreurs et des états de chargement.
- Votes et mise en avant de la meilleure réponse.

La priorité reste la fiabilité des fonctionnalités principales, la validation côté serveur, la sécurité et la reproductibilité de l’installation.


---
**FullName && email &&Number:** NADER CHARGUI  && charguinadar@gmail.com   95120814  
**Projet :** Le Revenu Community  
**Frontend :** Next.js, React, TypeScript, Tailwind CSS  
**Backend :** Strapi v5, TypeScript, API REST  
**Base de données :** PostgreSQL  
**Environnement :** Docker Compose
