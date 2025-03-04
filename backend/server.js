const express = require('express');
const cors = require('cors');
const { testSQLConnection, connectMongo } = require('./config/db');
const { syncDatabase } = require('./models/index');
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

// Importer les routes 
// Décommenter ces lignes quand les routes seront créées
// const authRoutes = require('./routes/auth');
// const userRoutes = require('./routes/users');
// const projectRoutes = require('./routes/projects');
// const taskRoutes = require('./routes/tasks');

// Utiliser les routes
// app.use('/api/auth', authRoutes);
// app.use('/api/users', userRoutes);
// app.use('/api/projects', projectRoutes);
// app.use('/api/tasks', taskRoutes);

// Middleware pour les erreurs 404
app.use((req, res, next) => {
  res.status(404).json({ message: 'Route non trouvée' });
});

// Middleware pour les erreurs globales
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Erreur serveur', error: process.env.NODE_ENV === 'development' ? err.message : {} });
});

// Tester les connexions aux bases de données et synchroniser les modèles au démarrage
const initServer = async () => {
  const sqlConnected = await testSQLConnection();
  const mongoConnected = await connectMongo();
  
  if (sqlConnected && mongoConnected) {
    // Synchroniser les modèles avec la base de données
    const dbSynced = await syncDatabase(false); // false = ne pas forcer la recréation des tables
    
    if (dbSynced) {
      app.listen(PORT, () => {
        console.log(`Serveur en cours d'exécution sur le port ${PORT}`);
        console.log(`Environnement: ${process.env.NODE_ENV}`);
      });
    } else {
      console.error('Impossible de synchroniser les modèles de base de données');
    }
  } else {
    console.error('Impossible de démarrer le serveur en raison de problèmes de connexion à la base de données');
  }
};

initServer();