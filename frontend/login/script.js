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