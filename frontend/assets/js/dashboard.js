// dashboard.js - Version améliorée avec mise à jour asynchrone des compteurs de tâches
document.addEventListener("DOMContentLoaded", () => {
    // Vérifier si l'utilisateur est connecté
    if (!isLoggedIn()) {
        window.location.href = "index.html";
        return;
    }

    // Variables globales
    const user = getUserInfo();
    let currentPage = 1;
    let projectsPerPage = 6;
    let projectStatusFilter = "all";
    let projectSearchQuery = "";

    // Initialiser la page
    setupDashboard();

    function setupDashboard() {
        // Références DOM
        const welcomeMessage = document.getElementById("welcomeMessage");
        const createProjectBtn = document.getElementById("createProjectBtn");
        const logoutBtn = document.getElementById("logoutBtn");
        const projectList = document.getElementById("projectList");
        const adminPanel = document.getElementById("adminPanel");
        const teamManageBtn = document.getElementById("teamManageBtn");
        const createProjectModal =
            document.getElementById("createProjectModal");
        const createProjectForm = document.getElementById("createProjectForm");
        const closeModalBtn = createProjectModal.querySelector(".close");
        const cancelBtn = document.getElementById("cancelCreateProject");

        // Ouvrir le modal
        createProjectBtn.addEventListener("click", openCreateProjectModal);

        // Fermer le modal
        closeModalBtn.addEventListener("click", closeCreateProjectModal);
        cancelBtn.addEventListener("click", closeCreateProjectModal);

        // Soumission du formulaire
        createProjectForm.addEventListener("submit", createProject);

        // Fermer le modal en cliquant à l'extérieur
        window.addEventListener("click", (event) => {
            if (event.target === createProjectModal) {
                closeCreateProjectModal();
            }
        });
        // Afficher le message de bienvenue
        welcomeMessage.textContent = `Bienvenue, ${user.name || "Utilisateur"}`;

        // Fonctionnalités spécifiques au rôle
        if (user.role === "admin") {
            if (adminPanel) {
                adminPanel.style.display = "block";
                document
                    .getElementById("adminBtn")
                    .addEventListener("click", () => {
                        window.location.href = "admin.html";
                    });
            }
            if (createProjectBtn) {
                createProjectBtn.style.display = "inline-block";
                createProjectBtn.addEventListener(
                    "click",
                    openCreateProjectModal
                );
            }
            if (teamManageBtn) {
                teamManageBtn.style.display = "inline-block";
                teamManageBtn.addEventListener("click", () => {
                    window.location.href = "team.html";
                });
            }
        } else if (user.role === "project_manager") {
            if (createProjectBtn) {
                createProjectBtn.style.display = "inline-block";
                createProjectBtn.addEventListener(
                    "click",
                    openCreateProjectModal
                );
            }
            if (teamManageBtn) {
                teamManageBtn.style.display = "inline-block";
                teamManageBtn.addEventListener("click", () => {
                    window.location.href = "team.html";
                });
            }
        }

        // Déconnexion
        logoutBtn.addEventListener("click", logout);

        // Charger les projets et les statistiques
        loadProjects();
        loadDashboardStats();
        loadRecentTasks();
    }

    // Chargement des projets
    async function loadProjects() {
        try {
            const projectList = document.getElementById("projectList");
            projectList.innerHTML =
                '<li class="loading">Chargement des projets...</li>';

            let url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PROJECTS}`;
            if (projectStatusFilter !== "all") {
                url += `?status=${projectStatusFilter}`;
            }
            if (projectSearchQuery) {
                const separator = url.includes("?") ? "&" : "?";
                url += `${separator}search=${encodeURIComponent(
                    projectSearchQuery
                )}`;
            }

            const response = await authenticatedFetch(url);
            const data = await response.json();

            if (response.ok && data.status === "success") {
                const formattedData = {
                    projects: data.data,
                    total: data.data.length,
                    page: 1,
                    totalPages: 1,
                };

                displayProjects(formattedData);
                updatePagination(formattedData);
            } else {
                projectList.innerHTML =
                    '<li class="error">Erreur lors du chargement des projets</li>';
                console.error(
                    "Erreur lors du chargement des projets:",
                    data.message
                );
            }
        } catch (error) {
            document.getElementById("projectList").innerHTML =
                '<li class="error">Une erreur est survenue</li>';
            console.error("Erreur lors du chargement des projets:", error);
        }
    }

    // Affichage des projets et mise à jour asynchrone des compteurs de tâches via GET /api/projects/:id/tasks
    function displayProjects(projectsData) {
        const projectList = document.getElementById("projectList");
        if (!projectsData || !projectsData.projects) {
            projectList.innerHTML =
                '<li class="empty-state">Erreur lors du chargement des projets</li>';
            return;
        }

        const { projects } = projectsData;
        projectList.innerHTML = "";
        if (!projects || projects.length === 0) {
            projectList.innerHTML =
                '<li class="empty-state">Aucun projet disponible</li>';
            const pagination = document.getElementById("pagination");
            if (pagination) {
                pagination.style.display = "none";
            }
            return;
        }

        projects.forEach((project) => {
            const li = document.createElement("li");
            li.className = "project-card";

            const statusClass =
                project.status === "active"
                    ? "status-active"
                    : "status-archived";
            const statusText =
                project.status === "active" ? "Actif" : "Archivé";

            const createdDate = new Date(project.createdAt);
            const formattedDate = createdDate.toLocaleDateString("fr-FR", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
            });

            // On initialise les compteurs à "Chargement..."
            li.innerHTML = `
                <div class="project-header">
                    <h3 class="project-title">${project.name}</h3>
                    <span class="project-status ${statusClass}">${statusText}</span>
                </div>
                <div class="project-description">${
                    project.description || "Aucune description"
                }</div>
                <div class="project-meta">
                    <span class="project-team">${
                        project.team_id
                            ? "Équipe #" + project.team_id.substring(0, 8)
                            : "Aucune équipe"
                    }</span>
                    <span class="project-date">${formattedDate}</span>
                </div>
                <div class="project-stats">
                    <div class="project-stat">
                        <span class="stat-label">Tâches</span>
                        <span class="stat-value task-count">Chargement...</span>
                    </div>
                    <div class="project-stat">
                        <span class="stat-label">Terminées</span>
                        <span class="stat-value completed-task-count">Chargement...</span>
                    </div>
                </div>
                <div class="project-actions">
                    <button class="btn btn-primary view-project" data-id="${
                        project.id
                    }">
                        Voir le projet
                    </button>
                    ${
                        project.status === "archived" &&
                        (getUserInfo().role === "admin" ||
                            (getUserInfo().role === "project_manager" &&
                                project.created_by === getUserInfo().id))
                            ? `<button class="btn btn-danger delete-project" data-id="${project.id}">
                        Supprimer
                    </button>`
                            : ""
                    }
                </div>
            `;
            projectList.appendChild(li);
            // Mettre à jour les compteurs de tâches pour ce projet
            updateProjectTaskCounts(project.id, li);
        });

        document.querySelectorAll(".view-project").forEach((btn) => {
            btn.addEventListener("click", () => {
                const projectId = btn.getAttribute("data-id");
                window.location.href = `project.html?id=${projectId}`;
            });
        });

        document.querySelectorAll(".delete-project").forEach((btn) => {
            btn.addEventListener("click", (e) => {
                e.stopPropagation();
                const projectId = btn.getAttribute("data-id");
                if (confirm("Êtes-vous sûr de vouloir supprimer ce projet ?")) {
                    deleteProject(projectId);
                }
            });
        });
    }

    // Fonction qui met à jour les compteurs de tâches en appelant GET /api/projects/:id/tasks
    async function updateProjectTaskCounts(projectId, cardElement) {
        try {
            const response = await authenticatedFetch(
                `${API_CONFIG.BASE_URL}/projects/${projectId}/tasks`
            );
            const data = await response.json();
            if (response.ok && data.status === "success") {
                const tasks = data.data.tasks || [];
                // Si le backend fournit un compteur total, on peut l'utiliser
                const tasksCount =
                    data.data.total !== undefined
                        ? data.data.total
                        : tasks.length;
                const completedTasksCount = tasks.filter(
                    (t) => t.status === "done"
                ).length;
                const taskCountElem = cardElement.querySelector(".task-count");
                const completedTaskCountElem = cardElement.querySelector(
                    ".completed-task-count"
                );
                if (taskCountElem) taskCountElem.textContent = tasksCount;
                if (completedTaskCountElem)
                    completedTaskCountElem.textContent = completedTasksCount;
            } else {
                console.error(
                    "Erreur lors du chargement des tâches pour le projet " +
                        projectId +
                        ":",
                    data.message
                );
                // En cas d'erreur, on peut afficher 0 ou "N/A"
                const taskCountElem = cardElement.querySelector(".task-count");
                const completedTaskCountElem = cardElement.querySelector(
                    ".completed-task-count"
                );
                if (taskCountElem) taskCountElem.textContent = "N/A";
                if (completedTaskCountElem)
                    completedTaskCountElem.textContent = "N/A";
            }
        } catch (error) {
            console.error(
                "Erreur lors de la récupération des tâches pour le projet " +
                    projectId,
                error
            );
            const taskCountElem = cardElement.querySelector(".task-count");
            const completedTaskCountElem = cardElement.querySelector(
                ".completed-task-count"
            );
            if (taskCountElem) taskCountElem.textContent = "N/A";
            if (completedTaskCountElem)
                completedTaskCountElem.textContent = "N/A";
        }
    }

    // Mise à jour de la pagination
    function updatePagination(data) {
        const paginationContainer = document.getElementById("pagination");
        if (!paginationContainer) return;
        if (!data || !data.projects || typeof data.total === "undefined") {
            paginationContainer.style.display = "none";
            return;
        }
        const { page = 1, totalPages = 1, total = 0 } = data;
        if (totalPages <= 1) {
            paginationContainer.style.display = "none";
            return;
        }
        paginationContainer.style.display = "flex";
        const start = Math.min((page - 1) * projectsPerPage + 1, total);
        const end = Math.min(page * projectsPerPage, total);
        paginationContainer.innerHTML = `
        <div class="pagination-info">
            Affichage ${start} - ${end} sur ${total}
        </div>
        <div class="pagination-controls">
            <button class="pagination-btn" data-page="1" ${
                page === 1 ? "disabled" : ""
            }>&laquo;</button>
            <button class="pagination-btn" data-page="${page - 1}" ${
            page === 1 ? "disabled" : ""
        }>&lt;</button>
            <span class="pagination-current">Page ${page} sur ${totalPages}</span>
            <button class="pagination-btn" data-page="${page + 1}" ${
            page === totalPages ? "disabled" : ""
        }>&gt;</button>
            <button class="pagination-btn" data-page="${totalPages}" ${
            page === totalPages ? "disabled" : ""
        }>&raquo;</button>
        </div>
    `;
        document.querySelectorAll(".pagination-btn").forEach((btn) => {
            if (!btn.disabled) {
                btn.addEventListener("click", () => {
                    currentPage = parseInt(btn.getAttribute("data-page"));
                    loadProjects();
                });
            }
        });
    }

    // Chargement des statistiques du tableau de bord
    async function loadDashboardStats() {
        try {
            const statsContainer = document.getElementById("statsContainer");
            if (!statsContainer) return;
            statsContainer.innerHTML =
                '<div class="loading">Chargement des statistiques...</div>';
            let url;
            let statsData = {};
            if (user.role === "admin") {
                url = `${API_CONFIG.BASE_URL}/admin/stats`;
                const response = await authenticatedFetch(url);
                const data = await response.json();
                if (response.ok && data.status === "success") {
                    statsData = data.data;
                }
            } else {
                const projectsResponse = await authenticatedFetch(
                    `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PROJECTS}`
                );
                const projectsData = await projectsResponse.json();
                const tasksResponse = await authenticatedFetch(
                    `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.TASKS}/my`
                );
                const tasksData = await tasksResponse.json();
                if (projectsResponse.ok && tasksResponse.ok) {
                    const projects = projectsData.data || [];
                    const tasks = tasksData.data.tasks || [];
                    const activeProjects = projects.filter(
                        (p) => p.status === "active"
                    ).length;
                    const archivedProjects = projects.filter(
                        (p) => p.status === "archived"
                    ).length;
                    const todoTasks = tasks.filter(
                        (t) => t.status === "todo"
                    ).length;
                    const inProgressTasks = tasks.filter(
                        (t) => t.status === "in_progress"
                    ).length;
                    const doneTasks = tasks.filter(
                        (t) => t.status === "done"
                    ).length;
                    statsData = {
                        projects: {
                            total: projects.length,
                            active: activeProjects,
                            archived: archivedProjects,
                        },
                        tasks: {
                            total: tasks.length,
                            todo: todoTasks,
                            in_progress: inProgressTasks,
                            done: doneTasks,
                        },
                    };
                }
            }
            if (Object.keys(statsData).length > 0) {
                displayDashboardStats(statsData);
            } else {
                statsContainer.innerHTML =
                    '<div class="error">Erreur lors du chargement des statistiques</div>';
            }
        } catch (error) {
            console.error("Erreur lors du chargement des statistiques:", error);
            const statsContainer = document.getElementById("statsContainer");
            if (statsContainer) {
                statsContainer.innerHTML =
                    '<div class="error">Une erreur est survenue lors du chargement des statistiques</div>';
            }
        }
    }

    // Affichage des statistiques du tableau de bord
    function displayDashboardStats(stats) {
        const statsContainer = document.getElementById("statsContainer");
        if (!statsContainer) return;
        if (user.role === "admin") {
            statsContainer.innerHTML = `
                <div class="stats-row">
                    <div class="stat-card">
                        <div class="stat-icon projects-icon">
                            <i class="fas fa-project-diagram"></i>
                        </div>
                        <div class="stat-info">
                            <h3>Projets actifs</h3>
                            <div class="stat-number">${
                                stats.projects.active || 0
                            }</div>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon tasks-icon">
                            <i class="fas fa-tasks"></i>
                        </div>
                        <div class="stat-info">
                            <h3>Tâches totales</h3>
                            <div class="stat-number">${
                                stats.tasks.total || 0
                            }</div>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon done-icon">
                            <i class="fas fa-check-circle"></i>
                        </div>
                        <div class="stat-info">
                            <h3>Tâches terminées</h3>
                            <div class="stat-number">${
                                stats.tasks.done || 0
                            }</div>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon team-icon">
                            <i class="fas fa-users"></i>
                        </div>
                        <div class="stat-info">
                            <h3>Utilisateurs</h3>
                            <div class="stat-number">${
                                stats.users ? stats.users.total : 0
                            }</div>
                        </div>
                    </div>
                </div>
                <div class="chart-container">
                    <h3>Répartition des tâches par statut</h3>
                    ${createTaskStatusChart(stats.tasks)}
                </div>
            `;
        } else {
            statsContainer.innerHTML = `
                <div class="stats-row">
                    <div class="stat-card">
                        <div class="stat-icon projects-icon">
                            <i class="fas fa-project-diagram"></i>
                        </div>
                        <div class="stat-info">
                            <h3>Mes projets</h3>
                            <div class="stat-number">${
                                stats.projects.total || 0
                            }</div>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon tasks-icon">
                            <i class="fas fa-tasks"></i>
                        </div>
                        <div class="stat-info">
                            <h3>Mes tâches</h3>
                            <div class="stat-number">${
                                stats.tasks.total || 0
                            }</div>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon done-icon">
                            <i class="fas fa-check-circle"></i>
                        </div>
                        <div class="stat-info">
                            <h3>Tâches terminées</h3>
                            <div class="stat-number">${
                                stats.tasks.done || 0
                            }</div>
                        </div>
                    </div>
                </div>
                <div class="chart-container">
                    <h3>Mes tâches par statut</h3>
                    ${createTaskStatusChart(stats.tasks)}
                </div>
            `;
        }
    }

    // Création d'un graphique pour afficher le statut des tâches
    function createTaskStatusChart(taskStats) {
        const total = taskStats.total || 0;
        if (total === 0) {
            return '<div class="empty-state">Aucune tâche disponible</div>';
        }
        const todoCount = taskStats.todo || 0;
        const inProgressCount = taskStats.in_progress || 0;
        const doneCount = taskStats.done || 0;
        const todoPercent = Math.round((todoCount / total) * 100);
        const inProgressPercent = Math.round((inProgressCount / total) * 100);
        const donePercent = Math.round((doneCount / total) * 100);
        return `
            <div class="tasks-chart">
                <div class="chart-column">
                    <div class="chart-value-top">${todoCount}</div>
                    <div class="chart-bar-vertical" style="height: ${
                        todoCount > 0 ? Math.max(20, todoPercent * 1.5) : 0
                    }px; background-color: #dc3545;"></div>
                    <div class="chart-label-bottom">À faire</div>
                </div>
                <div class="chart-column">
                    <div class="chart-value-top">${inProgressCount}</div>
                    <div class="chart-bar-vertical" style="height: ${
                        inProgressCount > 0
                            ? Math.max(20, inProgressPercent * 1.5)
                            : 0
                    }px; background-color: #ffc107;"></div>
                    <div class="chart-label-bottom">En cours</div>
                </div>
                <div class="chart-column">
                    <div class="chart-value-top">${doneCount}</div>
                    <div class="chart-bar-vertical" style="height: ${
                        doneCount > 0 ? Math.max(20, donePercent * 1.5) : 0
                    }px; background-color: #28a745;"></div>
                    <div class="chart-label-bottom">Terminé</div>
                </div>
            </div>
        `;
    }

    // Suppression d'un projet
    async function deleteProject(projectId) {
        try {
            const response = await authenticatedFetch(
                `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PROJECTS}/${projectId}`,
                { method: "DELETE" }
            );
            const data = await response.json();
            if (response.ok && data.status === "success") {
                loadProjects();
            } else {
                alert(
                    `Erreur: ${
                        data.message || "Impossible de supprimer le projet"
                    }`
                );
                console.error("Erreur lors de la suppression du projet:", data);
            }
        } catch (error) {
            alert("Une erreur est survenue lors de la suppression du projet");
            console.error("Erreur lors de la suppression du projet:", error);
        }
    }
});

// Fonction pour ouvrir le modal de création de projet
function openCreateProjectModal() {
    document.getElementById("createProjectForm").reset();
    loadTeamsForSelect();
    document.getElementById("createProjectModal").style.display = "block";
}

// Fonction pour fermer le modal de création de projet
function closeCreateProjectModal() {
    document.getElementById("createProjectModal").style.display = "none";
}

// Charger les équipes pour le select
async function loadTeamsForSelect() {
    try {
        const projectTeam = document.getElementById("projectTeam");
        projectTeam.innerHTML = '<option value="">Chargement...</option>';
        const currentUser = getUserInfo();
        let url;
        if (currentUser && currentUser.role === "admin") {
            url = `${API_CONFIG.BASE_URL}/teams`;
        } else {
            url = `${API_CONFIG.BASE_URL}/teams/my`;
        }
        const response = await authenticatedFetch(url);
        const data = await response.json();
        if (response.ok && data.status === "success") {
            projectTeam.innerHTML =
                '<option value="">Sélectionnez une équipe</option>';
            if (
                currentUser &&
                currentUser.role === "admin" &&
                data.data.teams
            ) {
                data.data.teams.forEach((team) => {
                    const option = document.createElement("option");
                    option.value = team.id;
                    option.textContent = team.name;
                    projectTeam.appendChild(option);
                });
            } else if (data.data) {
                const team = data.data;
                const option = document.createElement("option");
                option.value = team.id;
                option.textContent = team.name;
                projectTeam.appendChild(option);
                projectTeam.value = team.id;
            }
        } else {
            projectTeam.innerHTML =
                '<option value="">Erreur lors du chargement</option>';
            console.error(
                "Erreur lors du chargement des équipes:",
                data.message
            );
        }
    } catch (error) {
        document.getElementById("projectTeam").innerHTML =
            '<option value="">Erreur lors du chargement</option>';
        console.error("Erreur lors du chargement des équipes:", error);
    }
}

// Créer un nouveau projet
async function createProject(event) {
    if (event) event.preventDefault();

    const projectName = document.getElementById("projectName").value.trim();
    const projectDescription = document
        .getElementById("projectDescription")
        .value.trim();
    const projectTeam = document.getElementById("projectTeam").value;

    if (!projectName) {
        alert("Veuillez entrer un nom de projet");
        return;
    }
    if (!projectTeam) {
        alert("Veuillez sélectionner une équipe");
        return;
    }

    try {
        document.getElementById("saveProjectBtn").textContent =
            "Création en cours...";
        document.getElementById("saveProjectBtn").disabled = true;

        const projectData = {
            name: projectName,
            description: projectDescription,
            team_id: projectTeam,
        };

        const response = await authenticatedFetch(
            `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PROJECTS}`,
            {
                method: "POST",
                body: JSON.stringify(projectData),
            }
        );
        const data = await response.json();

        if (response.ok && data.status === "success") {
            closeCreateProjectModal();
            showSuccessMessage("Projet créé avec succès!");
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        } else {
            showErrorMessage(
                data.message || "Erreur lors de la création du projet"
            );
            console.error("Erreur lors de la création du projet:", data);
        }
    } catch (error) {
        showErrorMessage(
            "Une erreur est survenue lors de la création du projet"
        );
        console.error("Erreur lors de la création du projet:", error);
    } finally {
        document.getElementById("saveProjectBtn").textContent = "Créer";
        document.getElementById("saveProjectBtn").disabled = false;
    }
}

// Fonctions pour afficher des messages
function showSuccessMessage(message) {
    const container = document.querySelector("main") || document.body;
    const messageDiv = document.createElement("div");
    messageDiv.className = "success-message";
    messageDiv.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <span>${message}</span>
        <button class="close-message"><i class="fas fa-times"></i></button>
    `;
    container.insertBefore(messageDiv, container.firstChild);
    messageDiv.querySelector(".close-message").addEventListener("click", () => {
        messageDiv.remove();
    });
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.remove();
        }
    }, 5000);
}

