document.addEventListener("DOMContentLoaded", () => {
    const signupForm = document.getElementById("signup-form");
    const errorMessage = document.getElementById("error-message");
    const roleSelect = document.getElementById("role");

    if (isLoggedIn()) {
        window.location.href = "dashboard.html";
        return;
    }

    signupForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const username = document.getElementById("username").value.trim();
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;
        const role = roleSelect.value;

        if (!username || !email || !password) {
            errorMessage.textContent =
                "Veuillez remplir tous les champs requis.";
            return;
        }

        const endpoint =
            role === "chef_de_projet"
                ? API_CONFIG.ENDPOINTS.REGISTER
                : API_CONFIG.ENDPOINTS.JOIN;
        const userData = {
            name: username,
            email,
            password,
            role: role === "chef_de_projet" ? "project_manager" : "contributor",
        };

        if (role === "chef_de_projet") {
            const teamName = document.getElementById("team-name").value.trim();
            if (!teamName) {
                errorMessage.textContent =
                    "Veuillez saisir le nom de l'équipe.";
                return;
            }
            userData.team_name = teamName;
        }

        if (role === "contributeur") {
            const invitationKey = document
                .getElementById("invitationKeyInput")
                .value.trim();
            if (!invitationKey) {
                errorMessage.textContent =
                    "Veuillez saisir la clé d'invitation.";
                return;
            }
            userData.invitation_key = invitationKey;
        }

        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(userData),
            });

            const data = await response.json();
            if (response.ok && data.status === "success") {
                localStorage.setItem("token", data.data.token);
                localStorage.setItem("user", JSON.stringify(data.data.user));
                window.location.href = "dashboard.html";
            } else {
                errorMessage.textContent =
                    data.message || "Erreur lors de l'inscription";
            }
        } catch (error) {
            errorMessage.textContent =
                "Une erreur est survenue. Veuillez réessayer.";
        }
    });
});
