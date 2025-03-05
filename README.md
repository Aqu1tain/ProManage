# ProManage

ProManage est une plateforme SaaS de gestion de projets conçue pour les équipes d'étudiants et les petites équipes collaboratives. Elle permet de créer des projets, gérer des tâches, suivre l'avancement et collaborer efficacement.

## 🚀 Fonctionnalités

- Gestion d'utilisateurs avec plusieurs rôles (Admin, Chef de projet, Contributeur)
- Création et gestion de projets
- Tableaux de tâches avec statuts personnalisables
- Système de commentaires sur les tâches
- Logs d'audit pour suivre les actions des utilisateurs
- Interface administrateur pour la gestion de la plateforme

## 💻 Prérequis

- Node.js (v14 ou supérieur)
- MySQL/MariaDB
- MongoDB
- npm ou yarn

## 📋 Installation

1. **Cloner le repository**
   ```bash
   git clone https://github.com/Aqu1tain/ProManage.git
   cd ProManage
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Configurer les variables d'environnement**
   ```bash
   cp .env.example .env
   # Modifier le fichier .env avec vos configurations
   ```

4. **Démarrer le serveur en mode développement**
   ```bash
   npm run dev
   ```

5. **Accéder à l'application**
   - Backend API: http://localhost:3000
   - L'interface frontend sera disponible lors de la phase suivante du développement

## 🏗️ Structure du projet

```
/
├── config/         # Configurations (DB, auth)
├── controllers/    # Contrôleurs pour les routes
├── middleware/     # Middleware Express
├── models/         # Modèles Sequelize & Mongoose
├── routes/         # Routes de l'API
├── services/       # Services métier
├── .env            # Variables d'environnement
├── server.js       # Point d'entrée
└── package.json    # Dépendances
```

## 🛠️ Technologies

- **Backend**: Node.js avec Express
- **Base de données**: MySQL (via Sequelize) pour les données principales, MongoDB pour les logs
- **Authentification**: JWT
- **Frontend**: React (à venir)

## 👥 Équipe de développement

- **Lead Backend**: Pouch'
- **Lead Frontend**: Daath
- **Full Stack - Fonctionnalités Projets**: Scipio
- **Full Stack - Infrastructure**: Akitain

## 📝 Licence

Ce projet est développé dans le cadre d'un travail pratique académique.

## 🚀 Déploiement

Le projet peut être déployé sur des plateformes comme Heroku, Railway, Render, ou tout autre service compatible avec Node.js.