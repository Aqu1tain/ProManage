document.addEventListener("DOMContentLoaded", () => {
    const signupForm = document.getElementById("signup-form");
    const errorMessage = document.getElementById("error-message");
    const roleSelect = document.getElementById("role");
    const teamNameContainer = document.getElementById("team-name-container");

    // Afficher/masquer le champ team_name selon le rôle
    roleSelect.addEventListener("change", function () {
        if (this.value === "chef_de_projet") {
            teamNameContainer.style.display = "block";
        } else {
            teamNameContainer.style.display = "none";
        }
    });

    // Initialiser l'affichage du champ team_name
    if (roleSelect.value === "chef_de_projet") {
        teamNameContainer.style.display = "block";
    }

    // Si l'utilisateur est déjà connecté, le rediriger vers le tableau de bord
    if (isLoggedIn()) {
        window.location.href = "dashboard.html";
        return;
    }

    signupForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const username = document.getElementById("username").value;
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        const role = document.getElementById("role").value;

        try {
            // Déterminer l'endpoint basé sur le rôle sélectionné
            const endpoint =
                role === "chef_de_projet"
                    ? API_CONFIG.ENDPOINTS.REGISTER
                    : API_CONFIG.ENDPOINTS.JOIN;

            const userData = {
                name: username,
                email,
                password,
                role:
                    role === "chef_de_projet"
                        ? "project_manager"
                        : "contributor",
            };

            // Si c'est un chef de projet, ajouter le nom de l'équipe
            if (role === "chef_de_projet") {
                const teamName = document.getElementById("team-name").value;
                userData.team_name = teamName;
            }

            // Si c'est un contributeur, demander la clé d'équipe
            if (role === "contributeur") {
                const teamKey = prompt(
                    "Veuillez entrer la clé de votre équipe:"
                );
                if (!teamKey) return; // Annuler si pas de clé
                userData.invitation_key = teamKey;
            }

            console.log("Données d'inscription:", userData);

            const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(userData),
            });

            const data = await response.json();

            if (response.ok && data.status === "success") {
                // Stocker le token JWT et les informations utilisateur
                localStorage.setItem("token", data.data.token);
                localStorage.setItem("user", JSON.stringify(data.data.user));

                alert("Compte créé avec succès !");
                window.location.href = "dashboard.html"; // Redirection vers le tableau de bord
            } else {
                console.error("Erreur d'inscription:", data);
                errorMessage.textContent =
                    data.message || "Erreur lors de l'inscription";
                if (data.error && data.error.errors) {
                    const errorsText = data.error.errors
                        .map((e) => `${e.field}: ${e.message}`)
                        .join(", ");
                    errorMessage.textContent += ` (${errorsText})`;
                }
            }
        } catch (error) {
            console.error("Erreur lors de l'inscription:", error);
            errorMessage.textContent =
                "Une erreur est survenue. Veuillez réessayer.";
        }
    });
});
