document.addEventListener("DOMContentLoaded", () => {
    // Vérifier si l'utilisateur est connecté
    if (!isLoggedIn()) {
        window.location.href = "index.html";
        return;
    }

    // Récupérer les informations de l'utilisateur
    const user = getUserInfo();

    // Récupérer l'ID du projet depuis l'URL
    const urlParams = new URLSearchParams(window.location.search);
    const projectId = urlParams.get("id");
    const focusTaskId = urlParams.get("task"); // Tâche à mettre en évidence si fournie

    if (!projectId) {
        alert("ID de projet manquant");
        window.location.href = "dashboard.html";
        return;
    }

    // Variables globales
    let currentProject = null;
    let projectMembers = [];
    let projectTasks = [];
    let taskToDelete = null;

    // Références DOM
    const projectName = document.getElementById("projectName");
    const projectDescription = document.getElementById("projectDescription");
    const projectStatus = document.getElementById("projectStatus");
    const projectTeam = document.getElementById("projectTeam");
    const projectDate = document.getElementById("projectDate");
    const backBtn = document.getElementById("backBtn");
    const logoutBtn = document.getElementById("logoutBtn");
    const addTaskBtn = document.getElementById("addTaskBtn");
    const todoTasks = document.getElementById("todoTasks");
    const inProgressTasks = document.getElementById("inProgressTasks");
    const doneTasks = document.getElementById("doneTasks");
    const progressBar = document.getElementById("progressBar");
    const todoCount = document.getElementById("todoCount");
    const inProgressCount = document.getElementById("inProgressCount");
    const doneCount = document.getElementById("doneCount");
    const completionRate = document.getElementById("completionRate");
    const columnCounts = {
        todo: document.getElementById("todoColumnCount"),
        in_progress: document.getElementById("inProgressColumnCount"),
        done: document.getElementById("doneColumnCount"),
    };

    // Filtres
    const assigneeFilter = document.getElementById("assigneeFilter");
    const priorityFilter = document.getElementById("priorityFilter");
    const searchTaskInput = document.getElementById("searchTaskInput");
    const searchTaskBtn = document.getElementById("searchTaskBtn");

    // Modals
    const taskModal = document.getElementById("taskModal");
    const modalTitle = document.getElementById("modalTitle");
    const taskForm = document.getElementById("taskForm");
    const closeTaskModal = taskModal.querySelector(".close");
    const cancelBtn = document.getElementById("cancelBtn");
    const confirmModal = document.getElementById("confirmModal");
    const confirmMessage = document.getElementById("confirmMessage");
    const cancelConfirmBtn = document.getElementById("cancelConfirmBtn");
    const confirmBtn = document.getElementById("confirmBtn");

    // Initialisation
    initEventListeners();
    loadProject();
    loadProjectMembers();
    loadTasks();

    // Initialise les écouteurs d'événements
    function initEventListeners() {
        // Navigation
        backBtn.addEventListener("click", () => {
            window.location.href = "dashboard.html";
        });

        logoutBtn.addEventListener("click", logout);

        // Gestion des tâches
        addTaskBtn.addEventListener("click", () => openTaskModal());

        // Modal des tâches
        closeTaskModal.addEventListener("click", closeModal);
        cancelBtn.addEventListener("click", closeModal);
        taskForm.addEventListener("submit", saveTask);

        // Modal de confirmation
        cancelConfirmBtn.addEventListener(
            "click",
            () => (confirmModal.style.display = "none")
        );
        confirmBtn.addEventListener("click", confirmDelete);

        // Fermer les modals quand on clique à l'extérieur
        window.addEventListener("click", (event) => {
            if (event.target === taskModal) {
                closeModal();
            }
            if (event.target === confirmModal) {
                confirmModal.style.display = "none";
            }
        });

        // Filtres
        assigneeFilter.addEventListener("change", filterTasks);
        priorityFilter.addEventListener("change", filterTasks);
        searchTaskBtn.addEventListener("click", filterTasks);
        searchTaskInput.addEventListener("keypress", (e) => {
            if (e.key === "Enter") {
                filterTasks();
            }
        });

        // Glisser-déposer
        setupDragAndDrop();
    }

    // Configuration du glisser-déposer
    function setupDragAndDrop() {
        const taskLists = document.querySelectorAll(".task-list");

        // Ajouter des écouteurs à chaque colonne
        taskLists.forEach((list) => {
            // Lorsqu'une tâche est survolée au-dessus d'une colonne
            list.addEventListener("dragover", (e) => {
                e.preventDefault();
                const draggedOverTask = getDraggedOverTask(e.clientY, list);

                // Ajouter une classe pour l'effet visuel
                list.classList.add("drag-over");

                // Identifier l'élément au-dessus duquel on survole
                const afterElement = getDragAfterElement(list, e.clientY);
                const draggable = document.querySelector(".dragging");

                if (afterElement) {
                    list.insertBefore(draggable, afterElement);
                } else {
                    list.appendChild(draggable);
                }
            });

            // Lorsque l'on quitte une colonne
            list.addEventListener("dragleave", () => {
                list.classList.remove("drag-over");
            });

            // Lorsque l'on dépose une tâche
            list.addEventListener("drop", (e) => {
                e.preventDefault();
                list.classList.remove("drag-over");

                const draggable = document.querySelector(".dragging");
                if (draggable) {
                    const taskId = draggable.getAttribute("data-id");
                    const newStatus = list.getAttribute("data-status");

                    // Mettre à jour le statut de la tâche
                    updateTaskStatus(taskId, newStatus);

                    // Enlever la classe de glissement
                    draggable.classList.remove("dragging");
                }
            });
        });
    }

    // Trouver l'élément après lequel insérer la tâche glissée
    function getDragAfterElement(container, y) {
        const draggableElements = [
            ...container.querySelectorAll(".task-card:not(.dragging)"),
        ];

        return draggableElements.reduce(
            (closest, child) => {
                const box = child.getBoundingClientRect();
                const offset = y - box.top - box.height / 2;

                if (offset < 0 && offset > closest.offset) {
                    return { offset: offset, element: child };
                } else {
                    return closest;
                }
            },
            { offset: Number.NEGATIVE_INFINITY }
        ).element;
    }

    // Trouver la tâche sur laquelle on survole
    function getDraggedOverTask(y, container) {
        const taskCards = [
            ...container.querySelectorAll(".task-card:not(.dragging)"),
        ];

        return taskCards.find((card) => {
            const rect = card.getBoundingClientRect();
            return y >= rect.top && y <= rect.bottom;
        });
    }

    // Charger les détails du projet
    async function loadProject() {
        try {
            const response = await authenticatedFetch(
                `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PROJECTS}/${projectId}`
            );
            const data = await response.json();

            if (response.ok && data.status === "success") {
                currentProject = data.data;
                displayProjectDetails(currentProject);
            } else {
                showError("Erreur lors du chargement du projet");
                console.error(
                    "Erreur lors du chargement du projet:",
                    data.message
                );
            }
        } catch (error) {
            showError("Une erreur est survenue lors du chargement du projet");
            console.error("Erreur lors du chargement du projet:", error);
        }
    }

    // Afficher les détails du projet
    function displayProjectDetails(project) {
        // Titre et description
        projectName.textContent = project.name;
        projectDescription.textContent =
            project.description || "Aucune description";
        document.title = `ProManage - ${project.name}`;

        // Statut du projet
        const statusIcon =
            project.status === "active" ? "fa-check-circle" : "fa-archive";
        const statusText = project.status === "active" ? "Actif" : "Archivé";
        const statusClass =
            project.status === "active" ? "status-active" : "status-archived";

        projectStatus.innerHTML = `<i class="fas ${statusIcon}"></i> ${statusText}`;
        projectStatus.className = `project-status ${statusClass}`;

        // Équipe
        if (project.team) {
            projectTeam.innerHTML = `<i class="fas fa-users"></i> ${project.team.name}`;
        } else {
            projectTeam.innerHTML = `<i class="fas fa-users"></i> Aucune équipe`;
        }

        // Date de création
        const createdDate = new Date(project.createdAt);
        const formattedDate = createdDate.toLocaleDateString("fr-FR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });

        projectDate.innerHTML = `<i class="fas fa-calendar-alt"></i> Créé le ${formattedDate}`;
    }

    // Charger les membres du projet
    async function loadProjectMembers(projectId) {
        try {
            // D'abord, récupérer les détails du projet pour obtenir l'ID de l'équipe
            const projectResponse = await authenticatedFetch(
                `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PROJECTS}/${projectId}`
            );
            const projectData = await projectResponse.json();

            if (projectResponse.ok && projectData.status === "success") {
                const teamId = projectData.data.team_id;

                // Ensuite, charger les membres de cette équipe
                if (teamId) {
                    const membersResponse = await authenticatedFetch(
                        `${API_CONFIG.BASE_URL}/teams/${teamId}/members`
                    );
                    const membersData = await membersResponse.json();

                    if (
                        membersResponse.ok &&
                        membersData.status === "success"
                    ) {
                        const members = membersData.data.members || [];

                        // Remplir le select d'assignation
                        projectMembers = members;
                        populateAssigneeDropdowns();
                    }
                }
            }
        } catch (error) {
            console.error("Erreur lors du chargement des membres:", error);
        }
    }

    // Remplir les listes déroulantes d'assignation
    function populateAssigneeDropdowns() {
        // Liste déroulante du formulaire
        const taskAssignee = document.getElementById("taskAssignee");
        taskAssignee.innerHTML = '<option value="">Non assigné</option>';

        // Liste déroulante du filtre
        assigneeFilter.innerHTML = '<option value="">Tous</option>';

        projectMembers.forEach((member) => {
            // Ajouter au formulaire
            const formOption = document.createElement("option");
            formOption.value = member.id;
            formOption.textContent = member.name;
            taskAssignee.appendChild(formOption);

            // Ajouter au filtre
            const filterOption = document.createElement("option");
            filterOption.value = member.id;
            filterOption.textContent = member.name;
            assigneeFilter.appendChild(filterOption);
        });
    }

    // Charger les tâches du projet
    async function loadTasks() {
        resetTaskLists();

        try {
            const response = await authenticatedFetch(
                `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PROJECTS}/${projectId}/tasks`
            );
            const data = await response.json();

            if (response.ok && data.status === "success") {
                projectTasks = data.data.tasks || [];
                displayTasks(projectTasks);
                updateProjectStats();

                // Si une tâche spécifique est demandée dans l'URL, la mettre en évidence
                if (focusTaskId) {
                    setTimeout(() => {
                        const focusedTask = document.querySelector(
                            `.task-card[data-id="${focusTaskId}"]`
                        );
                        if (focusedTask) {
                            focusedTask.scrollIntoView({ behavior: "smooth" });
                            focusedTask.classList.add("highlight-task");
                            setTimeout(() => {
                                focusedTask.classList.remove("highlight-task");
                            }, 2000);
                        }
                    }, 500);
                }
            } else {
                showError("Erreur lors du chargement des tâches");
                console.error(
                    "Erreur lors du chargement des tâches:",
                    data.message
                );
            }
        } catch (error) {
            showError("Une erreur est survenue lors du chargement des tâches");
            console.error("Erreur lors du chargement des tâches:", error);
        }
    }

    // Réinitialiser les listes de tâches
    function resetTaskLists() {
        todoTasks.innerHTML =
            '<div class="loading">Chargement des tâches...</div>';
        inProgressTasks.innerHTML =
            '<div class="loading">Chargement des tâches...</div>';
        doneTasks.innerHTML =
            '<div class="loading">Chargement des tâches...</div>';
    }

    // Afficher les tâches dans les colonnes
    function displayTasks(tasks) {
        // Réinitialiser les listes
        todoTasks.innerHTML = "";
        inProgressTasks.innerHTML = "";
        doneTasks.innerHTML = "";

        // Compteurs pour chaque colonne
        const counts = {
            todo: 0,
            in_progress: 0,
            done: 0,
        };

        // Vérifier s'il y a des tâches
        if (tasks.length === 0) {
            todoTasks.innerHTML =
                '<div class="empty-state">Aucune tâche à faire</div>';
            inProgressTasks.innerHTML =
                '<div class="empty-state">Aucune tâche en cours</div>';
            doneTasks.innerHTML =
                '<div class="empty-state">Aucune tâche terminée</div>';
            return;
        }

        // Filtrer et afficher les tâches
        const filteredTasks = filterTasksArray(tasks);

        filteredTasks.forEach((task) => {
            const taskCard = createTaskCard(task);

            // Ajouter la carte à la colonne appropriée
            switch (task.status) {
                case "todo":
                    todoTasks.appendChild(taskCard);
                    counts.todo++;
                    break;
                case "in_progress":
                    inProgressTasks.appendChild(taskCard);
                    counts.in_progress++;
                    break;
                case "done":
                    doneTasks.appendChild(taskCard);
                    counts.done++;
                    break;
            }
        });

        // Mettre à jour les compteurs de colonnes
        updateColumnCounts(counts);

        // Afficher des messages si les colonnes sont vides après filtrage
        if (counts.todo === 0) {
            todoTasks.innerHTML =
                '<div class="empty-state">Aucune tâche correspondante</div>';
        }
        if (counts.in_progress === 0) {
            inProgressTasks.innerHTML =
                '<div class="empty-state">Aucune tâche correspondante</div>';
        }
        if (counts.done === 0) {
            doneTasks.innerHTML =
                '<div class="empty-state">Aucune tâche correspondante</div>';
        }
    }

    // Filtrer les tâches selon les critères sélectionnés
    function filterTasksArray(tasks) {
        const assigneeValue = assigneeFilter.value;
        const priorityValue = priorityFilter.value;
        const searchValue = searchTaskInput.value.trim().toLowerCase();

        return tasks.filter((task) => {
            // Filtre par assignation
            if (
                assigneeValue &&
                (!task.assignee || task.assignee.id !== assigneeValue)
            ) {
                return false;
            }

            // Filtre par priorité
            if (priorityValue && task.priority !== priorityValue) {
                return false;
            }

            // Filtre par recherche
            if (searchValue) {
                const titleMatch = task.title
                    .toLowerCase()
                    .includes(searchValue);
                const descMatch = task.description
                    ? task.description.toLowerCase().includes(searchValue)
                    : false;
                if (!titleMatch && !descMatch) {
                    return false;
                }
            }

            return true;
        });
    }

    // Mettre à jour l'affichage après filtrage
    function filterTasks() {
        displayTasks(projectTasks);
    }

    // Mettre à jour les compteurs de colonnes
    function updateColumnCounts(counts) {
        columnCounts.todo.textContent = counts.todo;
        columnCounts.in_progress.textContent = counts.in_progress;
        columnCounts.done.textContent = counts.done;
    }

    // Créer une carte de tâche
    function createTaskCard(task) {
        const div = document.createElement("div");
        div.className = "task-card";
        div.setAttribute("data-id", task.id);
        div.setAttribute("draggable", "true");

        // Gestion du glisser-déposer
        div.addEventListener("dragstart", () => {
            div.classList.add("dragging");
        });

        div.addEventListener("dragend", () => {
            div.classList.remove("dragging");
        });

        // Déterminer la classe de priorité
        let priorityClass = "";
        let priorityText = "";

        switch (task.priority) {
            case "high":
                priorityClass = "priority-high";
                priorityText = "Haute";
                break;
            case "medium":
                priorityClass = "priority-medium";
                priorityText = "Moyenne";
                break;
            case "low":
                priorityClass = "priority-low";
                priorityText = "Basse";
                break;
            default:
                priorityClass = "priority-medium";
                priorityText = "Moyenne";
        }

        // Calculer si la tâche est en retard
        let isOverdue = false;
        let deadlineBadge = "";

        if (task.deadline) {
            const deadlineDate = new Date(task.deadline);
            const today = new Date();
            isOverdue = deadlineDate < today && task.status !== "done";

            const formattedDeadline = deadlineDate.toLocaleDateString("fr-FR");
            const badgeClass = isOverdue
                ? "badge-deadline overdue"
                : "badge-deadline";

            deadlineBadge = `<span class="${badgeClass}">
                <i class="fas fa-calendar-day"></i> ${formattedDeadline}
            </span>`;
        }

        // Créer l'initiale pour l'avatar
        let assigneeAvatar = "";
        let assigneeName = "Non assigné";

        if (task.assignee) {
            const initials = task.assignee.name.charAt(0).toUpperCase();
            assigneeName = task.assignee.name;
            assigneeAvatar = `<div class="assignee-avatar">${initials}</div>`;
        }

        // Construire la carte de tâche
        div.innerHTML = `
            <div class="task-priority-indicator ${priorityClass}"></div>
            <div class="task-header">
                <h3 class="task-title">${task.title}</h3>
                <div class="task-actions">
                    <button class="task-action-btn view-task-btn" title="Voir les détails">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="task-action-btn edit-task-btn" title="Modifier">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="task-action-btn delete-task-btn" title="Supprimer">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="task-badges">
                <span class="task-badge badge-priority-${task.priority}">
                    <i class="fas fa-flag"></i> ${priorityText}
                </span>
                ${deadlineBadge}
            </div>
            <div class="task-description">${
                task.description || "Aucune description"
            }</div>
            <div class="task-meta">
                <div class="task-assignee">
                    ${assigneeAvatar}
                    <span>${assigneeName}</span>
                </div>
            </div>
        `;

        // Ajouter les écouteurs d'événements pour les actions
        div.querySelector(".view-task-btn").addEventListener("click", () => {
            window.location.href = `task-detail.html?id=${task.id}&projectId=${projectId}`;
        });

        div.querySelector(".edit-task-btn").addEventListener("click", () => {
            openTaskModal(task);
        });

        div.querySelector(".delete-task-btn").addEventListener("click", () => {
            openDeleteConfirmation(task);
        });

        return div;
    }

    // Mettre à jour les statistiques du projet
    function updateProjectStats() {
        const counts = {
            todo: 0,
            in_progress: 0,
            done: 0,
            total: projectTasks.length,
        };

        projectTasks.forEach((task) => {
            counts[task.status]++;
        });

        // Mettre à jour les compteurs
        todoCount.textContent = counts.todo;
        inProgressCount.textContent = counts.in_progress;
        doneCount.textContent = counts.done;

        // Calculer le taux d'achèvement
        const completionPercentage =
            counts.total > 0
                ? Math.round((counts.done / counts.total) * 100)
                : 0;

        completionRate.textContent = `${completionPercentage}%`;
        progressBar.style.width = `${completionPercentage}%`;
    }

    // Ouvrir le modal de tâche (création ou édition)
    function openTaskModal(task = null) {
        const taskIdInput = document.getElementById("taskId");
        const taskTitleInput = document.getElementById("taskTitle");
        const taskDescriptionInput = document.getElementById("taskDescription");
        const taskStatusInput = document.getElementById("taskStatus");
        const taskPriorityInput = document.getElementById("taskPriority");
        const taskDeadlineInput = document.getElementById("taskDeadline");
        const taskAssigneeInput = document.getElementById("taskAssignee");

        // Réinitialiser le formulaire
        taskForm.reset();

        if (task) {
            // Mode édition
            modalTitle.textContent = "Modifier la tâche";
            taskIdInput.value = task.id;
            taskTitleInput.value = task.title;
            taskDescriptionInput.value = task.description || "";
            taskStatusInput.value = task.status;
            taskPriorityInput.value = task.priority || "medium";

            // Formater la date au format YYYY-MM-DD
            if (task.deadline) {
                const deadlineDate = new Date(task.deadline);
                const year = deadlineDate.getFullYear();
                const month = String(deadlineDate.getMonth() + 1).padStart(
                    2,
                    "0"
                );
                const day = String(deadlineDate.getDate()).padStart(2, "0");
                taskDeadlineInput.value = `${year}-${month}-${day}`;
            }

            // Sélectionner l'assigné si présent
            if (task.assignee) {
                taskAssigneeInput.value = task.assignee.id;
            }
        } else {
            // Mode création
            modalTitle.textContent = "Ajouter une tâche";
            taskIdInput.value = "";
            taskStatusInput.value = "todo"; // Par défaut pour les nouvelles tâches
            taskPriorityInput.value = "medium"; // Priorité moyenne par défaut
        }

        // Afficher le modal
        taskModal.style.display = "block";
    }

    // Fermer le modal
    function closeModal() {
        taskModal.style.display = "none";
        taskForm.reset();
    }

    // Ouvrir la confirmation de suppression
    function openDeleteConfirmation(task) {
        taskToDelete = task.id;
        confirmMessage.textContent = `Êtes-vous sûr de vouloir supprimer la tâche "${task.title}" ?`;
        confirmModal.style.display = "block";
    }

    // Confirmer la suppression
    async function confirmDelete() {
        if (!taskToDelete) return;

        try {
            const response = await authenticatedFetch(
                `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.TASKS}/${taskToDelete}`,
                {
                    method: "DELETE",
                }
            );

            const data = await response.json();

            if (response.ok && data.status === "success") {
                // Fermer le modal
                confirmModal.style.display = "none";

                // Recharger les tâches
                loadTasks();
            } else {
                showError("Erreur lors de la suppression de la tâche");
                console.error(
                    "Erreur lors de la suppression de la tâche:",
                    data.message
                );
            }
        } catch (error) {
            showError(
                "Une erreur est survenue lors de la suppression de la tâche"
            );
            console.error("Erreur lors de la suppression de la tâche:", error);
        }
    }

    // Enregistrer une tâche (création ou modification)
    async function saveTask(event) {
        event.preventDefault();

        const taskId = document.getElementById("taskId").value;
        const title = document.getElementById("taskTitle").value;
        const description = document.getElementById("taskDescription").value;
        const status = document.getElementById("taskStatus").value;
        const priority = document.getElementById("taskPriority").value;
        const deadline = document.getElementById("taskDeadline").value;
        const assigneeId = document.getElementById("taskAssignee").value;

        const taskData = {
            title,
            description,
            status,
            priority,
        };

        // Ajouter la date d'échéance si spécifiée
        if (deadline) {
            taskData.deadline = deadline;
        }

        // Ajouter l'assigné si spécifié
        if (assigneeId) {
            taskData.assignee_id = assigneeId;
        }

        try {
            let response, url, method;

            if (taskId) {
                // Mode édition
                url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.TASKS}/${taskId}`;
                method = "PUT";
            } else {
                // Mode création
                url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.TASKS}`;
                method = "POST";
                taskData.project_id = projectId;
            }

            response = await authenticatedFetch(url, {
                method,
                body: JSON.stringify(taskData),
            });

            const data = await response.json();

            if (response.ok && data.status === "success") {
                // Fermer le modal
                closeModal();

                // Recharger les tâches
                loadTasks();
            } else {
                showError("Erreur lors de l'enregistrement de la tâche");
                console.error(
                    "Erreur lors de l'enregistrement de la tâche:",
                    data.message
                );
            }
        } catch (error) {
            showError(
                "Une erreur est survenue lors de l'enregistrement de la tâche"
            );
            console.error(
                "Erreur lors de l'enregistrement de la tâche:",
                error
            );
        }
    }

    // Mettre à jour le statut d'une tâche (pour le glisser-déposer)
    async function updateTaskStatus(taskId, newStatus) {
        try {
            const response = await authenticatedFetch(
                `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.TASKS}/${taskId}/status`,
                {
                    method: "PUT",
                    body: JSON.stringify({ status: newStatus }),
                }
            );

            const data = await response.json();

            if (response.ok && data.status === "success") {
                // Mettre à jour la tâche dans la liste locale
                const taskIndex = projectTasks.findIndex(
                    (task) => task.id === taskId
                );
                if (taskIndex !== -1) {
                    projectTasks[taskIndex].status = newStatus;
                    updateProjectStats();
                }
            } else {
                showError("Erreur lors de la mise à jour du statut");
                console.error(
                    "Erreur lors de la mise à jour du statut:",
                    data.message
                );
                loadTasks(); // Recharger les tâches pour revenir à l'état précédent
            }
        } catch (error) {
            showError(
                "Une erreur est survenue lors de la mise à jour du statut"
            );
            console.error("Erreur lors de la mise à jour du statut:", error);
            loadTasks(); // Recharger les tâches pour revenir à l'état précédent
        }
    }

    // Afficher un message d'erreur
    function showError(message) {
        const errorDiv = document.createElement("div");
        errorDiv.className = "error";
        errorDiv.textContent = message;

        // Ajouter le message au début du main
        const main = document.querySelector("main");
        main.insertBefore(errorDiv, main.firstChild);

        // Faire défiler vers le haut pour voir l'erreur
        window.scrollTo({ top: 0, behavior: "smooth" });

        // Supprimer l'erreur après un délai
        setTimeout(() => {
            errorDiv.remove();
        }, 5000);
    }
});
