const express = require('express');
const projectController = require('../controllers/project.controller');
const { validate, projectSchemas } = require('../utils/validation.utils');
const { protect, isProjectManager, isProjectMember } = require('../middlewares/auth.middleware');
const { createAuditLog } = require('../middlewares/audit.middleware');

const router = express.Router();

// Toutes les routes nécessitent une authentification
router.use(protect);

// Récupérer les projets de l'utilisateur
router.get(
  '/',
  projectController.getUserProjects
);

// Créer un nouveau projet (seulement chef de projet)
router.post(
  '/',
  isProjectManager,
  validate(projectSchemas.create),
  createAuditLog('project.create', { entityType: 'project' }),
  projectController.createProject
);

// Routes pour un projet spécifique
router.get(
  '/:id',
  isProjectMember,
  projectController.getProjectDetails
);

router.put(
  '/:id',
  isProjectMember,
  validate(projectSchemas.update),
  createAuditLog('project.update', { entityType: 'project', getEntityId: req => req.params.id }),
  projectController.updateProject
);

router.delete(
  '/:id',
  isProjectManager,
  createAuditLog('project.delete', { entityType: 'project', getEntityId: req => req.params.id }),
  projectController.deleteProject
);

router.put(
  '/:id/archive',
  isProjectManager,
  createAuditLog('project.archive', { entityType: 'project', getEntityId: req => req.params.id }),
  projectController.archiveProject
);

// Récupérer les tâches d'un projet
router.get(
  '/:id/tasks',
  isProjectMember,
  projectController.getProjectTasks
);

// Récupérer les statistiques d'un projet
router.get(
  '/:id/stats',
  isProjectMember,
  projectController.getProjectStats
);

// Récupérer les projets d'une équipe
router.get(
  '/team/:teamId',
  projectController.getTeamProjects
);

module.exports = router;