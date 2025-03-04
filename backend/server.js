const express = require('express');
const cors = require('cors');
const { testSQLConnection, connectMongo } = require('./config/db');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes de base
app.get('/', (req, res) => {
  res.json({ message: 'Bienvenue sur l\'API ProManage!' });
});

// Tester les connexions aux bases de données au démarrage
const initServer = async () => {
  const sqlConnected = await testSQLConnection();
  const mongoConnected = await connectMongo();
  
  if (sqlConnected && mongoConnected) {
    app.listen(PORT, () => {
      console.log(`Serveur en cours d'exécution sur le port ${PORT}`);
    });
  } else {
    console.error('Impossible de démarrer le serveur en raison de problèmes de connexion à la base de données');
  }
};

initServer();