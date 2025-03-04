document.getElementById("loginForm").addEventListener("submit", function(event) {
    event.preventDefault(); // Empêche la soumission du formulaire

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    // Simuler une vérification avec localStorage
    const users = JSON.parse(localStorage.getItem("users")) || [];
    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
        alert("Connexion réussie !");
        window.location.href = "dashboard.html"; // Redirection vers le tableau de bord
    } else {
        alert("Email ou mot de passe incorrect !");
    }
});
