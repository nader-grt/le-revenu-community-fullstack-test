# Le Revenu Community

Application communautaire permettant aux lecteurs du média Le Revenu d’échanger, de poser des questions et de partager leurs connaissances autour de l’information financière, des placements et de l’investissement.

Ce projet est réalisé dans le cadre d’un test technique Full Stack.

## 1. Objectifs du projet

L’objectif est de transformer une partie du prototype HTML interactif en une application web structurée, maintenable et évolutive.

L’application doit permettre aux utilisateurs de :

- Consulter les discussions de la communauté.
- Filtrer les discussions par catégorie.
- Consulter le détail d’une discussion.
- Lire les réponses associées.
- Créer une discussion.
- Publier une réponse après authentification.

Les données sont récupérées depuis l’API REST de Strapi et stockées dans PostgreSQL.

## 2. Stack technique

### Frontend

- Next.js avec App Router
- React
- TypeScript
- Tailwind CSS

### Backend

- Strapi v5
- TypeScript
- API REST

### Base de données et environnement

- PostgreSQL
- Docker Compose
- Node.js et npm

## 3. Architecture du projet

Le projet est organisé autour de deux applications :

```text
le-revenu-community/
├── backend/                 # API Strapi v5
├── frontend/                # Application Next.js
├── docker-compose.yml       # Services Docker
├── README.md                # Documentation
└── .env.example             # Exemple de configuration, à vérifier
```

Cette structure est indicative : les chemins doivent correspondre à l’organisation réelle du dépôt.

### Responsabilités

**Next.js**
- Afficher les pages et les composants React.
- Récupérer les données depuis l’API Strapi.
- Gérer les formulaires et les interactions utilisateur.
- Présenter les états de chargement, d’erreur et d’absence de données.

**Strapi**
- Exposer les endpoints REST.
- Gérer les Content Types et les relations.
- Valider les données côté serveur.
- Appliquer les permissions et les règles métier.

**PostgreSQL**
- Persister les catégories, les discussions, les réponses et les données utilisateurs.

Le frontend ne doit pas accéder directement à PostgreSQL. La logique métier et la persistance passent par Strapi.

## 4. Modèle de données

Le modèle métier repose sur les entités suivantes.

### User

Le modèle utilisateur du plugin Users & Permissions de Strapi est privilégié pour gérer les utilisateurs authentifiés.

### Category

Champs principaux :

- `name` : nom de la catégorie.
- `slug` : identifiant lisible utilisé pour la catégorie.
- `description` : description de la catégorie.

### Discussion

Champs principaux :

- `title` : titre de la discussion.
- `content` : contenu de la discussion.
- `type` : type de publication, `question` ou `discussion`.
- `author` : utilisateur auteur.
- `category` : catégorie associée.
- `replies` : réponses associées.

### Reply

Champs principaux :

- `content` : contenu de la réponse.
- `author` : utilisateur auteur.
- `discussion` : discussion concernée.

Les relations et les validations doivent être définies dans les Content Types Strapi.

## 5. Installation

### Prérequis

Avant de commencer, installer :

- Git
- Node.js et npm
- Docker
- Docker Compose

### Étape 1 — Récupérer le dépôt

```bash
git clone <URL_DU_DEPOT>
cd le-revenu-community
```

Remplacer `<URL_DU_DEPOT>` par l’adresse réelle du dépôt Git.

### Étape 2 — Configurer les variables d’environnement

Créer les fichiers d’environnement nécessaires à partir des exemples disponibles.

Le backend utilise actuellement une configuration PostgreSQL de ce type :

```dotenv
DATABASE_CLIENT=postgres
DATABASE_HOST=127.0.0.1
DATABASE_PORT=5433
DATABASE_NAME=le_revenu
DATABASE_USERNAME=le_revenu_user
DATABASE_SSL=false
```

Les identifiants et les secrets doivent être configurés localement. Les valeurs ci-dessus sont des exemples de configuration, pas des mots de passe.

Si le backend tourne dans Docker, vérifier que `DATABASE_HOST` correspond au nom du service PostgreSQL sur le réseau Docker. `127.0.0.1` désigne le conteneur lui-même, pas automatiquement le conteneur PostgreSQL.

### Étape 3 — Démarrer PostgreSQL

Depuis la racine du projet :

```bash
docker compose up -d
docker compose ps
```

Vérifier que PostgreSQL est démarré et prêt à accepter les connexions.

Pour contrôler la connexion depuis le conteneur PostgreSQL, adapter la commande au nom réel du service :

```bash
docker exec <NOM_DU_CONTENEUR_POSTGRES> \
  pg_isready -U le_revenu_user -d le_revenu
```

### Étape 4 — Installer et démarrer Strapi

Ouvrir un terminal :

```bash
cd backend
npm install
npm run develop
```

Avec la configuration locale actuelle, Strapi est accessible à :

- API : http://localhost:1337
- Administration : http://localhost:1337/admin

Lors du premier lancement, créer le compte administrateur Strapi si nécessaire.

### Étape 5 — Installer et démarrer Next.js

Ouvrir un deuxième terminal :

```bash
cd frontend
npm install
npm run dev
```

Le frontend est généralement accessible à :

http://localhost:3000

Vérifier que l’URL configurée dans le frontend correspond à l’adresse réelle de l’API Strapi.

## 6. Endpoints REST

Les endpoints suivants ont été testés sur l’environnement local pour la lecture des données.

| Méthode | Endpoint | Description |
|---|---|---|
| GET | `/api/categories` | Récupérer les catégories |
| GET | `/api/discussions` | Récupérer la liste des discussions |
| GET | `/api/discussions/:documentId` | Récupérer le détail d’une discussion |
| GET | `/api/replies` | Récupérer les réponses |

