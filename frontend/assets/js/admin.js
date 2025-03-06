document.addEventListener("DOMContentLoaded", () => {
    // Vérifier si l'utilisateur est connecté et est admin
    if (!isLoggedIn()) {
        window.location.href = "index.html";
        return;
    }

    const user = getUserInfo();
    if (user.role !== "admin") {
        alert("Accès réservé aux administrateurs");
        window.location.href = "dashboard.html";
        return;
    }

    // Afficher le nom de l'administrateur
    document.getElementById("adminName").textContent =
        user.name || "Administrateur";

    // Références aux éléments de navigation
    const navItems = document.querySelectorAll(".sidebar-nav-item");
    const sections = document.querySelectorAll(".admin-section");
    const sectionTitle = document.getElementById("sectionTitle");
    const backToAppBtn = document.getElementById("backToAppBtn");
    const logoutBtn = document.getElementById("logoutBtn");

    // Gestion des événements de navigation
    navItems.forEach((item) => {
        item.addEventListener("click", () => {
            const sectionId = item.getAttribute("data-section");
            switchSection(sectionId);
        });
    });

    backToAppBtn.addEventListener("click", () => {
        window.location.href = "dashboard.html";
    });

    logoutBtn.addEventListener("click", logout);

    // Chargement initial des données
    loadDashboardStats();
    setupUserManagement();
    setupTeamManagement();
    setupProjectManagement();
    setupLogsManagement();

    // Fonction pour changer de section
    function switchSection(sectionId) {
        // Mettre à jour les classes actives
        navItems.forEach((item) => {
            item.classList.remove("active");
            if (item.getAttribute("data-section") === sectionId) {
                item.classList.add("active");
            }
        });

        sections.forEach((section) => {
            section.classList.remove("active");
            if (section.id === `${sectionId}-section`) {
                section.classList.add("active");
            }
        });

        // Mettre à jour le titre
        switch (sectionId) {
            case "dashboard":
                sectionTitle.textContent = "Tableau de bord";
                loadDashboardStats(); // Recharger les statistiques
                break;
            case "users":
                sectionTitle.textContent = "Gestion des utilisateurs";
                loadUsers(); // Recharger les utilisateurs
                break;
            case "teams":
                sectionTitle.textContent = "Gestion des équipes";
                loadTeams(); // Recharger les équipes
                break;
            case "projects":
                sectionTitle.textContent = "Gestion des projets";
                loadProjects(); // Recharger les projets
                break;
            case "logs":
                sectionTitle.textContent = "Logs d'audit";
                loadLogs(); // Recharger les logs
                break;
        }
    }

    // ===== TABLEAU DE BORD =====
    async function loadDashboardStats() {
        try {
            const response = await authenticatedFetch(
                `${API_CONFIG.BASE_URL}/admin/stats`
            );
            const data = await response.json();

            if (response.ok && data.status === "success") {
                displayDashboardStats(data.data);
                displayRecentActivity(data.data.recentActivity);
            } else {
                console.error(
                    "Erreur lors du chargement des statistiques:",
                    data.message
                );
                showError(
                    "Impossible de charger les statistiques du tableau de bord"
                );
            }
        } catch (error) {
            console.error("Erreur lors du chargement des statistiques:", error);
            showError(
                "Une erreur est survenue lors du chargement des statistiques"
            );
        }
    }

    function displayDashboardStats(stats) {
        // Mettre à jour les nombres
        document.getElementById("usersCount").textContent =
            stats.users.total || 0;
        document.getElementById("teamsCount").textContent =
            stats.teams.total || 0;
        document.getElementById("projectsCount").textContent =
            stats.projects.total || 0;
        document.getElementById("tasksCount").textContent =
            stats.tasks.total || 0;

        // Simuler des graphiques simples
        createProjectStatusChart(stats.projects);
        createTaskStatusChart(stats.tasks);
    }

    function createProjectStatusChart(projectStats) {
        const chartContainer = document.getElementById("projectStatusChart");

        // Version simple: barres de texte pour représenter les données
        const activePercent =
            projectStats.total > 0
                ? ((projectStats.active / projectStats.total) * 100).toFixed(1)
                : 0;
        const archivedPercent =
            projectStats.total > 0
                ? ((projectStats.archived / projectStats.total) * 100).toFixed(
                      1
                  )
                : 0;

        chartContainer.innerHTML = `
            <div class="text-chart">
                <div class="chart-row">
                    <div class="chart-label">Actifs (${
                        projectStats.active || 0
                    })</div>
                    <div class="chart-bar">
                        <div class="chart-value" style="width: ${activePercent}%; background-color: #28a745;"></div>
                    </div>
                    <div class="chart-percent">${activePercent}%</div>
                </div>
                <div class="chart-row">
                    <div class="chart-label">Archivés (${
                        projectStats.archived || 0
                    })</div>
                    <div class="chart-bar">
                        <div class="chart-value" style="width: ${archivedPercent}%; background-color: #dc3545;"></div>
                    </div>
                    <div class="chart-percent">${archivedPercent}%</div>
                </div>
            </div>
        `;
    }

    function createTaskStatusChart(taskStats) {
        const chartContainer = document.getElementById("taskStatusChart");

        // Version simple: barres de texte pour représenter les données
        const todoPercent =
            taskStats.total > 0
                ? ((taskStats.todo / taskStats.total) * 100).toFixed(1)
                : 0;
        const inProgressPercent =
            taskStats.total > 0
                ? ((taskStats.in_progress / taskStats.total) * 100).toFixed(1)
                : 0;
        const donePercent =
            taskStats.total > 0
                ? ((taskStats.done / taskStats.total) * 100).toFixed(1)
                : 0;

        chartContainer.innerHTML = `
            <div class="text-chart">
                <div class="chart-row">
                    <div class="chart-label">À faire (${
                        taskStats.todo || 0
                    })</div>
                    <div class="chart-bar">
                        <div class="chart-value" style="width: ${todoPercent}%; background-color: #dc3545;"></div>
                    </div>
                    <div class="chart-percent">${todoPercent}%</div>
                </div>
                <div class="chart-row">
                    <div class="chart-label">En cours (${
                        taskStats.in_progress || 0
                    })</div>
                    <div class="chart-bar">
                        <div class="chart-value" style="width: ${inProgressPercent}%; background-color: #ffc107;"></div>
                    </div>
                    <div class="chart-percent">${inProgressPercent}%</div>
                </div>
                <div class="chart-row">
                    <div class="chart-label">Terminé (${
                        taskStats.done || 0
                    })</div>
                    <div class="chart-bar">
                        <div class="chart-value" style="width: ${donePercent}%; background-color: #28a745;"></div>
                    </div>
                    <div class="chart-percent">${donePercent}%</div>
                </div>
            </div>
        `;
    }

    function displayRecentActivity(recentActivity) {
        const activityList = document.getElementById("recentActivityList");
        activityList.innerHTML = "";

        const activities = [
            ...recentActivity.recentUsers.map((item) => ({
                ...item,
                type: "user",
            })),
            ...recentActivity.recentProjects.map((item) => ({
                ...item,
                type: "project",
            })),
            ...recentActivity.recentTeams.map((item) => ({
                ...item,
                type: "team",
            })),
        ]
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 10);

        if (activities.length === 0) {
            activityList.innerHTML =
                '<div class="empty-state">Aucune activité récente</div>';
            return;
        }

        activities.forEach((activity) => {
            const div = document.createElement("div");
            div.className = "activity-item";

            const date = new Date(activity.createdAt);
            const formattedDate = date.toLocaleDateString("fr-FR", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            });

            let iconClass = "";
            let actionText = "";
            let subjectText = "";

            switch (activity.type) {
                case "user":
                    iconClass = "fas fa-user";
                    actionText = "Nouvel utilisateur";
                    subjectText = activity.name;
                    break;
                case "project":
                    iconClass = "fas fa-project-diagram";
                    actionText = "Nouveau projet";
                    subjectText = activity.name;
                    break;
                case "team":
                    iconClass = "fas fa-user-friends";
                    actionText = "Nouvelle équipe";
                    subjectText = activity.name;
                    break;
            }

            div.innerHTML = `
                <div class="activity-info">
                    <div class="activity-icon">
                        <i class="${iconClass}"></i>
                    </div>
                    <div class="activity-details">
                        <div class="activity-action">${actionText}</div>
                        <div class="activity-subject">${subjectText}</div>
                    </div>
                </div>
                <div class="activity-time">${formattedDate}</div>
            `;

            activityList.appendChild(div);
        });
    }

    // ===== GESTION DES UTILISATEURS =====
    let usersCurrentPage = 1;
    let usersFilter = {
        search: "",
        role: "",
        team: "",
    };

    function setupUserManagement() {
        // Références aux éléments DOM
        const userSearchInput = document.getElementById("userSearchInput");
        const userSearchBtn = document.getElementById("userSearchBtn");
        const userRoleFilter = document.getElementById("userRoleFilter");
        const userTeamFilter = document.getElementById("userTeamFilter");
        const createUserBtn = document.getElementById("createUserBtn");

        // Modal utilisateur
        const userModal = document.getElementById("userModal");
        const userForm = document.getElementById("userForm");
        const cancelUserBtn = document.getElementById("cancelUserBtn");
        const closeUserModal = userModal.querySelector(".close");

        // Événements pour les filtres
        userSearchBtn.addEventListener("click", () => {
            usersFilter.search = userSearchInput.value.trim();
            usersCurrentPage = 1;
            loadUsers();
        });

        userSearchInput.addEventListener("keypress", (e) => {
            if (e.key === "Enter") {
                usersFilter.search = userSearchInput.value.trim();
                usersCurrentPage = 1;
                loadUsers();
            }
        });

        userRoleFilter.addEventListener("change", () => {
            usersFilter.role = userRoleFilter.value;
            usersCurrentPage = 1;
            loadUsers();
        });

        userTeamFilter.addEventListener("change", () => {
            usersFilter.team = userTeamFilter.value;
            usersCurrentPage = 1;
            loadUsers();
        });

        // Événements pour le modal
        createUserBtn.addEventListener("click", () => openUserModal());
        cancelUserBtn.addEventListener("click", () => closeUserModal());
        closeUserModal.addEventListener("click", () => closeUserModal());

        userForm.addEventListener("submit", (e) => {
            e.preventDefault();
            saveUser();
        });

        // Chargement initial
        loadUsers();
        loadTeamsForSelect("userTeamFilter");
    }

    async function loadUsers() {
        try {
            const tbody = document.querySelector("#usersTable tbody");
            tbody.innerHTML =
                '<tr><td colspan="6" class="loading-cell">Chargement des utilisateurs...</td></tr>';

            // Construire l'URL avec les filtres
            let url = `${API_CONFIG.BASE_URL}/admin/users?page=${usersCurrentPage}&limit=10`;

            if (usersFilter.search) {
                url += `&search=${encodeURIComponent(usersFilter.search)}`;
            }

            if (usersFilter.role) {
                url += `&role=${encodeURIComponent(usersFilter.role)}`;
            }

            if (usersFilter.team) {
                url += `&team=${encodeURIComponent(usersFilter.team)}`;
            }

            const response = await authenticatedFetch(url);
            const data = await response.json();

            if (response.ok && data.status === "success") {
                displayUsers(data.data);
            } else {
                console.error(
                    "Erreur lors du chargement des utilisateurs:",
                    data.message
                );
                tbody.innerHTML =
                    '<tr><td colspan="6" class="error">Erreur lors du chargement des utilisateurs</td></tr>';
            }
        } catch (error) {
            console.error("Erreur lors du chargement des utilisateurs:", error);
            document.querySelector("#usersTable tbody").innerHTML =
                '<tr><td colspan="6" class="error">Une erreur est survenue lors du chargement des utilisateurs</td></tr>';
        }
    }

    function displayUsers(usersData) {
        const { users, page, totalPages, total } = usersData;
        const tbody = document.querySelector("#usersTable tbody");

        tbody.innerHTML = "";

        if (!users || users.length === 0) {
            tbody.innerHTML =
                '<tr><td colspan="6" class="empty-state">Aucun utilisateur trouvé</td></tr>';
            return;
        }

        users.forEach((user) => {
            const tr = document.createElement("tr");

            // Traduire le rôle
            let roleText;
            switch (user.role) {
                case "admin":
                    roleText = "Administrateur";
                    break;
                case "project_manager":
                    roleText = "Chef de projet";
                    break;
                case "contributor":
                    roleText = "Contributeur";
                    break;
                default:
                    roleText = user.role;
            }

            // Formater la date de dernière connexion
            let lastLoginText = "Jamais";
            if (user.last_login) {
                const lastLoginDate = new Date(user.last_login);
                lastLoginText = lastLoginDate.toLocaleDateString("fr-FR", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                });
            }

            tr.innerHTML = `
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td>${roleText}</td>
                <td>${user.team ? user.team.name : "Aucune"}</td>
                <td>${lastLoginText}</td>
                <td class="table-actions">
                    <button class="btn btn-sm btn-info edit-user" data-id="${
                        user.id
                    }" title="Modifier">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger delete-user" data-id="${
                        user.id
                    }" ${
                user.id === getUserInfo().id ? "disabled" : ""
            } title="Supprimer">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;

            tbody.appendChild(tr);
        });

        // Ajouter les événements aux boutons
        document.querySelectorAll(".edit-user").forEach((btn) => {
            btn.addEventListener("click", () => {
                const userId = btn.getAttribute("data-id");
                openUserModal(userId);
            });
        });

        document.querySelectorAll(".delete-user").forEach((btn) => {
            if (!btn.disabled) {
                btn.addEventListener("click", () => {
                    const userId = btn.getAttribute("data-id");
                    if (
                        confirm(
                            "Êtes-vous sûr de vouloir supprimer cet utilisateur ?"
                        )
                    ) {
                        deleteUser(userId);
                    }
                });
            }
        });

        // Mettre à jour la pagination
        updatePagination(
            "usersPagination",
            page,
            totalPages,
            total,
            (newPage) => {
                usersCurrentPage = newPage;
                loadUsers();
            }
        );
    }

    async function openUserModal(userId = null) {
        const userModal = document.getElementById("userModal");
        const userModalTitle = document.getElementById("userModalTitle");
        const userForm = document.getElementById("userForm");
        const userIdInput = document.getElementById("userId");
        const userNameInput = document.getElementById("userName");
        const userEmailInput = document.getElementById("userEmail");
        const userPasswordInput = document.getElementById("userPassword");
        const userRoleInput = document.getElementById("userRole");
        const userTeamInput = document.getElementById("userTeam");

        // Réinitialiser le formulaire
        userForm.reset();
        userIdInput.value = "";

        // Charger les équipes pour le select
        await loadTeamsForSelect("userTeam");

        if (userId) {
            // Mode édition
            userModalTitle.textContent = "Modifier l'utilisateur";

            try {
                const response = await authenticatedFetch(
                    `${API_CONFIG.BASE_URL}/admin/users/${userId}`
                );
                const data = await response.json();

                if (response.ok && data.status === "success") {
                    const user = data.data;

                    userIdInput.value = user.id;
                    userNameInput.value = user.name || "";
                    userEmailInput.value = user.email || "";
                    userRoleInput.value = user.role || "contributor";

                    if (user.team) {
                        userTeamInput.value = user.team.id;
                    } else {
                        userTeamInput.value = "";
                    }
                } else {
                    console.error(
                        "Erreur lors du chargement de l'utilisateur:",
                        data.message
                    );
                    alert(
                        "Erreur lors du chargement des détails de l'utilisateur"
                    );
                    return;
                }
            } catch (error) {
                console.error(
                    "Erreur lors du chargement de l'utilisateur:",
                    error
                );
                alert(
                    "Une erreur est survenue lors du chargement de l'utilisateur"
                );
                return;
            }
        } else {
            // Mode création
            userModalTitle.textContent = "Nouvel utilisateur";
        }

        // Afficher le modal
        userModal.style.display = "block";
    }

    function closeUserModal() {
        document.getElementById("userModal").style.display = "none";
    }

    async function saveUser() {
        const userId = document.getElementById("userId").value;
        const name = document.getElementById("userName").value;
        const email = document.getElementById("userEmail").value;
        const password = document.getElementById("userPassword").value;
        const role = document.getElementById("userRole").value;
        const teamId = document.getElementById("userTeam").value;

        const userData = {
            name,
            email,
            role,
        };

        if (password) {
            userData.password = password;
        }

        if (teamId) {
            userData.team_id = teamId;
        }

        try {
            let response, url, method;

            if (userId) {
                // Mode édition
                url = `${API_CONFIG.BASE_URL}/admin/users/${userId}`;
                method = "PUT";
            } else {
                // Mode création
                url = `${API_CONFIG.BASE_URL}/admin/users`;
                method = "POST";
            }

            response = await authenticatedFetch(url, {
                method,
                body: JSON.stringify(userData),
            });

            const data = await response.json();

            if (response.ok && data.status === "success") {
                closeUserModal();
                loadUsers();
            } else {
                console.error(
                    "Erreur lors de l'enregistrement de l'utilisateur:",
                    data.message
                );
                alert(
                    `Erreur: ${
                        data.message || "Impossible d'enregistrer l'utilisateur"
                    }`
                );
            }
        } catch (error) {
            console.error(
                "Erreur lors de l'enregistrement de l'utilisateur:",
                error
            );
            alert(
                "Une erreur est survenue lors de l'enregistrement de l'utilisateur"
            );
        }
    }

    async function deleteUser(userId) {
        try {
            const response = await authenticatedFetch(
                `${API_CONFIG.BASE_URL}/admin/users/${userId}`,
                {
                    method: "DELETE",
                }
            );

            const data = await response.json();

            if (response.ok && data.status === "success") {
                loadUsers();
            } else {
                console.error(
                    "Erreur lors de la suppression de l'utilisateur:",
                    data.message
                );
                alert(
                    `Erreur: ${
                        data.message || "Impossible de supprimer l'utilisateur"
                    }`
                );
            }
        } catch (error) {
            console.error(
                "Erreur lors de la suppression de l'utilisateur:",
                error
            );
            alert(
                "Une erreur est survenue lors de la suppression de l'utilisateur"
            );
        }
    }

    // ===== GESTION DES ÉQUIPES =====
    let teamsCurrentPage = 1;
    let teamsFilter = {
        search: "",
    };

    function setupTeamManagement() {
        // Références aux éléments DOM
        const teamSearchInput = document.getElementById("teamSearchInput");
        const teamSearchBtn = document.getElementById("teamSearchBtn");
        const createTeamBtn = document.getElementById("createTeamBtn");

        // Modal équipe
        const teamModal = document.getElementById("teamModal");
        const teamForm = document.getElementById("teamForm");
        const cancelTeamBtn = document.getElementById("cancelTeamBtn");
        const closeTeamModal = teamModal.querySelector(".close");

        // Événements pour les filtres
        teamSearchBtn.addEventListener("click", () => {
            teamsFilter.search = teamSearchInput.value.trim();
            teamsCurrentPage = 1;
            loadTeams();
        });

        teamSearchInput.addEventListener("keypress", (e) => {
            if (e.key === "Enter") {
                teamsFilter.search = teamSearchInput.value.trim();
                teamsCurrentPage = 1;
                loadTeams();
            }
        });

        // Événements pour le modal
        createTeamBtn.addEventListener("click", () => openTeamModal());
        cancelTeamBtn.addEventListener("click", () => closeTeamModal());
        closeTeamModal.addEventListener("click", () => closeTeamModal());

        teamForm.addEventListener("submit", (e) => {
            e.preventDefault();
            saveTeam();
        });

        // Chargement initial
        loadTeams();
    }

    async function loadTeams() {
        try {
            const tbody = document.querySelector("#teamsTable tbody");
            tbody.innerHTML =
                '<tr><td colspan="6" class="loading-cell">Chargement des équipes...</td></tr>';

            // Construire l'URL avec les filtres
            let url = `${API_CONFIG.BASE_URL}/admin/teams?page=${teamsCurrentPage}&limit=10`;

            if (teamsFilter.search) {
                url += `&search=${encodeURIComponent(teamsFilter.search)}`;
            }

            const response = await authenticatedFetch(url);
            const data = await response.json();

            if (response.ok && data.status === "success") {
                displayTeams(data.data);
            } else {
                console.error(
                    "Erreur lors du chargement des équipes:",
                    data.message
                );
                tbody.innerHTML =
                    '<tr><td colspan="6" class="error">Erreur lors du chargement des équipes</td></tr>';
            }
        } catch (error) {
            console.error("Erreur lors du chargement des équipes:", error);
            document.querySelector("#teamsTable tbody").innerHTML =
                '<tr><td colspan="6" class="error">Une erreur est survenue lors du chargement des équipes</td></tr>';
        }
    }

    function displayTeams(teamsData) {
        const { teams, page, totalPages, total } = teamsData;
        const tbody = document.querySelector("#teamsTable tbody");

        tbody.innerHTML = "";

        if (!teams || teams.length === 0) {
            tbody.innerHTML =
                '<tr><td colspan="6" class="empty-state">Aucune équipe trouvée</td></tr>';
            return;
        }

        teams.forEach((team) => {
            const tr = document.createElement("tr");

            // Formater la date de création
            const createdDate = new Date(team.createdAt);
            const formattedDate = createdDate.toLocaleDateString("fr-FR", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
            });

            tr.innerHTML = `
                <td>${team.name}</td>
                <td>${team.manager ? team.manager.name : "Aucun"}</td>
                <td>${team.members_count || 0}</td>
                <td>${team.projects_count || 0}</td>
                <td>${formattedDate}</td>
                <td class="table-actions">
                    <button class="btn btn-sm btn-info view-team" data-id="${
                        team.id
                    }" title="Voir les détails">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-secondary edit-team" data-id="${
                        team.id
                    }" title="Modifier">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger delete-team" data-id="${
                        team.id
                    }" title="Supprimer">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;

            tbody.appendChild(tr);
        });

        // Ajouter les événements aux boutons
        document.querySelectorAll(".view-team").forEach((btn) => {
            btn.addEventListener("click", () => {
                const teamId = btn.getAttribute("data-id");
                // Redirection vers la page de détails de l'équipe
                window.location.href = `team.html?id=${teamId}`;
            });
        });

        document.querySelectorAll(".edit-team").forEach((btn) => {
            btn.addEventListener("click", () => {
                const teamId = btn.getAttribute("data-id");
                openTeamModal(teamId);
            });
        });

        document.querySelectorAll(".delete-team").forEach((btn) => {
            btn.addEventListener("click", () => {
                const teamId = btn.getAttribute("data-id");
                if (
                    confirm(
                        "Êtes-vous sûr de vouloir supprimer cette équipe ? Cette action supprimera également tous les projets associés."
                    )
                ) {
                    deleteTeam(teamId);
                }
            });
        });

        // Mettre à jour la pagination
        updatePagination(
            "teamsPagination",
            page,
            totalPages,
            total,
            (newPage) => {
                teamsCurrentPage = newPage;
                loadTeams();
            }
        );
    }

    async function openTeamModal(teamId = null) {
        const teamModal = document.getElementById("teamModal");
        const teamModalTitle = document.getElementById("teamModalTitle");
        const teamForm = document.getElementById("teamForm");
        const teamIdInput = document.getElementById("teamId");
        const teamNameInput = document.getElementById("teamName");
        const teamManagerInput = document.getElementById("teamManager");

        // Réinitialiser le formulaire
        teamForm.reset();
        teamIdInput.value = "";

        // Charger les utilisateurs chefs de projet pour le select
        await loadProjectManagersForSelect("teamManager");

        if (teamId) {
            // Mode édition
            teamModalTitle.textContent = "Modifier l'équipe";

            try {
                const response = await authenticatedFetch(
                    `${API_CONFIG.BASE_URL}/admin/teams/${teamId}`
                );
                const data = await response.json();

                if (response.ok && data.status === "success") {
                    const team = data.data;

                    teamIdInput.value = team.id;
                    teamNameInput.value = team.name || "";

                    if (team.manager) {
                        teamManagerInput.value = team.manager.id;
                    } else {
                        teamManagerInput.value = "";
                    }
                } else {
                    console.error(
                        "Erreur lors du chargement de l'équipe:",
                        data.message
                    );
                    alert("Erreur lors du chargement des détails de l'équipe");
                    return;
                }
            } catch (error) {
                console.error("Erreur lors du chargement de l'équipe:", error);
                alert("Une erreur est survenue lors du chargement de l'équipe");
                return;
            }
        } else {
            // Mode création
            teamModalTitle.textContent = "Nouvelle équipe";
        }

        // Afficher le modal
        teamModal.style.display = "block";
    }

    function closeTeamModal() {
        document.getElementById("teamModal").style.display = "none";
    }

    async function saveTeam() {
        const teamId = document.getElementById("teamId").value;
        const name = document.getElementById("teamName").value;
        const managerId = document.getElementById("teamManager").value;

        const teamData = {
            name,
        };

        if (managerId) {
            teamData.manager_id = managerId;
        }

        try {
            let response, url, method;

            if (teamId) {
                // Mode édition
                url = `${API_CONFIG.BASE_URL}/admin/teams/${teamId}`;
                method = "PUT";
            } else {
                // Mode création
                url = `${API_CONFIG.BASE_URL}/admin/teams`;
                method = "POST";
            }

            response = await authenticatedFetch(url, {
                method,
                body: JSON.stringify(teamData),
            });

            const data = await response.json();

            if (response.ok && data.status === "success") {
                closeTeamModal();
                loadTeams();

                // Recharger les équipes dans les selects
                loadTeamsForSelect("userTeamFilter");
                loadTeamsForSelect("projectTeamFilter");
            } else {
                console.error(
                    "Erreur lors de l'enregistrement de l'équipe:",
                    data.message
                );
                alert(
                    `Erreur: ${
                        data.message || "Impossible d'enregistrer l'équipe"
                    }`
                );
            }
        } catch (error) {
            console.error(
                "Erreur lors de l'enregistrement de l'équipe:",
                error
            );
            alert(
                "Une erreur est survenue lors de l'enregistrement de l'équipe"
            );
        }
    }

    async function deleteTeam(teamId) {
        try {
            const response = await authenticatedFetch(
                `${API_CONFIG.BASE_URL}/admin/teams/${teamId}`,
                {
                    method: "DELETE",
                }
            );

            const data = await response.json();

            if (response.ok && data.status === "success") {
                loadTeams();

                // Recharger les équipes dans les selects
                loadTeamsForSelect("userTeamFilter");
                loadTeamsForSelect("projectTeamFilter");
            } else {
                console.error(
                    "Erreur lors de la suppression de l'équipe:",
                    data.message
                );
                alert(
                    `Erreur: ${
                        data.message || "Impossible de supprimer l'équipe"
                    }`
                );
            }
        } catch (error) {
            console.error("Erreur lors de la suppression de l'équipe:", error);
            alert("Une erreur est survenue lors de la suppression de l'équipe");
        }
    }

    // ===== GESTION DES PROJETS =====
    let projectsCurrentPage = 1;
    let projectsFilter = {
        search: "",
        status: "",
        team: "",
    };

    function setupProjectManagement() {
        // Références aux éléments DOM
        const projectSearchInput =
            document.getElementById("projectSearchInput");
        const projectSearchBtn = document.getElementById("projectSearchBtn");
        const projectStatusFilter = document.getElementById(
            "projectStatusFilter"
        );
        const projectTeamFilter = document.getElementById("projectTeamFilter");

        // Événements pour les filtres
        projectSearchBtn.addEventListener("click", () => {
            projectsFilter.search = projectSearchInput.value.trim();
            projectsCurrentPage = 1;
            loadProjects();
        });

        projectSearchInput.addEventListener("keypress", (e) => {
            if (e.key === "Enter") {
                projectsFilter.search = projectSearchInput.value.trim();
                projectsCurrentPage = 1;
                loadProjects();
            }
        });

        projectStatusFilter.addEventListener("change", () => {
            projectsFilter.status = projectStatusFilter.value;
            projectsCurrentPage = 1;
            loadProjects();
        });

        projectTeamFilter.addEventListener("change", () => {
            projectsFilter.team = projectTeamFilter.value;
            projectsCurrentPage = 1;
            loadProjects();
        });

        // Chargement initial
        loadProjects();
        loadTeamsForSelect("projectTeamFilter");
    }

    async function loadProjects() {
        try {
            const tbody = document.querySelector("#projectsTable tbody");
            tbody.innerHTML =
                '<tr><td colspan="6" class="loading-cell">Chargement des projets...</td></tr>';

            // Construire l'URL avec les filtres
            let url = `${API_CONFIG.BASE_URL}/admin/projects?page=${projectsCurrentPage}&limit=10`;

            if (projectsFilter.search) {
                url += `&search=${encodeURIComponent(projectsFilter.search)}`;
            }

            if (projectsFilter.status) {
                url += `&status=${encodeURIComponent(projectsFilter.status)}`;
            }

            if (projectsFilter.team) {
                url += `&team=${encodeURIComponent(projectsFilter.team)}`;
            }

            const response = await authenticatedFetch(url);
            const data = await response.json();

            if (response.ok && data.status === "success") {
                displayProjects(data.data);
            } else {
                console.error(
                    "Erreur lors du chargement des projets:",
                    data.message
                );
                tbody.innerHTML =
                    '<tr><td colspan="6" class="error">Erreur lors du chargement des projets</td></tr>';
            }
        } catch (error) {
            console.error("Erreur lors du chargement des projets:", error);
            document.querySelector("#projectsTable tbody").innerHTML =
                '<tr><td colspan="6" class="error">Une erreur est survenue lors du chargement des projets</td></tr>';
        }
    }

    function displayProjects(projectsData) {
        const { projects, page, totalPages, total } = projectsData;
        const tbody = document.querySelector("#projectsTable tbody");

        tbody.innerHTML = "";

        if (!projects || projects.length === 0) {
            tbody.innerHTML =
                '<tr><td colspan="6" class="empty-state">Aucun projet trouvé</td></tr>';
            return;
        }

        projects.forEach((project) => {
            const tr = document.createElement("tr");

            // Formater la date de création
            const createdDate = new Date(project.createdAt);
            const formattedDate = createdDate.toLocaleDateString("fr-FR", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
            });

            // Statut du projet
            let statusText = project.status === "active" ? "Actif" : "Archivé";
            let statusClass =
                project.status === "active"
                    ? "status-active"
                    : "status-archived";

            tr.innerHTML = `
                <td>${project.name}</td>
                <td>${project.team ? project.team.name : "Aucune"}</td>
                <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                <td>${project.tasks_count || 0}</td>
                <td>${formattedDate}</td>
                <td class="table-actions">
                    <button class="btn btn-sm btn-info view-project" data-id="${
                        project.id
                    }" title="Voir les détails">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-secondary toggle-project-status" data-id="${
                        project.id
                    }" data-status="${project.status}" title="${
                project.status === "active" ? "Archiver" : "Activer"
            }">
                        <i class="fas fa-${
                            project.status === "active" ? "archive" : "undo"
                        }"></i>
                    </button>
                    <button class="btn btn-sm btn-danger delete-project" data-id="${
                        project.id
                    }" title="Supprimer">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;

            tbody.appendChild(tr);
        });

        // Ajouter les événements aux boutons
        document.querySelectorAll(".view-project").forEach((btn) => {
            btn.addEventListener("click", () => {
                const projectId = btn.getAttribute("data-id");
                // Redirection vers la page de détails du projet
                window.location.href = `project.html?id=${projectId}`;
            });
        });

        document.querySelectorAll(".toggle-project-status").forEach((btn) => {
            btn.addEventListener("click", () => {
                const projectId = btn.getAttribute("data-id");
                const currentStatus = btn.getAttribute("data-status");
                const newStatus =
                    currentStatus === "active" ? "archived" : "active";
                const actionText =
                    currentStatus === "active" ? "archiver" : "activer";

                if (
                    confirm(
                        `Êtes-vous sûr de vouloir ${actionText} ce projet ?`
                    )
                ) {
                    toggleProjectStatus(projectId, newStatus);
                }
            });
        });

        document.querySelectorAll(".delete-project").forEach((btn) => {
            btn.addEventListener("click", () => {
                const projectId = btn.getAttribute("data-id");
                if (
                    confirm(
                        "Êtes-vous sûr de vouloir supprimer ce projet ? Cette action supprimera également toutes les tâches associées."
                    )
                ) {
                    deleteProject(projectId);
                }
            });
        });

        // Mettre à jour la pagination
        updatePagination(
            "projectsPagination",
            page,
            totalPages,
            total,
            (newPage) => {
                projectsCurrentPage = newPage;
                loadProjects();
            }
        );
    }

    async function toggleProjectStatus(projectId, newStatus) {
        try {
            const response = await authenticatedFetch(
                `${API_CONFIG.BASE_URL}/admin/projects/${projectId}/status`,
                {
                    method: "PUT",
                    body: JSON.stringify({ status: newStatus }),
                }
            );

            const data = await response.json();

            if (response.ok && data.status === "success") {
                loadProjects();
            } else {
                console.error(
                    "Erreur lors du changement de statut du projet:",
                    data.message
                );
                alert(
                    `Erreur: ${
                        data.message ||
                        "Impossible de changer le statut du projet"
                    }`
                );
            }
        } catch (error) {
            console.error(
                "Erreur lors du changement de statut du projet:",
                error
            );
            alert(
                "Une erreur est survenue lors du changement de statut du projet"
            );
        }
    }

    async function deleteProject(projectId) {
        try {
            const response = await authenticatedFetch(
                `${API_CONFIG.BASE_URL}/admin/projects/${projectId}`,
                {
                    method: "DELETE",
                }
            );

            const data = await response.json();

            if (response.ok && data.status === "success") {
                loadProjects();
            } else {
                console.error(
                    "Erreur lors de la suppression du projet:",
                    data.message
                );
                alert(
                    `Erreur: ${
                        data.message || "Impossible de supprimer le projet"
                    }`
                );
            }
        } catch (error) {
            console.error("Erreur lors de la suppression du projet:", error);
            alert("Une erreur est survenue lors de la suppression du projet");
        }
    }

    // ===== GESTION DES LOGS =====
    let logsCurrentPage = 1;
    let logsFilter = {
        action: "",
        entity: "",
        startDate: "",
        endDate: "",
    };

    function setupLogsManagement() {
        // Références aux éléments DOM
        const logActionFilter = document.getElementById("logActionFilter");
        const logEntityFilter = document.getElementById("logEntityFilter");
        const logStartDate = document.getElementById("logStartDate");
        const logEndDate = document.getElementById("logEndDate");
        const applyLogFilters = document.getElementById("applyLogFilters");

        // Modal détails de log
        const logDetailsModal = document.getElementById("logDetailsModal");
        const closeLogDetailsBtn =
            document.getElementById("closeLogDetailsBtn");
        const closeLogDetailsModal = logDetailsModal.querySelector(".close");

        // Événements pour les filtres
        applyLogFilters.addEventListener("click", () => {
            logsFilter.action = logActionFilter.value;
            logsFilter.entity = logEntityFilter.value;
            logsFilter.startDate = logStartDate.value;
            logsFilter.endDate = logEndDate.value;
            logsCurrentPage = 1;
            loadLogs();
        });

        // Événements pour le modal
        closeLogDetailsBtn.addEventListener("click", () =>
            closeLogDetailsModal()
        );
        closeLogDetailsModal.addEventListener("click", () =>
            closeLogDetailsModal()
        );

        // Chargement initial
        loadLogs();
    }

    async function loadLogs() {
        try {
            const tbody = document.querySelector("#logsTable tbody");
            tbody.innerHTML =
                '<tr><td colspan="5" class="loading-cell">Chargement des logs...</td></tr>';

            // Construire l'URL avec les filtres
            let url = `${API_CONFIG.BASE_URL}/admin/logs?page=${logsCurrentPage}&limit=15`;

            if (logsFilter.action) {
                url += `&action=${encodeURIComponent(logsFilter.action)}`;
            }

            if (logsFilter.entity) {
                url += `&entity=${encodeURIComponent(logsFilter.entity)}`;
            }

            if (logsFilter.startDate) {
                url += `&startDate=${encodeURIComponent(logsFilter.startDate)}`;
            }

            if (logsFilter.endDate) {
                url += `&endDate=${encodeURIComponent(logsFilter.endDate)}`;
            }

            const response = await authenticatedFetch(url);
            const data = await response.json();

            if (response.ok && data.status === "success") {
                displayLogs(data.data);
            } else {
                console.error(
                    "Erreur lors du chargement des logs:",
                    data.message
                );
                tbody.innerHTML =
                    '<tr><td colspan="5" class="error">Erreur lors du chargement des logs</td></tr>';
            }
        } catch (error) {
            console.error("Erreur lors du chargement des logs:", error);
            document.querySelector("#logsTable tbody").innerHTML =
                '<tr><td colspan="5" class="error">Une erreur est survenue lors du chargement des logs</td></tr>';
        }
    }

    function displayLogs(logsData) {
        const { logs, page, totalPages, total } = logsData;
        const tbody = document.querySelector("#logsTable tbody");

        tbody.innerHTML = "";

        if (!logs || logs.length === 0) {
            tbody.innerHTML =
                '<tr><td colspan="5" class="empty-state">Aucun log trouvé</td></tr>';
            return;
        }

        logs.forEach((log) => {
            const tr = document.createElement("tr");

            // Formater la date
            const timestamp = new Date(log.timestamp);
            const formattedDate = timestamp.toLocaleDateString("fr-FR", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
            });

            // Traduire l'action
            let actionText = log.action;

            if (log.action === "user.register") actionText = "Inscription";
            else if (log.action === "user.login") actionText = "Connexion";
            else if (log.action === "project.create")
                actionText = "Création de projet";
            else if (log.action === "task.create")
                actionText = "Création de tâche";

            tr.innerHTML = `
                <td>${formattedDate}</td>
                <td>${log.user ? log.user.name : "Système"}</td>
                <td>${actionText}</td>
                <td>${
                    log.entity
                        ? `${log.entity.type} (${
                              log.entity.name || log.entity.id
                          })`
                        : "N/A"
                }</td>
                <td class="table-actions">
                    <button class="btn btn-sm btn-info view-log" data-id="${
                        log._id
                    }" title="Voir les détails">
                        <i class="fas fa-info-circle"></i>
                    </button>
                </td>
            `;

            tbody.appendChild(tr);
        });

        // Ajouter les événements aux boutons
        document.querySelectorAll(".view-log").forEach((btn) => {
            btn.addEventListener("click", () => {
                const logId = btn.getAttribute("data-id");
                openLogDetailsModal(logId);
            });
        });

        // Mettre à jour la pagination
        updatePagination(
            "logsPagination",
            page,
            totalPages,
            total,
            (newPage) => {
                logsCurrentPage = newPage;
                loadLogs();
            }
        );
    }

    async function openLogDetailsModal(logId) {
        const logDetailsModal = document.getElementById("logDetailsModal");
        const logDetails = document.getElementById("logDetails");

        // Afficher le chargement
        logDetails.innerHTML =
            '<div class="loading">Chargement des détails...</div>';
        logDetailsModal.style.display = "block";

        try {
            const response = await authenticatedFetch(
                `${API_CONFIG.BASE_URL}/admin/logs/${logId}`
            );
            const data = await response.json();

            if (response.ok && data.status === "success") {
                const log = data.data;

                // Formater la date
                const timestamp = new Date(log.timestamp);
                const formattedDate = timestamp.toLocaleDateString("fr-FR", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                });

                // Formater les détails
                let detailsHtml = `
                    <div class="log-detail-item">
                        <div class="log-detail-label">Date/Heure</div>
                        <div class="log-detail-value">${formattedDate}</div>
                    </div>
                    <div class="log-detail-item">
                        <div class="log-detail-label">Utilisateur</div>
                        <div class="log-detail-value">${
                            log.user ? log.user.name : "Système"
                        }</div>
                    </div>
                    <div class="log-detail-item">
                        <div class="log-detail-label">Action</div>
                        <div class="log-detail-value">${log.action}</div>
                    </div>
                `;

                if (log.entity) {
                    detailsHtml += `
                        <div class="log-detail-item">
                            <div class="log-detail-label">Entité</div>
                            <div class="log-detail-value">${log.entity.type} (${
                        log.entity.name || log.entity.id
                    })</div>
                        </div>
                    `;
                }

                if (log.payload) {
                    detailsHtml += `
                        <div class="log-detail-item">
                            <div class="log-detail-label">Payload</div>
                            <div class="log-detail-value">
                                <pre class="log-payload">${JSON.stringify(
                                    log.payload,
                                    null,
                                    2
                                )}</pre>
                            </div>
                        </div>
                    `;
                }

                logDetails.innerHTML = detailsHtml;
            } else {
                console.error(
                    "Erreur lors du chargement des détails du log:",
                    data.message
                );
                logDetails.innerHTML =
                    '<div class="error">Erreur lors du chargement des détails du log</div>';
            }
        } catch (error) {
            console.error(
                "Erreur lors du chargement des détails du log:",
                error
            );
            logDetails.innerHTML =
                '<div class="error">Une erreur est survenue lors du chargement des détails</div>';
        }
    }

    function closeLogDetailsModal() {
        document.getElementById("logDetailsModal").style.display = "none";
    }

    // ===== FONCTIONS UTILITAIRES =====
    async function loadTeamsForSelect(selectId) {
        try {
            const select = document.getElementById(selectId);

            // Garder l'option par défaut et supprimer les autres
            const defaultOption = select.querySelector('option[value=""]');
            select.innerHTML = "";
            select.appendChild(defaultOption);

            const response = await authenticatedFetch(
                `${API_CONFIG.BASE_URL}/admin/teams?limit=100`
            );
            const data = await response.json();

            if (response.ok && data.status === "success") {
                const teams = data.data.teams || [];

                teams.forEach((team) => {
                    const option = document.createElement("option");
                    option.value = team.id;
                    option.textContent = team.name;
                    select.appendChild(option);
                });
            } else {
                console.error(
                    "Erreur lors du chargement des équipes pour le select:",
                    data.message
                );
            }
        } catch (error) {
            console.error(
                "Erreur lors du chargement des équipes pour le select:",
                error
            );
        }
    }

    async function loadProjectManagersForSelect(selectId) {
        try {
            const select = document.getElementById(selectId);

            // Garder l'option par défaut et supprimer les autres
            const defaultOption = select.querySelector('option[value=""]');
            select.innerHTML = "";
            select.appendChild(defaultOption);

            const response = await authenticatedFetch(
                `${API_CONFIG.BASE_URL}/admin/users?role=project_manager&limit=100`
            );
            const data = await response.json();

            if (response.ok && data.status === "success") {
                const managers = data.data.users || [];

                managers.forEach((manager) => {
                    const option = document.createElement("option");
                    option.value = manager.id;
                    option.textContent = manager.name;
                    select.appendChild(option);
                });
            } else {
                console.error(
                    "Erreur lors du chargement des chefs de projet pour le select:",
                    data.message
                );
            }
        } catch (error) {
            console.error(
                "Erreur lors du chargement des chefs de projet pour le select:",
                error
            );
        }
    }

    function updatePagination(
        containerId,
        currentPage,
        totalPages,
        totalItems,
        callback
    ) {
        const container = document.getElementById(containerId);

        if (totalPages <= 1) {
            container.style.display = "none";
            return;
        }

        container.style.display = "flex";

        const itemsPerPage = Math.ceil(totalItems / totalPages);
        const startItem = (currentPage - 1) * itemsPerPage + 1;
        const endItem = Math.min(currentPage * itemsPerPage, totalItems);

        container.innerHTML = `
            <div class="pagination-info">
                Affichage de ${startItem} à ${endItem} sur ${totalItems} éléments
            </div>
            <div class="pagination-controls">
                <button class="pagination-btn" data-page="1" ${
                    currentPage === 1 ? "disabled" : ""
                }>
                    <i class="fas fa-angle-double-left"></i>
                </button>
                <button class="pagination-btn" data-page="${currentPage - 1}" ${
            currentPage === 1 ? "disabled" : ""
        }>
                    <i class="fas fa-angle-left"></i>
                </button>
                <span class="pagination-current">Page ${currentPage} sur ${totalPages}</span>
                <button class="pagination-btn" data-page="${currentPage + 1}" ${
            currentPage === totalPages ? "disabled" : ""
        }>
                    <i class="fas fa-angle-right"></i>
                </button>
                <button class="pagination-btn" data-page="${totalPages}" ${
            currentPage === totalPages ? "disabled" : ""
        }>
                    <i class="fas fa-angle-double-right"></i>
                </button>
            </div>
        `;

        // Ajouter les événements aux boutons
        container.querySelectorAll(".pagination-btn").forEach((btn) => {
            if (!btn.disabled) {
                btn.addEventListener("click", () => {
                    const page = parseInt(btn.getAttribute("data-page"));
                    callback(page);
                });
            }
        });
    }

    function showError(message) {
        // Créer un élément d'alerte d'erreur
        const errorDiv = document.createElement("div");
        errorDiv.className = "error";
        errorDiv.textContent = message;

        // Ajouter l'élément au début de la section active
        const activeSection = document.querySelector(".admin-section.active");
        activeSection.insertBefore(errorDiv, activeSection.firstChild);

        // Supprimer l'alerte après un délai
        setTimeout(() => {
            errorDiv.remove();
        }, 5000);
    }
});
