/**
 * Classe d'erreur personnalisée pour l'application
 * Permet de distinguer les erreurs opérationnelles des erreurs de programmation
 */
class AppError extends Error {
    constructor(message, statusCode) {
      super(message);
      
      this.statusCode = statusCode;
      this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
      this.isOperational = true;
      
      Error.captureStackTrace(this, this.constructor);
    }
  }
  
  /**
   * Wrapper pour les contrôleurs asynchrones qui élimine le besoin de try/catch
   * @param {Function} fn - Fonction asynchrone à wrapper
   * @returns {Function} Middleware Express
   */
  const catchAsync = fn => {
    return (req, res, next) => {
      fn(req, res, next).catch(next);
    };
  };
  
  /**
   * Fonction utilitaire pour renvoyer une réponse de succès
   * @param {Object} res - Objet de réponse Express
   * @param {number} statusCode - Code de statut HTTP (par défaut 200)
   * @param {string} message - Message de succès
   * @param {*} data - Données à renvoyer
   */
  const sendResponse = (res, statusCode = 200, message, data) => {
    const response = {
      status: 'success'
    };
  
    if (message) response.message = message;
    if (data) response.data = data;
  
    res.status(statusCode).json(response);
  };
  
  /**
   * Classe pour les erreurs de validation
   */
  class ValidationError extends AppError {
    constructor(errors) {
      super('Erreur de validation', 400);
      this.errors = errors;
    }
  }
  
  module.exports = {
    AppError,
    catchAsync,
    sendResponse,
    ValidationError
  };