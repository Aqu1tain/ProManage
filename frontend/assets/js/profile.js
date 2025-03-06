document.addEventListener("DOMContentLoaded", () => {
    // Vérifier si l'utilisateur est connecté
    if (!isLoggedIn()) {
        window.location.href = "index.html";
        return;
    }

    // Récupérer les informations de l'utilisateur
    const currentUser = getUserInfo();

    // Références DOM
    const backBtn = document.getElementById("backBtn");
    const logoutBtn = document.getElementById("logoutBtn");
    const editProfileBtn = document.getElementById("editProfileBtn");
    const changePasswordBtn = document.getElementById("changePasswordBtn");

    // Éléments du profil
    const userInitials = document.getElementById("userInitials");
    const userName = document.getElementById("userName");
    const userRole = document.getElementById("userRole");
    const userEmail = document.getElementById("userEmail");
    const userTeam = document.getElementById("userTeam");
    const userLastLogin = document.getElementById("userLastLogin");
    const userCreatedAt = document.getElementById("userCreatedAt");

    // Éléments des statistiques
    const projectsCount = document.getElementById("projectsCount");
    const tasksCount = document.getElementById("tasksCount");
    const activeTasksCount = document.getElementById("activeTasksCount");
    const completedTasksCount = document.getElementById("completedTasksCount");
    const recentActivity = document.getElementById("recentActivity");

    // Modals
    const editProfileModal = document.getElementById("editProfileModal");
    const passwordModal = document.getElementById("passwordModal");
    const profileForm = document.getElementById("profileForm");
    const passwordForm = document.getElementById("passwordForm");
    const editName = document.getElementById("editName");
    const editEmail = document.getElementById("editEmail");
    const currentPassword = document.getElementById("currentPassword");
    const newPassword = document.getElementById("newPassword");
    const confirmPassword = document.getElementById("confirmPassword");
    const strengthBar = document.getElementById("strengthBar");
    const strengthText = document.getElementById("strengthText");

    // Événements
    backBtn.addEventListener("click", () => {
        window.location.href = "dashboard.html";
    });

    logoutBtn.addEventListener("click", logout);

    editProfileBtn.addEventListener("click", () => {
        openEditProfileModal();
    });

    changePasswordBtn.addEventListener("click", () => {
        openPasswordModal();
    });

    // Fermeture des modals
    document.querySelectorAll(".close").forEach((closeBtn) => {
        closeBtn.addEventListener("click", (e) => {
            const modal = e.target.closest(".modal");
            closeModal(modal);
        });
    });

    document.getElementById("cancelEditBtn").addEventListener("click", () => {
        closeModal(editProfileModal);
    });

    document
        .getElementById("cancelPasswordBtn")
        .addEventListener("click", () => {
            closeModal(passwordModal);
        });

    // Soumission des formulaires
    profileForm.addEventListener("submit", (e) => {
        e.preventDefault();
        updateProfile();
    });

    passwordForm.addEventListener("submit", (e) => {
        e.preventDefault();
        updatePassword();
    });

    // Vérification de la force du mot de passe
    newPassword.addEventListener("input", checkPasswordStrength);

    // Fermer les modals en cliquant à l'extérieur
    window.addEventListener("click", (e) => {
        if (e.target === editProfileModal) {
            closeModal(editProfileModal);
        }
        if (e.target === passwordModal) {
            closeModal(passwordModal);
        }
    });

    // Initialisation
    displayUserInfo();
    loadUserStats();
    loadRecentActivity();

    // Fonctions
    function displayUserInfo() {
        // Afficher les informations de l'utilisateur déjà disponibles en local
        if (currentUser) {
            // Nom et initiales
            userName.textContent = currentUser.name || "Utilisateur";
            userInitials.textContent = getInitials(currentUser.name);

            // Email
            userEmail.textContent = currentUser.email || "Aucun email";

            // Rôle avec badge
            let roleText = "";
            let roleClass = "";

            switch (currentUser.role) {
                case "admin":
                    roleText = "Administrateur";
                    roleClass = "role-admin";
                    break;
                case "project_manager":
                    roleText = "Chef de projet";
                    roleClass = "role-project-manager";
                    break;
                case "contributor":
                    roleText = "Contributeur";
                    roleClass = "role-contributor";
                    break;
                default:
                    roleText = currentUser.role || "Membre";
            }

            userRole.textContent = roleText;
            userRole.className = `role-badge ${roleClass}`;
        }

        // Charger les informations complètes depuis l'API
        loadUserDetails();
    }

    async function loadUserDetails() {
        try {
            const response = await authenticatedFetch(
                `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PROFILE}`
            );
            const data = await response.json();

            if (response.ok && data.status === "success") {
                const userDetails = data.data;

                // Équipe
                if (userDetails.team) {
                    userTeam.textContent = userDetails.team.name;
                } else {
                    userTeam.textContent = "Aucune équipe";
                }

                // Date d'inscription
                if (userDetails.createdAt) {
                    const createdDate = new Date(userDetails.createdAt);
                    userCreatedAt.textContent = formatDate(createdDate);
                } else {
                    userCreatedAt.textContent = "Inconnue";
                }

                // Dernière connexion
                if (userDetails.last_login) {
                    const loginDate = new Date(userDetails.last_login);
                    userLastLogin.textContent = formatDateWithTime(loginDate);
                } else {
                    userLastLogin.textContent = "Jamais";
                }
            } else {
                console.error(
                    "Erreur lors du chargement des détails utilisateur:",
                    data.message
                );
            }
        } catch (error) {
            console.error(
                "Erreur lors du chargement des détails utilisateur:",
                error
            );
        }
    }

    async function loadUserStats() {
        try {
            // Récupérer les projets de l'utilisateur
            const projectsResponse = await authenticatedFetch(
                `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PROJECTS}`
            );
            const projectsData = await projectsResponse.json();

            // Récupérer les tâches de l'utilisateur
            const tasksResponse = await authenticatedFetch(
                `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.TASKS}/my`
            );
            const tasksData = await tasksResponse.json();

            if (projectsResponse.ok && tasksResponse.ok) {
                const projects = projectsData.data.projects || [];
                const tasks = tasksData.data.tasks || [];

                // Mettre à jour les compteurs
                projectsCount.textContent = projects.length || 0;
                tasksCount.textContent = tasks.length || 0;

                // Calculer les tâches actives (todo + in_progress)
                const activeTasks = tasks.filter(
                    (t) => t.status === "todo" || t.status === "in_progress"
                ).length;
                activeTasksCount.textContent = activeTasks;

                // Tâches terminées
                const completedTasks = tasks.filter(
                    (t) => t.status === "done"
                ).length;
                completedTasksCount.textContent = completedTasks;
            } else {
                console.error(
                    "Erreur lors du chargement des statistiques:",
                    projectsData.message || tasksData.message
                );
            }
        } catch (error) {
            console.error("Erreur lors du chargement des statistiques:", error);
        }
    }

    async function loadRecentActivity() {
        try {
            recentActivity.innerHTML =
                '<div class="loading">Chargement de l\'activité récente...</div>';

            // Au lieu d'utiliser une API de notifications, nous allons récupérer l'activité
            // à partir des tâches récentes et des projets

            // Récupérer les tâches récentes
            const tasksResponse = await authenticatedFetch(
                `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.TASKS}/my`
            );
            const tasksData = await tasksResponse.json();

            if (tasksResponse.ok && tasksData.status === "success") {
                // Créer une liste d'activités à partir des tâches
                const tasks = tasksData.data.tasks || [];

                // Trier par date de dernière mise à jour (la plus récente d'abord)
                const sortedTasks = [...tasks]
                    .sort(
                        (a, b) =>
                            new Date(b.updatedAt || b.createdAt) -
                            new Date(a.updatedAt || a.createdAt)
                    )
                    .slice(0, 10); // Limiter à 10 activités

                // Transformer en activités
                const activities = sortedTasks.map((task) => {
                    const date = new Date(task.updatedAt || task.createdAt);
                    const isCreated = task.createdAt === task.updatedAt;

                    return {
                        type: "task",
                        action: isCreated
                            ? "create"
                            : task.status === "done"
                            ? "complete"
                            : "update",
                        data: {
                            title: task.title,
                            status: task.status,
                            project_name: task.project
                                ? task.project.name
                                : "Projet inconnu",
                        },
                        createdAt: date,
                    };
                });

                displayActivities(activities);
            } else {
                console.error(
                    "Erreur lors du chargement des tâches:",
                    tasksData.message
                );
                recentActivity.innerHTML =
                    '<div class="empty-state">Erreur lors du chargement de l\'activité récente</div>';
            }
        } catch (error) {
            console.error("Erreur lors du chargement de l'activité:", error);
            recentActivity.innerHTML =
                '<div class="empty-state">Une erreur est survenue lors du chargement de l\'activité récente</div>';
        }
    }

    function displayActivities(activities) {
        if (!activities || activities.length === 0) {
            recentActivity.innerHTML =
                '<div class="empty-state">Aucune activité récente</div>';
            return;
        }

        recentActivity.innerHTML = "";

        activities.forEach((activity) => {
            const div = document.createElement("div");
            div.className = "activity-item";

            // Déterminer l'icône en fonction du type d'activité
            let iconClass = "";
            let actionText = "";

            switch (activity.type) {
                case "task":
                    iconClass = "icon-task";

                    // Déterminer l'action en fonction du sous-type
                    switch (activity.action) {
                        case "create":
                            actionText = "Vous avez créé une tâche";
                            break;
                        case "update":
                            actionText = "Vous avez mis à jour une tâche";
                            break;
                        case "status":
                            actionText = `Tâche marquée comme "${formatStatus(
                                activity.data.new_status
                            )}"`;
                            break;
                        case "complete":
                            actionText = "Vous avez terminé une tâche";
                            break;
                        default:
                            actionText = "Activité sur une tâche";
                    }
                    break;

                case "project":
                    iconClass = "icon-project";

                    switch (activity.action) {
                        case "create":
                            actionText = "Vous avez créé un projet";
                            break;
                        case "update":
                            actionText = "Vous avez mis à jour un projet";
                            break;
                        case "archive":
                            actionText = "Vous avez archivé un projet";
                            break;
                        default:
                            actionText = "Activité sur un projet";
                    }
                    break;

                case "comment":
                    iconClass = "icon-comment";
                    actionText = "Vous avez commenté sur une tâche";
                    break;

                default:
                    iconClass = "icon-task";
                    actionText = "Activité utilisateur";
            }

            // Formater la date
            const activityDate = new Date(activity.createdAt);
            const formattedDate = formatRelativeTime(activityDate);

            // Construire le contenu de l'élément
            div.innerHTML = `
                <div class="activity-content">
                    <div class="activity-icon ${iconClass}">
                        <i class="fas fa-${getIconForActivity(
                            activity.type,
                            activity.action
                        )}"></i>
                    </div>
                    <div class="activity-details">
                        <p class="activity-message">${actionText}</p>
                        <p class="activity-project">${
                            activity.data.title || activity.data.name || ""
                        }</p>
                    </div>
                </div>
                <div class="activity-time">${formattedDate}</div>
            `;

            recentActivity.appendChild(div);
        });
    }

    function getIconForActivity(type, action) {
        switch (type) {
            case "task":
                switch (action) {
                    case "create":
                        return "plus";
                    case "update":
                        return "edit";
                    case "status":
                        return "exchange-alt";
                    case "complete":
                        return "check";
                    default:
                        return "tasks";
                }
            case "project":
                switch (action) {
                    case "create":
                        return "folder-plus";
                    case "update":
                        return "edit";
                    case "archive":
                        return "archive";
                    default:
                        return "project-diagram";
                }
            case "comment":
                return "comment";
            default:
                return "history";
        }
    }

    function formatStatus(status) {
        switch (status) {
            case "todo":
                return "À faire";
            case "in_progress":
                return "En cours";
            case "done":
                return "Terminé";
            default:
                return status;
        }
    }

    function openEditProfileModal() {
        // Remplir le formulaire avec les valeurs actuelles
        editName.value = currentUser.name || "";
        editEmail.value = currentUser.email || "";

        // Afficher le modal
        editProfileModal.style.display = "block";
    }

    function openPasswordModal() {
        // Réinitialiser le formulaire
        passwordForm.reset();

        // Réinitialiser l'indicateur de force
        strengthBar.className = "strength-bar";
        strengthBar.style.width = "0";
        strengthText.textContent = "Entrez un mot de passe";

        // Afficher le modal
        passwordModal.style.display = "block";
    }

    function closeModal(modal) {
        modal.style.display = "none";
    }

    async function updateProfile() {
        const name = editName.value;
        const email = editEmail.value;

        try {
            const response = await authenticatedFetch(
                `${API_CONFIG.BASE_URL}/users/profile`,
                {
                    method: "PUT",
                    body: JSON.stringify({ name, email }),
                }
            );

            const data = await response.json();

            if (response.ok && data.status === "success") {
                // Mettre à jour les informations utilisateur locales
                const updatedUser = {
                    ...currentUser,
                    name,
                    email,
                };

                localStorage.setItem("user", JSON.stringify(updatedUser));

                // Fermer le modal
                closeModal(editProfileModal);

                // Mettre à jour l'affichage
                displayUserInfo();

                // Afficher un message de succès
                showMessage("Profil mis à jour avec succès", "success");
            } else {
                console.error(
                    "Erreur lors de la mise à jour du profil:",
                    data.message
                );
                showMessage(
                    `Erreur: ${
                        data.message || "Impossible de mettre à jour le profil"
                    }`,
                    "error"
                );
            }
        } catch (error) {
            console.error("Erreur lors de la mise à jour du profil:", error);
            showMessage(
                "Une erreur est survenue lors de la mise à jour du profil",
                "error"
            );
        }
    }

    async function updatePassword() {
        const current = currentPassword.value;
        const newPass = newPassword.value;
        const confirm = confirmPassword.value;

        // Vérifier que les nouveaux mots de passe correspondent
        if (newPass !== confirm) {
            showMessage(
                "Les nouveaux mots de passe ne correspondent pas",
                "error"
            );
            return;
        }

        // Vérifier la force du mot de passe
        const strength = getPasswordStrength(newPass);
        if (strength < 2) {
            showMessage("Le mot de passe est trop faible", "error");
            return;
        }

        try {
            const response = await authenticatedFetch(
                `${API_CONFIG.BASE_URL}/users/password`,
                {
                    method: "PUT",
                    body: JSON.stringify({
                        current_password: current,
                        new_password: newPass,
                    }),
                }
            );

            const data = await response.json();

            if (response.ok && data.status === "success") {
                // Fermer le modal
                closeModal(passwordModal);

                // Afficher un message de succès
                showMessage("Mot de passe mis à jour avec succès", "success");
            } else {
                console.error(
                    "Erreur lors de la mise à jour du mot de passe:",
                    data.message
                );
                showMessage(
                    `Erreur: ${
                        data.message ||
                        "Impossible de mettre à jour le mot de passe"
                    }`,
                    "error"
                );
            }
        } catch (error) {
            console.error(
                "Erreur lors de la mise à jour du mot de passe:",
                error
            );
            showMessage(
                "Une erreur est survenue lors de la mise à jour du mot de passe",
                "error"
            );
        }
    }

    function checkPasswordStrength() {
        const password = newPassword.value;
        let strength = 0;
        if (password.length >= 8) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[\W]/.test(password)) strength++;
        const percentage = (strength / 4) * 100;
        strengthBar.style.width = percentage + "%";
        if (percentage < 50) {
            strengthText.textContent = "Faible";
        } else if (percentage < 75) {
            strengthText.textContent = "Moyenne";
        } else {
            strengthText.textContent = "Forte";
        }
    }

    function getPasswordStrength(password) {
        // 0-3 scale (0: very weak, 3: very strong)
        if (!password) return 0;

        let score = 0;

        // Length check
        if (password.length >= 8) score += 1;

        // Complexity checks
        if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
        if (/[0-9]/.test(password)) score += 0.5;
        if (/[^A-Za-z0-9]/.test(password)) score += 0.5;

        return Math.min(3, Math.floor(score));
    }

    // Utilitaires
    function getInitials(name) {
        if (!name) return "U";

        const parts = name.split(" ");
        if (parts.length === 1) {
            return parts[0].charAt(0).toUpperCase();
        }

        return (
            parts[0].charAt(0) + parts[parts.length - 1].charAt(0)
        ).toUpperCase();
    }

    function formatDate(date) {
        return date.toLocaleDateString("fr-FR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    }

    function formatDateWithTime(date) {
        return date.toLocaleDateString("fr-FR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    }

    function formatRelativeTime(date) {
        const now = new Date();
        const diff = Math.floor((now - date) / 1000); // seconds

        if (diff < 60) {
            return "À l'instant";
        } else if (diff < 3600) {
            const minutes = Math.floor(diff / 60);
            return `Il y a ${minutes} min${minutes > 1 ? "s" : ""}`;
        } else if (diff < 86400) {
            const hours = Math.floor(diff / 3600);
            return `Il y a ${hours} h${hours > 1 ? "s" : ""}`;
        } else if (diff < 2592000) {
            const days = Math.floor(diff / 86400);
            return `Il y a ${days} jour${days > 1 ? "s" : ""}`;
        } else {
            return formatDate(date);
        }
    }

    function showMessage(message, type) {
        // Supprimer les messages existants
        const existingMessages = document.querySelectorAll(".success, .error");
        existingMessages.forEach((msg) => msg.remove());

        // Créer le message
        const messageDiv = document.createElement("div");
        messageDiv.className = type;
        messageDiv.textContent = message;

        // Ajouter au DOM
        const container = document.querySelector(".profile-container");
        container.insertBefore(messageDiv, container.firstChild);

        // Faire défiler vers le haut
        window.scrollTo({ top: 0, behavior: "smooth" });

        // Supprimer après un délai
        setTimeout(() => {
            messageDiv.remove();
        }, 5000);
    }
});
