const commentService = require('../services/comment.service');
const { catchAsync, sendResponse } = require('../utils/error.utils');

/**
 * Mettre à jour un commentaire
 * @route PUT /api/comments/:id
 */
exports.updateComment = catchAsync(async (req, res) => {
  const result = await commentService.updateComment(req.params.id, req.body, req.user.id);
  sendResponse(res, 200, 'Commentaire mis à jour avec succès', result);
});

/**
 * Supprimer un commentaire
 * @route DELETE /api/comments/:id
 */
exports.deleteComment = catchAsync(async (req, res) => {
  const result = await commentService.deleteComment(req.params.id, req.user.id);
  sendResponse(res, 200, result.message);
});