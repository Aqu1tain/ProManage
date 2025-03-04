// Configuration pour MySQL (utilisateurs, projets)
const { Sequelize } = require('sequelize');
const mongoose = require('mongoose');
require('dotenv').config();

// Configuration MySQL avec Sequelize
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    port: process.env.DB_PORT || 3306,
    logging: false,
  }
);

// Fonction pour tester la connexion MySQL
const testSQLConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('Connexion à la base de données MySQL établie avec succès.');
    return true;
  } catch (error) {
    console.error('Impossible de se connecter à la base de données MySQL:', error);
    return false;
  }
};

// Configuration MongoDB pour les logs d'audit
const connectMongo = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connexion à MongoDB établie avec succès.');
    return true;
  } catch (error) {
    console.error('Impossible de se connecter à MongoDB:', error);
    return false;
  }
};

module.exports = {
  sequelize,
  testSQLConnection,
  connectMongo,
};