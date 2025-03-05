const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');

// Importation des configurations
require('./config/database');
const logger = require('./config/logger');

// Importation des routes
const authRoutes = require('./routes/auth.routes');
const teamRoutes = require('./routes/team.routes');
const projectRoutes = require('./routes/project.routes');
const taskRoutes = require('./routes/task.routes');
const commentRoutes = require('./routes/comment.routes');
const adminRoutes = require('./routes/admin.routes');

// Importation des middlewares
const errorMiddleware = require('./middlewares/error.middleware');

const app = express();

// Middlewares de sécurité et de base
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware de logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));
}

// Définition des routes
app.use('/api/auth', authRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/admin', adminRoutes);

// Route de base pour vérifier que l'API est en ligne
app.get('/', (req, res) => {
  res.json({ message: 'Bienvenue sur l\'API ProManage' });
});

// Middleware pour gérer les routes non trouvées
app.all('*', (req, res) => {
  res.status(404).json({
    status: 'fail',
    message: `La route ${req.originalUrl} n'existe pas sur ce serveur`
  });
});

// Middleware de gestion des erreurs
app.use(errorMiddleware);

module.exports = app;