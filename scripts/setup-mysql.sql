-- Script d'initialisation de la base de données MySQL pour ProManage

-- Créer la base de données si elle n'existe pas
CREATE DATABASE IF NOT EXISTS promanage CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Utiliser la base de données
USE promanage;

-- Créer un utilisateur pour l'application (optionnel - à adapter selon votre environnement)
-- Remplacer 'password' par un mot de passe sécurisé
CREATE USER IF NOT EXISTS 'promanage_user'@'localhost' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON promanage.* TO 'promanage_user'@'localhost';
FLUSH PRIVILEGES;

-- Note: Les tables seront créées automatiquement par Sequelize lors du lancement de l'application
-- Ce script ne fait que préparer la base de données et l'utilisateur