const taskService = require('../services/task.service');
const commentService = require('../services/comment.service');
const { catchAsync, sendResponse } = require('../utils/error.utils');

/**
 * Créer une nouvelle tâche
 * @route POST /api/tasks
 */
exports.createTask = catchAsync(async (req, res) => {
  const result = await taskService.createTask(req.body, req.user.id);
  sendResponse(res, 201, 'Tâche créée avec succès', result);
});

/**
 * Mettre à jour une tâche
 * @route PUT /api/tasks/:id
 */
exports.updateTask = catchAsync(async (req, res) => {
  const result = await taskService.updateTask(req.params.id, req.body, req.user.id);
  sendResponse(res, 200, 'Tâche mise à jour avec succès', result);
});

/**
 * Changer le statut d'une tâche
 * @route PUT /api/tasks/:id/status
 */
exports.updateTaskStatus = catchAsync(async (req, res) => {
  const result = await taskService.updateTaskStatus(req.params.id, req.body.status, req.user.id);
  sendResponse(res, 200, 'Statut de la tâche mis à jour avec succès', result);
});

/**
 * Supprimer une tâche
 * @route DELETE /api/tasks/:id
 */
exports.deleteTask = catchAsync(async (req, res) => {
  const result = await taskService.deleteTask(req.params.id, req.user.id);
  sendResponse(res, 200, result.message);
});

/**
 * Récupérer les détails d'une tâche
 * @route GET /api/tasks/:id
 */
exports.getTaskDetails = catchAsync(async (req, res) => {
  const result = await taskService.getTaskDetails(req.params.id);
  sendResponse(res, 200, 'Détails de la tâche récupérés avec succès', result);
});

/**
 * Récupérer toutes les tâches assignées à l'utilisateur connecté
 * @route GET /api/tasks/my
 */
exports.getUserTasks = catchAsync(async (req, res) => {
  const { status, project_id, priority, page, limit } = req.query;
  const options = {
    status,
    project_id,
    priority,
    page: parseInt(page) || 1,
    limit: parseInt(limit) || 10
  };
  
  const result = await taskService.getUserTasks(req.user.id, options);
  sendResponse(res, 200, 'Tâches récupérées avec succès', result);
});

/**
 * Récupérer les commentaires d'une tâche
 * @route GET /api/tasks/:id/comments
 */
exports.getTaskComments = catchAsync(async (req, res) => {
  const { page, limit } = req.query;
  const options = {
    page: parseInt(page) || 1,
    limit: parseInt(limit) || 20
  };
  
  const result = await commentService.getTaskComments(req.params.id, options);
  sendResponse(res, 200, 'Commentaires récupérés avec succès', result);
});

/**
 * Ajouter un commentaire à une tâche
 * @route POST /api/tasks/:id/comments
 */
exports.addComment = catchAsync(async (req, res) => {
  const commentData = {
    content: req.body.content,
    task_id: req.params.id
  };
  
  const result = await commentService.createComment(commentData, req.user.id);
  sendResponse(res, 201, 'Commentaire ajouté avec succès', result);
});