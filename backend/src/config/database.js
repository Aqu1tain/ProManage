const { Sequelize } = require('sequelize');
const mongoose = require('mongoose');
const logger = require('./logger');

// Configuration PostgreSQL pour les données relationnelles
const sequelize = new Sequelize({
  dialect: 'postgres',
  host: process.env.POSTGRES_HOST,
  port: process.env.POSTGRES_PORT,
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  logging: (msg) => logger.debug(msg),
  define: {
    timestamps: true,
    underscored: true
  }
});

// Tester la connexion à PostgreSQL
const connectPostgres = async () => {
  try {
    await sequelize.authenticate();
    logger.info('Connexion à PostgreSQL établie avec succès');
    
    // En développement, synchroniser les modèles avec la base de données
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: true });
      logger.info('Modèles synchronisés avec PostgreSQL');
    }
  } catch (error) {
    logger.error('Impossible de se connecter à PostgreSQL:', error);
  }
};

// Configuration MongoDB pour les logs d'audit
const connectMongo = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    logger.info('Connexion à MongoDB établie avec succès');
  } catch (error) {
    logger.error('Impossible de se connecter à MongoDB:', error);
  }
};

// Initialiser les connexions
connectPostgres();
connectMongo();

module.exports = {
  sequelize,
  mongoose
};