# Le Revenu Community

Application communautaire développée dans le cadre d’un test technique Full Stack. Elle permet aux lecteurs du média **Le Revenu** d’échanger autour de l’actualité financière, des placements et de l’investissement.

## Stack technique

- **Frontend :** Next.js 16, React 19, TypeScript, Tailwind CSS
- **Backend :** Strapi v5, TypeScript, API REST
- **Base de données :** PostgreSQL 17
- **Environnement :** Docker Compose, Node.js et npm
- **Tests :** Jest pour le backend, scripts de lint et de build pour le frontend

## Architecture du projet

```text
le-revenu-community-fullstack-test/
├── backend/              # API Strapi
├── frontend/             # Application Next.js
├── docker-compose.yml    # Orchestration des services
├── .env                  # Variables d’environnement locales
└── README.md
```

Le frontend communique avec le backend via l’API REST de Strapi. PostgreSQL assure la persistance des données. Le frontend ne se connecte jamais directement à la base de données.

Le projet utilise Docker Compose pour orchestrer les services et faciliter la mise en place de l’environnement local.

## Prérequis

Avant de commencer, installer les outils suivants :

- Git
- Node.js, dans une version compatible avec le projet
- npm
- Docker
- Docker Compose

## Installation et démarrage

### 1. Cloner le dépôt

```bash
git clone <URL_DU_DEPOT>
cd le-revenu-community-fullstack-test
```

Remplacer `<URL_DU_DEPOT>` par l’URL réelle du dépôt Git.

### 2. Configurer les variables d’environnement

À la racine du projet, créer ou compléter le fichier `.env` avec les variables nécessaires au fonctionnement de Strapi et de PostgreSQL.

Les secrets doivent être générés localement et conservés privés. Ne jamais publier le fichier `.env` ni inclure de véritables clés, mots de passe ou tokens dans le dépôt Git.

Les variables requises dépendent de la configuration du projet, notamment :

- Les clés de l’application Strapi (`APP_KEYS`)
- Le secret JWT de l’administration (`ADMIN_JWT_SECRET`)
- Le sel des API tokens (`API_TOKEN_SALT`)
- Le sel des tokens de transfert (`TRANSFER_TOKEN_SALT`)
- La clé de chiffrement de l’administration (`ENCRYPTION_KEY`)
- Les paramètres de connexion à PostgreSQL

Vérifier également que les variables nécessaires sont bien transmises au service `backend` dans `docker-compose.yml`.

### 3. Démarrer les services Docker

Depuis la racine du projet :

```bash
docker compose up -d
docker compose ps
```

Cette commande démarre les services définis dans `docker-compose.yml`, notamment PostgreSQL, le backend et le frontend.

Pour consulter les logs :

```bash
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f postgres
```

Attendre que les services soient opérationnels avant d’accéder à l’application.

### 4. Accéder à l’application

Lorsque les services ont démarré correctement, les adresses locales sont les suivantes :

| Service | URL |
|---|---|
| Frontend Next.js | http://localhost:3000 |
| API Strapi | http://localhost:1337 |
| Administration Strapi | http://localhost:1337/admin |

Ces adresses correspondent à la configuration locale actuelle et supposent que les ports par défaut sont disponibles.

Lors du premier démarrage, créer le compte administrateur Strapi depuis l’interface d’administration si aucun compte n’existe déjà.

### 5. Lancer les composants séparément (optionnel)

Si tu souhaites lancer le backend et le frontend hors de Docker, vérifie d’abord que PostgreSQL est accessible et que les variables d’environnement sont correctement configurées.

**Backend :**

```bash
cd backend
npm install
npm run develop
```

**Frontend**, dans un autre terminal :

```bash
cd frontend
npm install
npm run dev
```

Dans ce mode, la configuration de connexion à PostgreSQL doit utiliser le port `5433` depuis la machine hôte. Depuis un autre conteneur du même réseau Docker, le service PostgreSQL est accessible via son nom de service et le port interne `5432`.

Éviter de lancer simultanément plusieurs instances du backend ou du frontend sur les mêmes ports.

