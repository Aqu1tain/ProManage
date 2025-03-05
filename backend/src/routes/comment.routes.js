const express = require('express');
const commentController = require('../controllers/comment.controller');
const { validate, commentSchemas } = require('../utils/validation.utils');
const { protect } = require('../middlewares/auth.middleware');
const { createAuditLog } = require('../middlewares/audit.middleware');

const router = express.Router();

// Toutes les routes nécessitent une authentification
router.use(protect);

// Mettre à jour un commentaire
router.put(
  '/:id',
  validate(commentSchemas.create),
  createAuditLog('comment.update', { entityType: 'comment', getEntityId: req => req.params.id }),
  commentController.updateComment
);

// Supprimer un commentaire
router.delete(
  '/:id',
  createAuditLog('comment.delete', { entityType: 'comment', getEntityId: req => req.params.id }),
  commentController.deleteComment
);

module.exports = router;