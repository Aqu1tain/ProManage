const teamService = require('../services/team.service');
const { catchAsync, sendResponse } = require('../utils/error.utils');

/**
 * Créer une nouvelle équipe
 * @route POST /api/teams
 */
exports.createTeam = catchAsync(async (req, res) => {
  const result = await teamService.createTeam(req.body, req.user.id);
  sendResponse(res, 201, 'Équipe créée avec succès', result);
});

/**
 * Mettre à jour une équipe
 * @route PUT /api/teams/:id
 */
exports.updateTeam = catchAsync(async (req, res) => {
  const result = await teamService.updateTeam(req.params.id, req.body, req.user.id);
  sendResponse(res, 200, 'Équipe mise à jour avec succès', result);
});

/**
 * Récupérer les détails d'une équipe
 * @route GET /api/teams/:id
 */
exports.getTeamDetails = catchAsync(async (req, res) => {
  const result = await teamService.getTeamDetails(req.params.id);
  sendResponse(res, 200, 'Détails de l\'équipe récupérés avec succès', result);
});

/**
 * Récupérer l'équipe de l'utilisateur connecté
 * @route GET /api/teams/my
 */
exports.getUserTeam = catchAsync(async (req, res) => {
  const result = await teamService.getUserTeam(req.user.id);
  sendResponse(res, 200, 'Équipe récupérée avec succès', result);
});

/**
 * Générer une nouvelle clé d'invitation pour une équipe
 * @route PUT /api/teams/:id/regenerate-key
 */
exports.regenerateInvitationKey = catchAsync(async (req, res) => {
  const result = await teamService.regenerateInvitationKey(req.params.id, req.user.id);
  sendResponse(res, 200, 'Clé d\'invitation régénérée avec succès', result);
});

/**
 * Supprimer un membre d'une équipe
 * @route DELETE /api/teams/:id/members/:memberId
 */
exports.removeMember = catchAsync(async (req, res) => {
  const result = await teamService.removeMember(
    req.params.id,
    req.params.memberId,
    req.user.id
  );
  sendResponse(res, 200, result.message);
});

/**
 * Lister toutes les équipes (admin uniquement)
 * @route GET /api/teams
 */
exports.getAllTeams = catchAsync(async (req, res) => {
  const { page, limit } = req.query;
  const options = {
    page: parseInt(page) || 1,
    limit: parseInt(limit) || 10
  };
  
  const result = await teamService.getAllTeams(options);
  sendResponse(res, 200, 'Équipes récupérées avec succès', result);
});