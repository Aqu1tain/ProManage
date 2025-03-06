const express = require("express");
const taskController = require("../controllers/task.controller");
const {
    validate,
    taskSchemas,
    commentSchemas,
} = require("../utils/validation.utils");
const { protect, isProjectMember } = require("../middlewares/auth.middleware");
const { createAuditLog } = require("../middlewares/audit.middleware");

const router = express.Router();

// Toutes les routes nécessitent une authentification
router.use(protect);

// Créer une nouvelle tâche
router.post(
    "/",
    validate(taskSchemas.create),
    createAuditLog("task.create", { entityType: "task" }),
    taskController.createTask
);

// Récupérer les tâches de l'utilisateur connecté
router.get("/my", taskController.getUserTasks);

// Routes pour une tâche spécifique
router.get("/:id", isProjectMember, taskController.getTaskDetails);

// Mise à jour d'une tâche, y compris le statut si fourni dans le payload
router.put(
    "/:id",
    isProjectMember,
    // Mise à jour du schéma de validation pour autoriser "status"
    validate(taskSchemas.update),
    createAuditLog("task.update", {
        entityType: "task",
        getEntityId: (req) => req.params.id,
        getDetails: (req) => ({ status: req.body.status }),
    }),
    taskController.updateTask
);

// Supprimer une tâche
router.delete(
    "/:id",
    isProjectMember,
    createAuditLog("task.delete", {
        entityType: "task",
        getEntityId: (req) => req.params.id,
    }),
    taskController.deleteTask
);

// Commentaires sur les tâches
router.get("/:id/comments", isProjectMember, taskController.getTaskComments);

router.post(
    "/:id/comments",
    isProjectMember,
    validate(commentSchemas.create),
    createAuditLog("comment.create", {
        entityType: "comment",
        getDetails: (req) => ({ task_id: req.params.id }),
    }),
    taskController.addComment
);

module.exports = router;
