# ProManage - Backend

Backend pour la plateforme SaaS de gestion de projets ProManage. Ce projet est développé dans le cadre d'un TP en groupe et propose une solution complète pour gérer des projets, des tâches, et faciliter la collaboration en équipe.

## Fonctionnalités

- Authentification et gestion des utilisateurs avec différents rôles (Admin, Chef de projet, Contributeur)
- Gestion des équipes avec système de clés d'invitation
- Création et gestion de projets avec tâches associées
- Suivi des tâches avec statuts, priorités et assignations
- Système de commentaires pour faciliter la collaboration
- Logs d'audit pour tracer les actions des utilisateurs
- Tableaux de bord avec statistiques pour les différents rôles

## Architecture technique

Le backend est construit sur les technologies suivantes :

- **Node.js** avec **Express** pour le serveur API REST
- **PostgreSQL** (via Sequelize) pour les données relationnelles
- **MongoDB** (via Mongoose) pour les logs d'audit
- **JWT** pour l'authentification
- **Joi** pour la validation des données
- **Winston** pour la journalisation

## Installation

### Prérequis

- Node.js (v16 ou supérieur)
- PostgreSQL
- MongoDB

### Étapes d'installation

1. Cloner le repository
```bash
git clone https://github.com/votre-organisation/promanage-backend.git
cd promanage-backend
```

2. Installer les dépendances
```bash
npm install
```

3. Configurer les variables d'environnement
```bash
cp .env.example .env
# Éditer le fichier .env avec vos propres configurations
```

4. Démarrer le serveur en mode développement
```bash
npm run dev
```

## Structure du projet

```
promanage-backend/
├── src/
│   ├── config/         # Configuration (DB, auth, logger)
│   ├── controllers/    # Contrôleurs Express
│   ├── middlewares/    # Middlewares (auth, error, audit)
│   ├── models/         # Modèles de données
│   │   ├── sql/        # Modèles PostgreSQL (Sequelize)
│   │   └── nosql/      # Modèles MongoDB (Mongoose)
│   ├── routes/         # Routes API
│   ├── services/       # Logique métier
│   ├── utils/          # Utilitaires
│   └── app.js          # Configuration Express
├── .env.example        # Variables d'environnement d'exemple
├── package.json        # Dépendances du projet
├── README.md           # Documentation
└── server.js           # Point d'entrée
```

## Rôles et autorisations

### Admin
- Accès complet à toutes les fonctionnalités
- Gestion des utilisateurs, équipes et projets
- Visualisation des logs d'audit
- Statistiques globales

### Chef de projet
- Création et gestion de projets
- Gestion des membres de son équipe
- Assignation des tâches à tous les membres
- Création de tâches pour n'importe quel membre

### Contributeur
- Consultation des projets de son équipe
- Création et mise à jour de ses propres tâches
- Ajout de commentaires
- Mise à jour du statut des tâches assignées

## API Endpoints

### Authentification
- `POST /api/auth/register` - Inscription (chef de projet)
- `POST /api/auth/join` - Inscription (contributeur avec clé)
- `POST /api/auth/login` - Connexion
- `GET /api/auth/me` - Profil utilisateur

### Équipes
- `GET /api/teams` - Liste des équipes (admin)
- `GET /api/teams/my` - Détails de son équipe
- `POST /api/teams` - Création d'équipe
- `PUT /api/teams/:id` - Mise à jour d'équipe
- `DELETE /api/teams/:id/members/:memberId` - Suppression d'un membre

### Projets
- `GET /api/projects` - Liste des projets de l'utilisateur
- `POST /api/projects` - Création de projet
- `GET /api/projects/:id` - Détails d'un projet
- `PUT /api/projects/:id` - Mise à jour d'un projet
- `DELETE /api/projects/:id` - Suppression d'un projet
- `PUT /api/projects/:id/archive` - Archivage d'un projet
- `GET /api/projects/:id/tasks` - Tâches d'un projet
- `GET /api/projects/:id/stats` - Statistiques d'un projet

### Tâches
- `GET /api/tasks/my` - Tâches de l'utilisateur
- `POST /api/tasks` - Création de tâche
- `GET /api/tasks/:id` - Détails d'une tâche
- `PUT /api/tasks/:id` - Mise à jour d'une tâche
- `PUT /api/tasks/:id/status` - Changement de statut
- `DELETE /api/tasks/:id` - Suppression d'une tâche
- `GET /api/tasks/:id/comments` - Commentaires d'une tâche
- `POST /api/tasks/:id/comments` - Ajout d'un commentaire

### Commentaires
- `PUT /api/comments/:id` - Mise à jour d'un commentaire
- `DELETE /api/comments/:id` - Suppression d'un commentaire

### Administration
- `GET /api/admin/users` - Liste des utilisateurs
- `PUT /api/admin/users/:id/role` - Modification du rôle d'un utilisateur
- `DELETE /api/admin/users/:id` - Suppression d'un utilisateur
- `GET /api/admin/logs` - Logs d'audit
- `GET /api/admin/stats` - Statistiques globales

## Déploiement

Le backend peut être déployé sur diverses plateformes comme Heroku, Railway, Render ou AWS :

1. Configurez les variables d'environnement sur la plateforme choisie
2. Déployez le code via Git ou Docker
```bash
# Exemple pour Heroku
heroku create promanage-backend
git push heroku main
```

## Logs d'audit

Le système de logs d'audit enregistre les actions suivantes :
- Inscription/connexion des utilisateurs
- Création/modification/suppression d'équipes
- Création/modification/suppression de projets
- Création/modification/suppression de tâches
- Changements de statut des tâches
- Ajout/suppression de commentaires

## Développement

### Tests
```bash
npm test
```

### Linting
```bash
npm run lint
```

## Collaborateurs

- Lead Backend : Pouch'
- Lead Frontend : Daath
- Full Stack Fonctionnalités : Scipio
- Full Stack Infrastructure : Akitain

## Licence

Ce projet est développé dans le cadre d'un TP académique.