document.getElementById("loginForm").addEventListener("submit", function(event) {
    event.preventDefault(); // Empêche la soumission du formulaire

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    // Vérifier les informations de connexion
    if (email === "root@gmail.com" && password === "root") {
        alert("Connexion réussie !");
        
        // Créer un utilisateur temporaire pour cette session
        const currentUser = { name: "root", email: "root@gmail.com", role: "Chef de projet" };

        // Ajouter cet utilisateur en session, sans utiliser localStorage
        window.currentUser = currentUser;

        window.location.href = "dashboard.html"; // Rediriger vers le tableau de bord
    } else {
        alert("Email ou mot de passe incorrect !");
    }
});

document.getElementById("registerForm").addEventListener("submit", function(event) {
    event.preventDefault(); // Empêche la soumission du formulaire

    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const role = document.getElementById("role").value;

    // Pas de vérification d'email déjà utilisé avec localStorage, car on ne l'utilise pas ici
    // Créer un nouvel utilisateur temporaire
    const newUser = { name, email, password, role };

    // Affichage dans la console (tu peux enregistrer ces utilisateurs dans un back-end plus tard)
    console.log("Nouvel utilisateur créé : ", newUser);

    alert("Inscription réussie ! Vous pouvez maintenant vous connecter.");
    window.location.href = "index.html"; // Redirige vers la page de connexion
});
