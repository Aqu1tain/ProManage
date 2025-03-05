const jwt = require('jsonwebtoken');
const User = require('../models/sql/user.model');
const { jwtSecret, roles } = require('../config/auth');
const { AppError } = require('../utils/error.utils');

// Middleware pour vérifier le token JWT
exports.protect = async (req, res, next) => {
  try {
    let token;
    
    // Récupérer le token du header Authorization
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    // Vérifier si le token existe
    if (!token) {
      return next(new AppError('Vous n\'êtes pas connecté. Veuillez vous connecter pour accéder à cette ressource.', 401));
    }
    
    // Vérifier le token
    const decoded = jwt.verify(token, jwtSecret);
    
    // Vérifier si l'utilisateur existe toujours
    const currentUser = await User.findByPk(decoded.id);
    if (!currentUser) {
      return next(new AppError('L\'utilisateur associé à ce token n\'existe plus.', 401));
    }
    
    // Mettre à jour la date de dernière connexion
    await currentUser.update({ last_login: new Date() });
    
    // Ajouter l'utilisateur à la requête
    req.user = currentUser;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return next(new AppError('Token invalide. Veuillez vous reconnecter.', 401));
    }
    if (error.name === 'TokenExpiredError') {
      return next(new AppError('Votre session a expiré. Veuillez vous reconnecter.', 401));
    }
    next(error);
  }
};

// Middleware pour restreindre l'accès à certains rôles
exports.restrictTo = (...allowedRoles) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      return next(new AppError('Vous n\'avez pas la permission d\'effectuer cette action.', 403));
    }
    next();
  };
};

// Middlewares spécifiques pour les rôles
exports.isAdmin = (req, res, next) => {
  if (req.user.role !== roles.ADMIN) {
    return next(new AppError('Accès réservé aux administrateurs.', 403));
  }
  next();
};

exports.isProjectManager = (req, res, next) => {
  if (req.user.role !== roles.PROJECT_MANAGER && req.user.role !== roles.ADMIN) {
    return next(new AppError('Accès réservé aux chefs de projet.', 403));
  }
  next();
};

// Middleware pour vérifier si l'utilisateur appartient à un projet
exports.isProjectMember = async (req, res, next) => {
  try {
    const projectId = req.params.id || req.body.project_id;
    
    if (!projectId) {
      return next(new AppError('ID de projet manquant', 400));
    }
    
    // Si l'utilisateur est admin, autoriser l'accès
    if (req.user.role === roles.ADMIN) {
      return next();
    }
    
    // Vérifier si l'utilisateur appartient au projet
    const Project = require('../models/sql/project.model');
    const project = await Project.findByPk(projectId);
    
    if (!project) {
      return next(new AppError('Projet non trouvé', 404));
    }
    
    // Si l'utilisateur est le chef de projet ou est un membre de l'équipe
    if (project.created_by === req.user.id || project.team_id === req.user.team_id) {
      return next();
    }
    
    return next(new AppError('Vous n\'êtes pas membre de ce projet', 403));
  } catch (error) {
    next(error);
  }
};