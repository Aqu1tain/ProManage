document.addEventListener("DOMContentLoaded", () => {
    // Vérifier si l'utilisateur est connecté
    if (!isLoggedIn()) {
        window.location.href = "index.html";
        return;
    }

    // Récupérer les informations de l'utilisateur connecté
    const user = getUserInfo();

    // Récupérer les IDs depuis l'URL
    const urlParams = new URLSearchParams(window.location.search);
    const taskId = urlParams.get("id");
    const projectId = urlParams.get("projectId");

    if (!taskId || !projectId) {
        alert("Identifiants manquants dans l'URL");
        window.location.href = "dashboard.html";
        return;
    }

    // Éléments DOM
    const taskTitle = document.getElementById("taskTitle");
    const taskDescription = document.getElementById("taskDescription");
    const taskStatus = document.getElementById("taskStatus");
    const taskPriority = document.getElementById("taskPriority");
    const taskDeadline = document.getElementById("taskDeadline");
    const taskAssignee = document.getElementById("taskAssignee");
    const taskCreatedAt = document.getElementById("taskCreatedAt");
    const taskUpdatedAt = document.getElementById("taskUpdatedAt");
    const commentsContainer = document.getElementById("commentsContainer");
    const commentForm = document.getElementById("commentForm");
    const commentContent = document.getElementById("commentContent");

    // Boutons et modals
    const backBtn = document.getElementById("backBtn");
    const logoutBtn = document.getElementById("logoutBtn");
    const editTaskBtn = document.getElementById("editTaskBtn");
    const changeStatusBtn = document.getElementById("changeStatusBtn");
    const statusModal = document.getElementById("statusModal");
    const editTaskModal = document.getElementById("editTaskModal");
    const statusForm = document.getElementById("statusForm");
    const editTaskForm = document.getElementById("editTaskForm");

    // Éléments des modals
    const closeStatusModal = statusModal.querySelector(".close");
    const cancelStatusBtn = document.getElementById("cancelStatusBtn");
    const closeEditModal = editTaskModal.querySelector(".close");
    const cancelEditBtn = document.getElementById("cancelEditBtn");
    const newStatus = document.getElementById("newStatus");
    const editTaskTitle = document.getElementById("editTaskTitle");
    const editTaskDescription = document.getElementById("editTaskDescription");
    const editTaskPriority = document.getElementById("editTaskPriority");
    const editTaskDeadline = document.getElementById("editTaskDeadline");
    const editTaskAssignee = document.getElementById("editTaskAssignee");

    // Variable pour stocker les données de la tâche
    let currentTask = null;

    // Événements
    backBtn.addEventListener("click", () => {
        window.location.href = `project.html?id=${projectId}`;
    });

    logoutBtn.addEventListener("click", logout);

    // Événements des modals
    changeStatusBtn.addEventListener("click", openStatusModal);
    closeStatusModal.addEventListener("click", hideStatusModal);
    cancelStatusBtn.addEventListener("click", hideStatusModal);
    statusForm.addEventListener("submit", updateTaskStatus);

    editTaskBtn.addEventListener("click", openEditTaskModal);
    closeEditModal.addEventListener("click", closeEditTaskModal);
    cancelEditBtn.addEventListener("click", closeEditTaskModal);
    editTaskForm.addEventListener("submit", updateTaskDetails);

    // Formulaire de commentaire
    commentForm.addEventListener("submit", submitComment);

    // Fermer les modals lorsqu'on clique en dehors
    window.addEventListener("click", (event) => {
        if (event.target === statusModal) {
            hideStatusModal();
        }
        if (event.target === editTaskModal) {
            closeEditTaskModal();
        }
    });

    // Charger les données
    loadTaskDetails();
    loadComments();

    // =====  FONCTIONS =====

    // Charger les détails de la tâche
    async function loadTaskDetails() {
        try {
            const response = await authenticatedFetch(
                `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.TASKS}/${taskId}`
            );
            const data = await response.json();

            if (response.ok && data.status === "success") {
                currentTask = data.data;
                displayTaskDetails(currentTask);

                // Charger les membres du projet pour l'assignation
                loadProjectMembers(currentTask.project_id);
            } else {
                console.error(
                    "Erreur lors du chargement de la tâche:",
                    data.message
                );
                alert("Erreur lors du chargement des détails de la tâche");
            }
        } catch (error) {
            console.error("Erreur lors du chargement de la tâche:", error);
            alert("Une erreur est survenue lors du chargement de la tâche");
        }
    }

    // Afficher les détails de la tâche
    function displayTaskDetails(task) {
        // Titre et description
        taskTitle.textContent = task.title;
        taskDescription.textContent = task.description || "Aucune description";

        // Statut
        let statusText;
        switch (task.status) {
            case "todo":
                statusText = "À faire";
                taskStatus.className = "task-status status-todo";
                break;
            case "in_progress":
                statusText = "En cours";
                taskStatus.className = "task-status status-in-progress";
                break;
            case "done":
                statusText = "Terminé";
                taskStatus.className = "task-status status-done";
                break;
            default:
                statusText = "Statut inconnu";
                taskStatus.className = "task-status";
        }
        taskStatus.textContent = statusText;

        // Priorité
        let priorityText;
        switch (task.priority) {
            case "low":
                priorityText = "Priorité: Basse";
                taskPriority.className = "task-priority priority-low";
                break;
            case "medium":
                priorityText = "Priorité: Moyenne";
                taskPriority.className = "task-priority priority-medium";
                break;
            case "high":
                priorityText = "Priorité: Haute";
                taskPriority.className = "task-priority priority-high";
                break;
            default:
                priorityText = "";
                taskPriority.className = "task-priority";
        }
        taskPriority.textContent = priorityText;

        // Date d'échéance
        if (task.deadline) {
            const deadlineDate = new Date(task.deadline);
            const now = new Date();
            const isOverdue = deadlineDate < now && task.status !== "done";

            const formattedDeadline = deadlineDate.toLocaleDateString("fr-FR");
            taskDeadline.textContent = `Échéance: ${formattedDeadline}`;

            if (isOverdue) {
                taskDeadline.classList.add("overdue");
            } else {
                taskDeadline.classList.remove("overdue");
            }
        } else {
            taskDeadline.textContent = "Pas d'échéance";
            taskDeadline.classList.remove("overdue");
        }

        // Assigné à
        taskAssignee.textContent = task.assignee
            ? task.assignee.name
            : "Non assigné";

        // Dates de création et mise à jour
        if (task.createdAt) {
            const createdDate = new Date(task.createdAt);
            taskCreatedAt.textContent = createdDate.toLocaleDateString(
                "fr-FR",
                {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                }
            );
        }

        if (task.updatedAt) {
            const updatedDate = new Date(task.updatedAt);
            taskUpdatedAt.textContent = updatedDate.toLocaleDateString(
                "fr-FR",
                {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                }
            );
        }

        // Mettre à jour le titre de la page
        document.title = `ProManage - ${task.title}`;
    }

    // Charger les membres du projet pour l'assignation
    async function loadProjectMembers(projectId) {
        try {
            const response = await authenticatedFetch(
                `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PROJECTS}/${projectId}/members`
            );
            const data = await response.json();

            if (response.ok && data.status === "success") {
                const members = data.data.members || [];

                // Remplir le select d'assignation
                editTaskAssignee.innerHTML =
                    '<option value="">Non assigné</option>';

                members.forEach((member) => {
                    const option = document.createElement("option");
                    option.value = member.id;
                    option.textContent = member.name;

                    if (
                        currentTask.assignee &&
                        currentTask.assignee.id === member.id
                    ) {
                        option.selected = true;
                    }

                    editTaskAssignee.appendChild(option);
                });
            } else {
                console.error(
                    "Erreur lors du chargement des membres:",
                    data.message
                );
            }
        } catch (error) {
            console.error("Erreur lors du chargement des membres:", error);
        }
    }

    // Ouvrir le modal de changement de statut
    function openStatusModal() {
        // Définir la valeur actuelle du statut
        newStatus.value = currentTask.status;
        statusModal.style.display = "block";
    }

    // Fermer le modal de changement de statut
    function hideStatusModal() {
        statusModal.style.display = "none";
    }

    // Ouvrir le modal d'édition de tâche
    function openEditTaskModal() {
        // Remplir le formulaire avec les valeurs actuelles
        editTaskTitle.value = currentTask.title;
        editTaskDescription.value = currentTask.description || "";
        editTaskPriority.value = currentTask.priority || "medium";

        if (currentTask.deadline) {
            // Formater la date au format YYYY-MM-DD pour l'input date
            const deadlineDate = new Date(currentTask.deadline);
            const formattedDate = deadlineDate.toISOString().split("T")[0];
            editTaskDeadline.value = formattedDate;
        } else {
            editTaskDeadline.value = "";
        }

        editTaskModal.style.display = "block";
    }

    // Fermer le modal d'édition de tâche
    function closeEditTaskModal() {
        editTaskModal.style.display = "none";
    }

    // Mettre à jour le statut de la tâche
    async function updateTaskStatus(event) {
        event.preventDefault();

        const status = newStatus.value;

        try {
            const response = await authenticatedFetch(
                `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.TASKS}/${taskId}/status`,
                {
                    method: "PUT",
                    body: JSON.stringify({ status }),
                }
            );

            const data = await response.json();

            if (response.ok && data.status === "success") {
                hideStatusModal();
                loadTaskDetails(); // Recharger les détails de la tâche
            } else {
                console.error(
                    "Erreur lors de la mise à jour du statut:",
                    data.message
                );
                alert(
                    `Erreur: ${
                        data.message || "Impossible de mettre à jour le statut"
                    }`
                );
            }
        } catch (error) {
            console.error("Erreur lors de la mise à jour du statut:", error);
            alert("Une erreur est survenue lors de la mise à jour du statut");
        }
    }

    // Mettre à jour les détails de la tâche
    async function updateTaskDetails(event) {
        event.preventDefault();

        const updatedTask = {
            title: editTaskTitle.value,
            description: editTaskDescription.value,
            priority: editTaskPriority.value,
            deadline: editTaskDeadline.value || null,
            assignee_id: editTaskAssignee.value || null,
        };

        try {
            const response = await authenticatedFetch(
                `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.TASKS}/${taskId}`,
                {
                    method: "PUT",
                    body: JSON.stringify(updatedTask),
                }
            );

            const data = await response.json();

            if (response.ok && data.status === "success") {
                closeEditTaskModal();
                loadTaskDetails(); // Recharger les détails de la tâche
            } else {
                console.error(
                    "Erreur lors de la mise à jour de la tâche:",
                    data.message
                );
                alert(
                    `Erreur: ${
                        data.message || "Impossible de mettre à jour la tâche"
                    }`
                );
            }
        } catch (error) {
            console.error("Erreur lors de la mise à jour de la tâche:", error);
            alert("Une erreur est survenue lors de la mise à jour de la tâche");
        }
    }

    // Charger les commentaires
    async function loadComments() {
        try {
            commentsContainer.innerHTML =
                '<div class="loading">Chargement des commentaires...</div>';

            const response = await authenticatedFetch(
                `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.TASKS}/${taskId}/comments`
            );
            const data = await response.json();

            commentsContainer.innerHTML = "";

            if (response.ok && data.status === "success") {
                const comments = data.data.comments || [];

                if (comments.length === 0) {
                    commentsContainer.innerHTML =
                        '<div class="empty-state">Aucun commentaire pour le moment</div>';
                    return;
                }

                comments.forEach((comment) => {
                    const commentElement = createCommentElement(comment);
                    commentsContainer.appendChild(commentElement);
                });
            } else {
                console.error(
                    "Erreur lors du chargement des commentaires:",
                    data.message
                );
                commentsContainer.innerHTML =
                    '<div class="error">Erreur lors du chargement des commentaires</div>';
            }
        } catch (error) {
            console.error("Erreur lors du chargement des commentaires:", error);
            commentsContainer.innerHTML =
                '<div class="error">Une erreur est survenue lors du chargement des commentaires</div>';
        }
    }

    // Créer un élément de commentaire
    function createCommentElement(comment) {
        const div = document.createElement("div");
        div.className = "comment";
        div.dataset.id = comment.id;

        const createdDate = new Date(comment.createdAt);
        const formattedDate = createdDate.toLocaleDateString("fr-FR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });

        div.innerHTML = `
            <div class="comment-header">
                <span class="comment-author">${
                    comment.author ? comment.author.name : "Utilisateur inconnu"
                }</span>
                <span class="comment-date">${formattedDate}</span>
            </div>
            <div class="comment-content">${comment.content}</div>
        `;

        // Ajouter des actions si l'utilisateur est l'auteur
        if (comment.author && comment.author.id === user.id) {
            const actionsDiv = document.createElement("div");
            actionsDiv.className = "comment-actions";

            const editBtn = document.createElement("button");
            editBtn.className = "btn btn-sm btn-secondary";
            editBtn.textContent = "Modifier";
            editBtn.addEventListener("click", () => editComment(comment));

            const deleteBtn = document.createElement("button");
            deleteBtn.className = "btn btn-sm btn-danger";
            deleteBtn.textContent = "Supprimer";
            deleteBtn.addEventListener("click", () => {
                if (
                    confirm(
                        "Êtes-vous sûr de vouloir supprimer ce commentaire?"
                    )
                ) {
                    deleteComment(comment.id);
                }
            });

            actionsDiv.appendChild(editBtn);
            actionsDiv.appendChild(deleteBtn);
            div.appendChild(actionsDiv);
        }

        return div;
    }

    // Soumettre un commentaire
    async function submitComment(event) {
        event.preventDefault();

        const content = commentContent.value.trim();

        if (!content) return;

        try {
            const response = await authenticatedFetch(
                `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.TASKS}/${taskId}/comments`,
                {
                    method: "POST",
                    body: JSON.stringify({ content }),
                }
            );

            const data = await response.json();

            if (response.ok && data.status === "success") {
                commentContent.value = ""; // Vider le champ
                loadComments(); // Recharger les commentaires
            } else {
                console.error(
                    "Erreur lors de l'ajout du commentaire:",
                    data.message
                );
                alert(
                    `Erreur: ${
                        data.message || "Impossible d'ajouter le commentaire"
                    }`
                );
            }
        } catch (error) {
            console.error("Erreur lors de l'ajout du commentaire:", error);
            alert("Une erreur est survenue lors de l'ajout du commentaire");
        }
    }

    // Éditer un commentaire
    function editComment(comment) {
        // Remplacer le contenu par un champ de texte
        const commentElement = document.querySelector(
            `.comment[data-id="${comment.id}"]`
        );
        const contentElement = commentElement.querySelector(".comment-content");
        const actionsElement = commentElement.querySelector(".comment-actions");

        const originalContent = contentElement.textContent;

        // Créer un champ de texte
        const textarea = document.createElement("textarea");
        textarea.value = originalContent;
        textarea.className = "edit-comment-textarea";

        // Remplacer le contenu par le champ de texte
        contentElement.innerHTML = "";
        contentElement.appendChild(textarea);

        // Créer les boutons de sauvegarde et d'annulation
        const saveBtn = document.createElement("button");
        saveBtn.className = "btn btn-sm btn-primary";
        saveBtn.textContent = "Enregistrer";
        saveBtn.addEventListener("click", async () => {
            const newContent = textarea.value.trim();

            if (!newContent) return;

            try {
                const response = await authenticatedFetch(
                    `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.COMMENTS}/${comment.id}`,
                    {
                        method: "PUT",
                        body: JSON.stringify({ content: newContent }),
                    }
                );

                const data = await response.json();

                if (response.ok && data.status === "success") {
                    loadComments(); // Recharger les commentaires
                } else {
                    console.error(
                        "Erreur lors de la mise à jour du commentaire:",
                        data.message
                    );
                    alert(
                        `Erreur: ${
                            data.message ||
                            "Impossible de mettre à jour le commentaire"
                        }`
                    );

                    // Restaurer le contenu original
                    contentElement.textContent = originalContent;

                    // Restaurer les actions originales
                    actionsElement.innerHTML = "";
                    const editBtn = document.createElement("button");
                    editBtn.className = "btn btn-sm btn-secondary";
                    editBtn.textContent = "Modifier";
                    editBtn.addEventListener("click", () =>
                        editComment(comment)
                    );

                    const deleteBtn = document.createElement("button");
                    deleteBtn.className = "btn btn-sm btn-danger";
                    deleteBtn.textContent = "Supprimer";
                    deleteBtn.addEventListener("click", () => {
                        if (
                            confirm(
                                "Êtes-vous sûr de vouloir supprimer ce commentaire?"
                            )
                        ) {
                            deleteComment(comment.id);
                        }
                    });

                    actionsElement.appendChild(editBtn);
                    actionsElement.appendChild(deleteBtn);
                }
            } catch (error) {
                console.error(
                    "Erreur lors de la mise à jour du commentaire:",
                    error
                );
                alert(
                    "Une erreur est survenue lors de la mise à jour du commentaire"
                );

                // Restaurer le contenu original
                contentElement.textContent = originalContent;
            }
        });

        const cancelBtn = document.createElement("button");
        cancelBtn.className = "btn btn-sm btn-secondary";
        cancelBtn.textContent = "Annuler";
        cancelBtn.addEventListener("click", () => {
            // Restaurer le contenu original
            contentElement.textContent = originalContent;

            // Restaurer les actions originales
            actionsElement.innerHTML = "";
            const editBtn = document.createElement("button");
            editBtn.className = "btn btn-sm btn-secondary";
            editBtn.textContent = "Modifier";
            editBtn.addEventListener("click", () => editComment(comment));

            const deleteBtn = document.createElement("button");
            deleteBtn.className = "btn btn-sm btn-danger";
            deleteBtn.textContent = "Supprimer";
            deleteBtn.addEventListener("click", () => {
                if (
                    confirm(
                        "Êtes-vous sûr de vouloir supprimer ce commentaire?"
                    )
                ) {
                    deleteComment(comment.id);
                }
            });

            actionsElement.appendChild(editBtn);
            actionsElement.appendChild(deleteBtn);
        });

        // Remplacer les actions par les nouveaux boutons
        actionsElement.innerHTML = "";
        actionsElement.appendChild(saveBtn);
        actionsElement.appendChild(cancelBtn);

        // Focus sur le champ de texte
        textarea.focus();
    }

    // Supprimer un commentaire
    async function deleteComment(commentId) {
        try {
            const response = await authenticatedFetch(
                `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.COMMENTS}/${commentId}`,
                {
                    method: "DELETE",
                }
            );

            const data = await response.json();

            if (response.ok && data.status === "success") {
                loadComments(); // Recharger les commentaires
            } else {
                console.error(
                    "Erreur lors de la suppression du commentaire:",
                    data.message
                );
                alert(
                    `Erreur: ${
                        data.message || "Impossible de supprimer le commentaire"
                    }`
                );
            }
        } catch (error) {
            console.error(
                "Erreur lors de la suppression du commentaire:",
                error
            );
            alert(
                "Une erreur est survenue lors de la suppression du commentaire"
            );
        }
    }
});
