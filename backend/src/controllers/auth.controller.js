const authService = require('../services/auth.service');
const { catchAsync, sendResponse } = require('../utils/error.utils');
const { roles } = require('../config/auth');

/**
 * Inscription d'un chef de projet
 * @route POST /api/auth/register
 */
exports.register = catchAsync(async (req, res) => {
  // Si le rôle est chef de projet, utiliser la méthode spécifique
  if (req.body.role === roles.PROJECT_MANAGER) {
    const result = await authService.registerProjectManager(req.body);
    return sendResponse(res, 201, 'Chef de projet inscrit avec succès', result);
  }
  
  // Si le rôle est administrateur et que l'utilisateur est déjà admin
  if (req.body.role === roles.ADMIN && req.user && req.user.role === roles.ADMIN) {
    const result = await authService.registerAdmin(req.body);
    return sendResponse(res, 201, 'Administrateur inscrit avec succès', result);
  }
  
  // Par défaut, empêcher l'inscription directe de contributeurs (qui doivent utiliser une clé)
  return sendResponse(res, 400, 'Les contributeurs doivent s\'inscrire avec une clé d\'invitation');
});

/**
 * Inscription d'un contributeur avec clé d'invitation
 * @route POST /api/auth/join
 */
exports.join = catchAsync(async (req, res) => {
  const result = await authService.registerContributor(req.body);
  sendResponse(res, 201, 'Contributeur inscrit avec succès', result);
});

/**
 * Connexion d'un utilisateur
 * @route POST /api/auth/login
 */
exports.login = catchAsync(async (req, res) => {
  const result = await authService.login(req.body);
  sendResponse(res, 200, 'Connexion réussie', result);
});

/**
 * Récupérer le profil de l'utilisateur connecté
 * @route GET /api/auth/me
 */
exports.getProfile = catchAsync(async (req, res) => {
  const result = await authService.getProfile(req.user.id);
  sendResponse(res, 200, 'Profil récupéré avec succès', result);
});

/**
 * Mettre à jour le profil de l'utilisateur connecté
 * @route PUT /api/auth/me
 */
exports.updateProfile = catchAsync(async (req, res) => {
  const result = await authService.updateProfile(req.user.id, req.body);
  sendResponse(res, 200, 'Profil mis à jour avec succès', result);
});

/**
 * Changer le mot de passe de l'utilisateur connecté
 * @route PUT /api/auth/change-password
 */
exports.changePassword = catchAsync(async (req, res) => {
  const result = await authService.changePassword(req.user.id, req.body);
  sendResponse(res, 200, result.message);
});