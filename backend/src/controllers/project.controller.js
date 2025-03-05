const projectService = require('../services/project.service');
const taskService = require('../services/task.service');
const statsService = require('../services/stats.service');
const { catchAsync, sendResponse } = require('../utils/error.utils');

/**
 * Créer un nouveau projet
 * @route POST /api/projects
 */
exports.createProject = catchAsync(async (req, res) => {
  const result = await projectService.createProject(req.body, req.user.id);
  sendResponse(res, 201, 'Projet créé avec succès', result);
});

/**
 * Mettre à jour un projet
 * @route PUT /api/projects/:id
 */
exports.updateProject = catchAsync(async (req, res) => {
  const result = await projectService.updateProject(req.params.id, req.body, req.user.id);
  sendResponse(res, 200, 'Projet mis à jour avec succès', result);
});

/**
 * Supprimer un projet
 * @route DELETE /api/projects/:id
 */
exports.deleteProject = catchAsync(async (req, res) => {
  const result = await projectService.deleteProject(req.params.id, req.user.id);
  sendResponse(res, 200, result.message);
});

/**
 * Récupérer les détails d'un projet
 * @route GET /api/projects/:id
 */
exports.getProjectDetails = catchAsync(async (req, res) => {
  const result = await projectService.getProjectDetails(req.params.id);
  sendResponse(res, 200, 'Détails du projet récupérés avec succès', result);
});

/**
 * Récupérer tous les projets de l'utilisateur connecté
 * @route GET /api/projects
 */
exports.getUserProjects = catchAsync(async (req, res) => {
  const result = await projectService.getUserProjects(req.user.id);
  sendResponse(res, 200, 'Projets récupérés avec succès', result);
});

/**
 * Récupérer les projets par équipe
 * @route GET /api/projects/team/:teamId
 */
exports.getTeamProjects = catchAsync(async (req, res) => {
  const { page, limit } = req.query;
  const options = {
    page: parseInt(page) || 1,
    limit: parseInt(limit) || 10
  };
  
  const result = await projectService.getTeamProjects(req.params.teamId, options);
  sendResponse(res, 200, 'Projets de l\'équipe récupérés avec succès', result);
});

/**
 * Archiver un projet
 * @route PUT /api/projects/:id/archive
 */
exports.archiveProject = catchAsync(async (req, res) => {
  const result = await projectService.archiveProject(req.params.id, req.user.id);
  sendResponse(res, 200, 'Projet archivé avec succès', result);
});

/**
 * Récupérer les tâches d'un projet
 * @route GET /api/projects/:id/tasks
 */
exports.getProjectTasks = catchAsync(async (req, res) => {
  const { status, assigned_to, priority, page, limit } = req.query;
  const options = {
    status,
    assigned_to,
    priority,
    page: parseInt(page) || 1,
    limit: parseInt(limit) || 10
  };
  
  const result = await taskService.getProjectTasks(req.params.id, options);
  sendResponse(res, 200, 'Tâches du projet récupérées avec succès', result);
});

/**
 * Récupérer les statistiques d'un projet
 * @route GET /api/projects/:id/stats
 */
exports.getProjectStats = catchAsync(async (req, res) => {
  const result = await statsService.getProjectStats(req.params.id);
  
  if (!result) {
    return sendResponse(res, 404, 'Projet non trouvé');
  }
  
  sendResponse(res, 200, 'Statistiques du projet récupérées avec succès', result);
});