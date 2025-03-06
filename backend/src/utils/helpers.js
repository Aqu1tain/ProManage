const jwt = require('jsonwebtoken');
const { jwtSecret, jwtExpiresIn } = require('../config/auth');

/**
 * Génère un token JWT pour un utilisateur
 * @param {Object} user - Utilisateur pour lequel générer le token
 * @returns {string} Token JWT
 */
exports.generateToken = (user) => {
  return jwt.sign(
    { 
      id: user.id,
      email: user.email,
      role: user.role
    },
    jwtSecret,
    { expiresIn: jwtExpiresIn }
  );
};

/**
 * Fonction pour paginer les résultats
 * @param {Object} options - Options de pagination
 * @param {number} options.page - Numéro de page
 * @param {number} options.limit - Nombre d'éléments par page
 * @param {number} options.total - Nombre total d'éléments
 * @returns {Object} Informations de pagination
 */
exports.getPagination = ({ page = 1, limit = 10, total }) => {
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const pagination = {};

  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit
    };
  }

  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit
    };
  }

  pagination.total = total;
  pagination.totalPages = Math.ceil(total / limit);
  pagination.currentPage = page;
  pagination.limit = limit;

  return pagination;
};

/**
 * Fonction pour filtrer les données sensibles d'un utilisateur
 * @param {Object} user - Utilisateur à filtrer
 * @returns {Object} Utilisateur sans données sensibles
 */
exports.filterUserData = (user) => {
  const { password, ...userWithoutPassword } = user.toJSON ? user.toJSON() : user;
  return userWithoutPassword;
};

/**
 * Convertit une chaîne en slug URL-friendly
 * @param {string} string - Chaîne à convertir
 * @returns {string} Slug
 */
exports.slugify = (string) => {
  return string
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')     // Remplace les espaces par des tirets
    .replace(/&/g, '-and-')    // Remplace & par 'and'
    .replace(/[^\w\-]+/g, '')  // Supprime tous les caractères non-mot
    .replace(/\-\-+/g, '-');   // Remplace les tirets multiples par un seul
};

/**
 * Génère un identifiant aléatoire
 * @param {number} length - Longueur de l'identifiant (défaut: 10)
 * @returns {string} Identifiant aléatoire
 */
exports.generateRandomId = (length = 10) => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

/**
 * Formate une date en chaîne lisible
 * @param {Date} date - Date à formater
 * @returns {string} Date formatée
 */
exports.formatDate = (date) => {
  return new Date(date).toLocaleString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};