## Fonctionnalités principales

Le périmètre fonctionnel de l’application comprend :

- Consultation des discussions
- Filtrage des discussions par catégorie
- Consultation du détail d’une discussion
- Affichage des réponses associées
- Création de discussions
- Publication de réponses avec authentification

L’état de fonctionnement de chaque fonctionnalité doit être confirmé par les tests réalisés sur l’environnement local.

## API REST

Les endpoints de lecture documentés pour l’application sont les suivants :

| Méthode | Endpoint | Description |
|---|---|---|
| `GET` | `/api/categories` | Récupération des catégories |
| `GET` | `/api/discussions` | Récupération des discussions |
| `GET` | `/api/discussions/:documentId` | Consultation du détail d’une discussion |
| `GET` | `/api/replies` | Récupération des réponses |

Les paramètres de requête Strapi, notamment `populate`, peuvent être utilisés pour charger les relations nécessaires à l’interface, selon les permissions configurées.

Les endpoints de création et de modification doivent respecter les règles d’authentification, d’autorisation et de validation définies côté backend.

## Validation et sécurité

Les règles métier doivent être appliquées côté backend, indépendamment des contrôles effectués dans le frontend.

Les principaux points de contrôle comprennent :

- Authentification obligatoire pour les opérations protégées
- Attribution de l’auteur à partir de l’utilisateur authentifié
- Refus de faire confiance à un identifiant d’auteur fourni par le client
- Validation des champs obligatoires et des longueurs minimales
- Vérification de la cohérence des relations entre discussions, catégories et réponses
- Configuration des permissions Strapi selon les rôles
- Gestion cohérente des codes HTTP et des erreurs
- Protection des secrets et des variables d’environnement

Ces contrôles doivent être vérifiés par des tests adaptés avant la livraison.

## Tests et vérifications

### Backend

Depuis le dossier `backend` :

```bash
npm test
```

### Frontend

Depuis le dossier `frontend` :

```bash
npm run lint
npm run build
```

Exécuter ces commandes dans les dossiers concernés et corriger les erreurs éventuelles avant la livraison. Les résultats ne doivent être présentés comme validés qu’après exécution effective des commandes.

## Gestion de Docker Compose

Démarrer les services :

```bash
docker compose up -d
```

Afficher l’état des conteneurs :

```bash
docker compose ps
```

Consulter les logs du backend :

```bash
docker compose logs -f backend
```

Arrêter les services :

```bash
docker compose down
```

La commande `docker compose down` arrête et supprime les conteneurs et le réseau du projet, mais conserve normalement le volume nommé `postgres_data`.

**Attention :** ne pas utiliser `docker compose down -v` si les données locales doivent être conservées, car cette commande peut supprimer les volumes associés au projet.

## Améliorations possibles

Plusieurs évolutions peuvent être envisagées :

- Ajout d’une recherche et d’une pagination avancées des discussions
- Mise en place de tests end-to-end
- Création de données de démonstration reproductibles
- Amélioration de la gestion des erreurs et des états de chargement
- Ajout de fonctionnalités de vote
- Possibilité de mettre en avant la meilleure réponse

La priorité reste la fiabilité des fonctionnalités principales, la validation côté serveur, la sécurité et la reproductibilité de l’installation.

---

## Informations sur le projet

- **Nom :** Nader Chargui
- **Projet :** Le Revenu Community
- **Frontend :** Next.js, React, TypeScript, Tailwind CSS
- **Backend :** Strapi v5, TypeScript, API REST
- **Base de données :** PostgreSQL
- **Environnement :** Docker Compose

**Contact :** à renseigner dans la version destinée à la livraison.
---
**FullName && email &&Number:** NADER CHARGUI  && charguinadar@gmail.com   95120814  
**Projet :** Le Revenu Community  
**Frontend :** Next.js, React, TypeScript, Tailwind CSS  
**Backend :** Strapi v5, TypeScript, API REST  
**Base de données :** PostgreSQL  
**Environnement :** Docker Compose
