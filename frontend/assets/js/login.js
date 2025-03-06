document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("login-form");
    const errorMessage = document.getElementById("error-message");

    if (isLoggedIn()) {
        window.location.href = "dashboard.html";
        return;
    }

    loginForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;

        if (!email || !password) {
            errorMessage.textContent = "Veuillez remplir tous les champs.";
            return;
        }

        try {
            const response = await fetch(
                `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.LOGIN}`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, password }),
                }
            );

            const responseData = await response.json();

            if (response.ok) {
                if (
                    responseData.data &&
                    responseData.data.token &&
                    responseData.data.user
                ) {
                    localStorage.setItem("token", responseData.data.token);
                    localStorage.setItem(
                        "user",
                        JSON.stringify(responseData.data.user)
                    );
                    window.location.href = "dashboard.html";
                } else {
                    errorMessage.textContent =
                        "Erreur de format dans la réponse du serveur";
                }
            } else {
                errorMessage.textContent =
                    responseData.message || "Erreur lors de la connexion";
            }
        } catch (error) {
            errorMessage.textContent =
                "Une erreur est survenue. Veuillez réessayer.";
        }
    });
});
