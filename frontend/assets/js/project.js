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

    if (!projectId) {
        alert("ID de projet manquant");
        window.location.href = "dashboard.html";
        return;
    }

    // Références aux éléments DOM
    const projectName = document.getElementById("projectName");
    const projectDescription = document.getElementById("projectDescription");
    const projectStatus = document.getElementById("projectStatus");
    const projectDate = document.getElementById("projectDate");
    const backBtn = document.getElementById("backBtn");
    const logoutBtn = document.getElementById("logoutBtn");
    const addTaskBtn = document.getElementById("addTaskBtn");
    const todoTasks = document.getElementById("todoTasks");
    const inProgressTasks = document.getElementById("inProgressTasks");
    const completedTasks = document.getElementById("completedTasks");

    // Références pour le modal
    const taskModal = document.getElementById("taskModal");
    const modalTitle = document.getElementById("modalTitle");
    const taskForm = document.getElementById("taskForm");
    const closeBtn = document.querySelector(".close");
    const cancelBtn = document.getElementById("cancelBtn");

    // Gérer les événements
    backBtn.addEventListener("click", () => {
        window.location.href = "dashboard.html";
    });

    logoutBtn.addEventListener("click", () => {
        logout();
    });

    // Gestionnaires pour le modal
    addTaskBtn.addEventListener("click", () => {
        openTaskModal();
    });

    closeBtn.addEventListener("click", () => {
        closeTaskModal();
    });

    cancelBtn.addEventListener("click", () => {
        closeTaskModal();
    });

    window.addEventListener("click", (event) => {
        if (event.target === taskModal) {
            closeTaskModal();
        }
    });

    taskForm.addEventListener("submit", (event) => {
        event.preventDefault();
        saveTask();
    });

    // Charger les données du projet
    loadProject(projectId);
    loadTasks(projectId);

    // Fonction pour ouvrir le modal d'ajout de tâche
    function openTaskModal(task = null) {
        const taskIdInput = document.getElementById("taskId");
        const taskTitleInput = document.getElementById("taskTitle");
        const taskDescriptionInput = document.getElementById("taskDescription");
        const taskStatusInput = document.getElementById("taskStatus");

        // Réinitialiser le formulaire
        taskForm.reset();

        if (task) {
            // Mode édition
            modalTitle.textContent = "Modifier la tâche";
            taskIdInput.value = task.id;
            taskTitleInput.value = task.title;
            taskDescriptionInput.value = task.description || "";
            taskStatusInput.value = task.status;
        } else {
            // Mode création
            modalTitle.textContent = "Ajouter une tâche";
            taskIdInput.value = "";
        }

        // Afficher le modal
        taskModal.style.display = "block";
    }

    // Fonction pour fermer le modal
    function closeTaskModal() {
        taskModal.style.display = "none";
    }

    // Fonction pour charger les détails du projet
    async function loadProject(projectId) {
        try {
            const response = await authenticatedFetch(
                `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PROJECTS}/${projectId}`
            );
            const data = await response.json();

            console.log("Détails du projet:", data);

            if (response.ok && data.status === "success") {
                const project = data.data;

                // Mettre à jour le DOM avec les détails du projet
                projectName.textContent = project.name;
                projectDescription.textContent =
                    project.description || "Aucune description";

                // Traduire le statut
                const statusText =
                    project.status === "active" ? "Actif" : "Archivé";
                projectStatus.textContent = statusText;
                projectStatus.className = `project-status status-${project.status}`;

                // Formater la date de création
                const createdDate = new Date(project.createdAt);
                const formattedDate = createdDate.toLocaleDateString("fr-FR", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                });

                projectDate.textContent = `Créé le ${formattedDate}`;

                // Mettre à jour le titre de la page
                document.title = `ProManage - ${project.name}`;
            } else {
                console.error(
                    "Erreur lors du chargement du projet:",
                    data.message
                );
                alert("Erreur lors du chargement des détails du projet");
            }
        } catch (error) {
            console.error("Erreur lors du chargement du projet:", error);
            alert("Une erreur est survenue lors du chargement du projet");
        }
    }

    // Fonction pour charger les tâches du projet
    // Fonction pour charger les tâches du projet
    async function loadTasks(projectId) {
        try {
            // Réinitialiser les listes de tâches
            todoTasks.innerHTML =
                '<div class="loading">Chargement des tâches...</div>';
            inProgressTasks.innerHTML =
                '<div class="loading">Chargement des tâches...</div>';
            completedTasks.innerHTML =
                '<div class="loading">Chargement des tâches...</div>';

            const response = await authenticatedFetch(
                `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PROJECTS}/${projectId}/tasks`
            );
            const data = await response.json();

            console.log("Tâches du projet:", data);

            // Réinitialiser les conteneurs
            todoTasks.innerHTML = "";
            inProgressTasks.innerHTML = "";
            completedTasks.innerHTML = "";

            if (response.ok && data.status === "success") {
                // Corriger l'accès aux tâches dans la structure de réponse
                const tasks = data.data.tasks || [];

                // S'il n'y a pas de tâches, afficher un message
                if (tasks.length === 0) {
                    todoTasks.innerHTML =
                        '<div class="empty-state">Aucune tâche</div>';
                    inProgressTasks.innerHTML =
                        '<div class="empty-state">Aucune tâche</div>';
                    completedTasks.innerHTML =
                        '<div class="empty-state">Aucune tâche</div>';
                    return;
                }

                // Organiser les tâches par statut
                tasks.forEach((task) => {
                    const taskElement = createTaskElement(task);

                    // Ajouter la tâche dans la colonne appropriée
                    switch (task.status) {
                        case "todo":
                            todoTasks.appendChild(taskElement);
                            break;
                        case "in_progress":
                            inProgressTasks.appendChild(taskElement);
                            break;
                        case "completed":
                            completedTasks.appendChild(taskElement);
                            break;
                        default:
                            todoTasks.appendChild(taskElement);
                    }
                });

                // Afficher des informations de pagination si nécessaire
                if (data.data.total > data.data.limit) {
                    const paginationInfo = document.createElement("div");
                    paginationInfo.className = "pagination-info";
                    paginationInfo.textContent = `Affichage de ${tasks.length} tâches sur ${data.data.total} (page ${data.data.page}/${data.data.totalPages})`;

                    // Ajouter cette information à un endroit approprié dans l'interface
                    // Pour l'instant, on peut l'ajouter en bas des colonnes
                    document
                        .querySelector(".task-container")
                        .appendChild(paginationInfo);
                }
            } else {
                console.error(
                    "Erreur lors du chargement des tâches:",
                    data.message
                );
                todoTasks.innerHTML =
                    '<div class="error">Erreur lors du chargement des tâches</div>';
                inProgressTasks.innerHTML =
                    '<div class="error">Erreur lors du chargement des tâches</div>';
                completedTasks.innerHTML =
                    '<div class="error">Erreur lors du chargement des tâches</div>';
            }
        } catch (error) {
            console.error("Erreur lors du chargement des tâches:", error);
            todoTasks.innerHTML =
                '<div class="error">Erreur lors du chargement des tâches</div>';
            inProgressTasks.innerHTML =
                '<div class="error">Erreur lors du chargement des tâches</div>';
            completedTasks.innerHTML =
                '<div class="error">Erreur lors du chargement des tâches</div>';
        }
    }

    // Fonction pour créer un élément de tâche
    function createTaskElement(task) {
        const div = document.createElement("div");
        div.className = "task-card";
        div.dataset.id = task.id;

        // Traduire le statut pour l'affichage
        let statusText;
        switch (task.status) {
            case "todo":
                statusText = "À faire";
                break;
            case "in_progress":
                statusText = "En cours";
                break;
            case "completed":
                statusText = "Terminé";
                break;
            default:
                statusText = "Inconnu";
        }

        div.innerHTML = `
        <h3>${task.title}</h3>
        <p>${task.description || "Aucune description"}</p>
        <div class="task-footer">
          <div class="task-assignee">
            <span>Assigné à: ${task.assignee_name || "Non assigné"}</span>
          </div>
          <div class="task-actions">
            <button class="btn btn-secondary edit-task" data-id="${
                task.id
            }">Modifier</button>
            <button class="btn btn-danger delete-task" data-id="${
                task.id
            }">Supprimer</button>
          </div>
        </div>
      `;

        // Ajouter les écouteurs d'événements aux boutons
        div.querySelector(".edit-task").addEventListener("click", () => {
            openTaskModal(task);
        });

        div.querySelector(".delete-task").addEventListener("click", () => {
            if (confirm("Êtes-vous sûr de vouloir supprimer cette tâche?")) {
                deleteTask(task.id);
            }
        });

        return div;
    }

    // Fonction pour enregistrer une tâche (création ou modification)
    async function saveTask() {
        const taskId = document.getElementById("taskId").value;
        const title = document.getElementById("taskTitle").value;
        const description = document.getElementById("taskDescription").value;
        const status = document.getElementById("taskStatus").value;

        // Préparer les données de la tâche
        const taskData = {
            title,
            description,
            status,
            project_id: projectId,
        };

        try {
            let url, method;

            if (taskId) {
                // Mise à jour d'une tâche existante
                url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.TASKS}/${taskId}`;
                method = "PUT";
            } else {
                // Création d'une nouvelle tâche
                url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.TASKS}`;
                method = "POST";
            }

            const response = await authenticatedFetch(url, {
                method,
                body: JSON.stringify(taskData),
            });

            const data = await response.json();

            if (response.ok && data.status === "success") {
                // Fermer le modal et recharger les tâches
                closeTaskModal();
                loadTasks(projectId);
            } else {
                console.error(
                    "Erreur lors de l'enregistrement de la tâche:",
                    data
                );
                alert(
                    `Erreur: ${
                        data.message || "Impossible d'enregistrer la tâche"
                    }`
                );
            }
        } catch (error) {
            console.error(
                "Erreur lors de l'enregistrement de la tâche:",
                error
            );
            alert(
                "Une erreur est survenue lors de l'enregistrement de la tâche"
            );
        }
    }

    // Fonction pour supprimer une tâche
    async function deleteTask(taskId) {
        try {
            const response = await authenticatedFetch(
                `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.TASKS}/${taskId}`,
                {
                    method: "DELETE",
                }
            );

            const data = await response.json();

            if (response.ok && data.status === "success") {
                // Recharger les tâches
                loadTasks(projectId);
            } else {
                console.error(
                    "Erreur lors de la suppression de la tâche:",
                    data
                );
                alert(
                    `Erreur: ${
                        data.message || "Impossible de supprimer la tâche"
                    }`
                );
            }
        } catch (error) {
            console.error("Erreur lors de la suppression de la tâche:", error);
            alert("Une erreur est survenue lors de la suppression de la tâche");
        }
    }
});
