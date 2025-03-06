// auth.js

function isLoggedIn() {
    const token = localStorage.getItem("token");
    return token && !isTokenExpired(token);
}

function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    // Correction du chemin : on redirige vers "index.html" (les fichiers étant dans le même répertoire)
    window.location.href = "index.html";
}

function getUserInfo() {
    const userString = localStorage.getItem("user");
    try {
        return userString ? JSON.parse(userString) : null;
    } catch (e) {
        console.error(
            "Erreur lors du parsing des informations utilisateur :",
            e
        );
        logout();
        return null;
    }
}

// Vérifie si le token JWT est expiré (on décode la charge utile)
function isTokenExpired(token) {
    try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        const now = Math.floor(Date.now() / 1000);
        return payload.exp && payload.exp < now;
    } catch (e) {
        console.error("Erreur lors du décodage du token :", e);
        return true;
    }
}

// Placeholder pour le rafraîchissement du token (à implémenter selon l’API)
async function refreshToken() {
    // Exemple : faire un appel à /auth/refresh puis stocker le nouveau token
    // Pour l'instant, on déconnecte l'utilisateur
    logout();
}

// Fonction de fetch authentifiée avec contrôle d’expiration du token
async function authenticatedFetch(url, options = {}) {
    const token = localStorage.getItem("token");

    if (token && isTokenExpired(token)) {
        await refreshToken();
    }

    const defaultHeaders = {
        "Content-Type": "application/json",
    };

    if (token) {
        defaultHeaders["Authorization"] = `Bearer ${token}`;
    }

    const fetchOptions = {
        ...options,
        headers: {
            ...defaultHeaders,
            ...(options.headers || {}),
        },
    };

    try {
        const response = await fetch(url, fetchOptions);
        if (response.status === 401) {
            logout();
            throw new Error("Session expirée, veuillez vous reconnecter");
        }
        return response;
    } catch (error) {
        console.error("Erreur lors de la requête API:", error);
        throw error;
    }
}

function handleApiError(error) {
    if (error && error.errors && Array.isArray(error.errors)) {
        return error.errors[0].message;
    } else if (error.message) {
        return error.message;
    }
    return "Une erreur est survenue. Veuillez réessayer.";
}
