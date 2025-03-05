// Script pour initialiser la base de données MongoDB pour ProManage
// À exécuter avec: mongo setup-mongodb.js

// Utilisation de la base de données
db = db.getSiblingDB('promanage-logs');

// Créer une collection pour les logs d'audit
db.createCollection('auditlogs');

// Créer un index sur le champ timestamp pour les requêtes de filtre par date
db.auditlogs.createIndex({ timestamp: -1 });

// Créer un index sur userId pour filtrer par utilisateur
db.auditlogs.createIndex({ userId: 1 });

// Créer un index sur action pour filtrer par type d'action
db.auditlogs.createIndex({ action: 1 });

print("Configuration MongoDB terminée avec succès!");

// Note: Cette configuration est minimale pour le développement
// Pour la production, ajouter un utilisateur avec mot de passe:
/*
db.createUser({
  user: "promanage_user",
  pwd: "password", // Remplacer par un mot de passe sécurisé
  roles: [
    { role: "readWrite", db: "promanage-logs" }
  ]
});
*/