function showErrorMessage(message) {
    const container = document.querySelector("main") || document.body;
    const messageDiv = document.createElement("div");
    messageDiv.className = "error-message";
    messageDiv.innerHTML = `
        <i class="fas fa-exclamation-circle"></i>
        <span>${message}</span>
        <button class="close-message"><i class="fas fa-times"></i></button>
    `;
    container.insertBefore(messageDiv, container.firstChild);
    messageDiv.querySelector(".close-message").addEventListener("click", () => {
        messageDiv.remove();
    });
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.remove();
        }
    }, 5000);
}

async function loadRecentTasks() {
    const recentTasksElement = document.getElementById("recentTasks");
    if (!recentTasksElement) return;

    try {
        recentTasksElement.innerHTML =
            '<div class="loading">Chargement des tâches...</div>';
        const response = await authenticatedFetch(
            `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.TASKS}/my`
        );
        const data = await response.json();
        if (response.ok && data.status === "success") {
            const tasks = data.data.tasks || [];
            if (tasks.length === 0) {
                recentTasksElement.innerHTML =
                    '<div class="empty-state">Aucune tâche disponible</div>';
                return;
            }
            const sortedTasks = tasks
                .sort((a, b) => {
                    const dateA = new Date(a.updatedAt || a.createdAt);
                    const dateB = new Date(b.updatedAt || b.createdAt);
                    return dateB - dateA;
                })
                .slice(0, 5);
            recentTasksElement.innerHTML = "";
            sortedTasks.forEach((task) => {
                let statusClass, statusText;
                switch (task.status) {
                    case "todo":
                        statusClass = "status-todo";
                        statusText = "À faire";
                        break;
                    case "in_progress":
                        statusClass = "status-in-progress";
                        statusText = "En cours";
                        break;
                    case "done":
                        statusClass = "status-done";
                        statusText = "Terminé";
                        break;
                    default:
                        statusClass = "";
                        statusText = task.status;
                }
                const taskElement = document.createElement("div");
                taskElement.className = "task-item";
                taskElement.innerHTML = `
                    <div class="task-info">
                        <div class="task-title">${task.title}</div>
                        <div class="task-details">
                            <span class="task-project">${
                                task.project
                                    ? task.project.name
                                    : "Projet inconnu"
                            }</span>
                            <span class="task-status ${statusClass}">${statusText}</span>
                        </div>
                    </div>
                    <div class="task-actions">
                        <button class="btn btn-sm btn-primary view-task-btn" data-id="${
                            task.id
                        }" data-project="${
                    task.project ? task.project.id : ""
                }">Voir</button>
                    </div>
                `;
                taskElement
                    .querySelector(".view-task-btn")
                    .addEventListener("click", (e) => {
                        const taskId = e.target.getAttribute("data-id");
                        const projectId = e.target.getAttribute("data-project");
                        if (projectId) {
                            window.location.href = `project.html?id=${projectId}&task=${taskId}`;
                        }
                    });
                recentTasksElement.appendChild(taskElement);
            });
        } else {
            recentTasksElement.innerHTML =
                '<div class="error">Erreur lors du chargement des tâches</div>';
            console.error(
                "Erreur lors du chargement des tâches:",
                data.message
            );
        }
    } catch (error) {
        recentTasksElement.innerHTML =
            '<div class="error">Une erreur est survenue</div>';
        console.error("Erreur lors du chargement des tâches:", error);
    }
}