### Détail d’une discussion

Le frontend utilise le `documentId` de Strapi v5 pour construire l’URL de détail.

Exemple :

```http
GET /api/discussions/ppcanapp9xy8wht6fd986qpu?populate[author]=true&populate[category]=true&populate[replies]=true
```

Ce type de requête a retourné `HTTP 200 OK` dans l’environnement local, avec la discussion, son auteur, sa catégorie et ses réponses.

Les opérations de création doivent également être vérifiées avec les permissions et l’authentification appropriées.

## 7. Fonctionnalités et état d’avancement

### Fonctionnalités dont le fonctionnement a été vérifié

- Connexion de Strapi à PostgreSQL.
- Récupération des catégories via l’API REST.
- Récupération de la liste des discussions.
- Récupération du détail d’une discussion à partir de son `documentId`.
- Récupération des réponses via l’API REST.
- Présence de pages frontend pour la liste et le détail des discussions.

### Points à finaliser ou à revalider avant livraison

- Création d’une discussion depuis le formulaire frontend.
- Publication d’une réponse depuis le détail d’une discussion.
- Validation métier des données côté Strapi.
- Refus des publications non authentifiées.
- Protection contre l’usurpation de l’auteur.
- Vérification des permissions des rôles Strapi.
- Tests automatisés des scénarios principaux.
- Initialisation reproductible des données de démonstration.
- Vérification complète de l’installation à partir d’un environnement propre.

Cette liste doit être mise à jour après l’exécution des tests finaux.

## 8. Validation et sécurité

Les contrôles effectués uniquement dans le frontend ne suffisent pas à garantir la sécurité.

Le backend doit notamment :

- Exiger une authentification pour créer une discussion ou une réponse.
- Déterminer l’auteur à partir de l’utilisateur authentifié.
- Ne pas faire confiance à un identifiant `author` fourni par le client.
- Valider le titre et le contenu des discussions.
- Vérifier les relations entre les discussions, les catégories et les réponses.
- Configurer les permissions Strapi pour chaque rôle.
- Retourner des codes HTTP cohérents en cas d’erreur.

Pour la création d’une discussion, le titre doit contenir au moins 10 caractères et le contenu doit être obligatoire. Ces règles doivent être appliquées côté Strapi, indépendamment du frontend.

## 9. Tests automatisés

Les tests doivent couvrir au minimum les scénarios suivants :

1. Refuser une discussion dont le titre ne respecte pas la longueur minimale.
2. Refuser une discussion sans contenu.
3. Refuser la publication d’une discussion sans authentification.
4. Refuser la publication d’une réponse sans authentification.
5. Empêcher l’usurpation de l’auteur.
6. Vérifier la récupération et l’affichage des discussions.
7. Vérifier la création et l’affichage des réponses.

Les commandes d’exécution doivent correspondre aux scripts définis dans les fichiers `package.json` du backend et du frontend.

## 10. Données de démonstration

Des données de test sont présentes dans l’environnement local pour les catégories, les discussions et les réponses.

Pour faciliter l’évaluation, le projet doit fournir une procédure reproductible permettant d’initialiser les données nécessaires sur une installation propre.

La procédure exacte dépend du mécanisme d’initialisation présent dans le dépôt.

## 11. Variables d’environnement et secrets

Le dépôt doit contenir un fichier `.env.example` présentant les variables nécessaires, sans secrets réels.

Les fichiers `.env` locaux contenant des mots de passe, des tokens ou des clés privées ne doivent pas être publiés dans Git.

Avant une livraison publique, vérifier également que les secrets précédemment exposés ont été renouvelés.

## 12. Lancement avec Docker Compose

Le projet prévoit l’utilisation de Docker Compose pour faciliter le lancement des services.

Pour démarrer les services définis dans le fichier de configuration :

```bash
docker compose up -d
docker compose ps
```

Pour consulter les logs :

```bash
docker compose logs -f
```

Pour arrêter les services :

```bash
docker compose down
```

Ces commandes démarrent uniquement les services effectivement définis dans `docker-compose.yml`. Vérifier que le frontend et le backend y sont configurés si l’objectif est de lancer l’ensemble de l’application avec Docker.

## 13. Choix d’architecture

### Pourquoi Next.js ?

Next.js permet de structurer les pages avec l’App Router et de choisir entre Server Components et Client Components selon les besoins.

Les Server Components conviennent à la récupération et à l’affichage des données. Les Client Components sont utiles pour les formulaires et les interactions qui nécessitent un état côté navigateur.

### Pourquoi Strapi ?

Strapi fournit les Content Types, les relations, les endpoints REST, les permissions et les mécanismes de personnalisation nécessaires au backend.

Cela évite de développer un backend métier parallèle dans Next.js.

### Pourquoi PostgreSQL ?

PostgreSQL assure la persistance des données relationnelles de l’application.

### Pourquoi Docker Compose ?

Docker Compose facilite le démarrage et la gestion des services nécessaires à l’environnement de développement.

## 14. Améliorations possibles

Les fonctionnalités suivantes peuvent être ajoutées après la finalisation du périmètre principal :

- Recherche de discussions.
- Pagination de l’interface.
- Votes « Utile ».
- Mise en avant de la meilleure réponse.
- Profil utilisateur.
- Tests end-to-end avec Playwright.

La priorité reste la fiabilité des fonctionnalités principales, la validation des données, la sécurité et la reproductibilité de l’installation.

---
**FullName && email &&Number:** NADER CHARGUI  && charguinadar@gmail.com   95120814  
**Projet :** Le Revenu Community  
**Frontend :** Next.js, React, TypeScript, Tailwind CSS  
**Backend :** Strapi v5, TypeScript, API REST  
**Base de données :** PostgreSQL  
**Environnement :** Docker Compose
