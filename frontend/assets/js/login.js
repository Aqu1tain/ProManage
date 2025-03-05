document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const errorMessage = document.getElementById('error-message');

    loginForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        // Exemple de validation simple
        if (username === 'admin' && password === 'password') {
            // Stocker des infos utilisateur simulées (à remplacer par JWT)
            localStorage.setItem('token', 'fake-jwt-token');
            localStorage.setItem('user', JSON.stringify({
                username: username,
                role: 'chef_de_projet'
            }));
            
            window.location.href = 'dashboard.html';
        } else {
            errorMessage.textContent = 'Nom d\'utilisateur ou mot de passe incorrect.';
        }
    });
});