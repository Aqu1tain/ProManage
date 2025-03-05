const logger = require('../config/logger');
const { AppError } = require('../utils/error.utils');

// Gestion des erreurs de développement vs production
const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack
  });
};

const sendErrorProd = (err, res) => {
  // Erreur opérationnelle connue : envoyer le message au client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    });
  } else {
    // Erreur de programmation ou inconnue : ne pas divulguer les détails
    logger.error('ERREUR 💥', err);
    res.status(500).json({
      status: 'error',
      message: 'Une erreur est survenue. Veuillez réessayer ultérieurement.'
    });
  }
};

// Gestionnaires d'erreurs spécifiques
const handleSequelizeUniqueConstraintError = (err) => {
  const message = `Valeur en double : ${err.errors.map(e => e.path).join(', ')} doit être unique.`;
  return new AppError(message, 400);
};

const handleSequelizeValidationError = (err) => {
  const message = `Données invalides : ${err.errors.map(e => e.message).join('. ')}`;
  return new AppError(message, 400);
};

const handleJWTError = () => new AppError('Token invalide. Veuillez vous reconnecter.', 401);

const handleJWTExpiredError = () => new AppError('Votre session a expiré. Veuillez vous reconnecter.', 401);

// Middleware principal de gestion des erreurs
module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else {
    let error = { ...err };
    error.message = err.message;

    // Erreurs Sequelize
    if (err.name === 'SequelizeUniqueConstraintError') error = handleSequelizeUniqueConstraintError(err);
    if (err.name === 'SequelizeValidationError') error = handleSequelizeValidationError(err);

    // Erreurs JWT
    if (err.name === 'JsonWebTokenError') error = handleJWTError();
    if (err.name === 'TokenExpiredError') error = handleJWTExpiredError();

    sendErrorProd(error, res);
  }
};