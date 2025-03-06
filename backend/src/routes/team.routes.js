const express = require('express');
const teamController = require('../controllers/team.controller');
const { validate, teamSchemas } = require('../utils/validation.utils');
const { protect, isAdmin, isProjectManager } = require('../middlewares/auth.middleware');
const { createAuditLog } = require('../middlewares/audit.middleware');

const router = express.Router();

// Toutes les routes nécessitent une authentification
router.use(protect);

// Route pour récupérer son équipe
router.get(
  '/my',
  teamController.getUserTeam
);

// Routes réservées aux admin et chefs de projet
router.use(isProjectManager);

// Création et gestion d'équipe
router.post(
  '/',
  validate(teamSchemas.create),
  createAuditLog('team.create', { entityType: 'team' }),
  teamController.createTeam
);

router.put(
  '/:id',
  validate(teamSchemas.update),
  createAuditLog('team.update', { entityType: 'team', getEntityId: req => req.params.id }),
  teamController.updateTeam
);

router.put(
  '/:id/regenerate-key',
  createAuditLog('team.regenerate_key', { entityType: 'team', getEntityId: req => req.params.id }),
  teamController.regenerateInvitationKey
);

router.delete(
  '/:id/members/:memberId',
  createAuditLog('team.remove_member', { 
    entityType: 'team', 
    getEntityId: req => req.params.id,
    getDetails: req => ({ removed_member_id: req.params.memberId })
  }),
  teamController.removeMember
);

// Route pour récupérer les détails d'une équipe
router.get(
  '/:id',
  teamController.getTeamDetails
);

// Routes réservées aux admin
router.get(
  '/',
  isAdmin,
  teamController.getAllTeams
);

module.exports = router;