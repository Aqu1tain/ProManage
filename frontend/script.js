document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const errorMessage = document.getElementById('error-message');

    loginForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        // Exemple de validation simple
        if (username === 'admin' && password === 'password') {
            alert('Connexion réussie !');
            errorMessage.textContent = '';
        } else {
            errorMessage.textContent = 'Nom d\'utilisateur ou mot de passe incorrect.';
        }
    });
});

document.addEventListener('DOMContentLoaded', () => {
    const signupForm = document.getElementById('signup-form');
    const errorMessage = document.getElementById('error-message');

    signupForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const username = document.getElementById('username').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            const response = await fetch('/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, email, password })
            });

            const result = await response.json();

            if (response.ok) {
                alert('Compte créé avec succès !');
                errorMessage.textContent = '';
            } else {
                errorMessage.textContent = result.message;
            }
        } catch (error) {
            errorMessage.textContent = 'Une erreur est survenue. Veuillez réessayer.';
        }
    });
});
