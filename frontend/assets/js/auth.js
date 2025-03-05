// Fonctions communes d'authentification
function isLoggedIn() {
    return localStorage.getItem('token') !== null;
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '../pages/index.html';
}

function getUserInfo() {
    const userString = localStorage.getItem('user');
    return userString ? JSON.parse(userString) : null;
}