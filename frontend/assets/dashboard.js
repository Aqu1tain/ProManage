// Vérifier si un utilisateur est connecté
if (!window.currentUser) {
    alert("Vous devez être connecté pour accéder au tableau de bord.");
    window.location.href = "index.html"; // Redirige vers la page de connexion
} else {
    // Afficher un message de bienvenue avec le nom et le rôle
    document.getElementById("welcomeMessage").textContent = `Bienvenue, ${window.currentUser.name} (${window.currentUser.role})`;

    // Affichage du bouton "Créer un projet" si Chef de projet
    if (window.currentUser.role === "Chef de projet") {
        document.getElementById("createProjectBtn").style.display = "block";
    }

    // Exemple de projets (en attendant la gestion réelle des projets)
    const projects = [
        { name: "Projet Alpha", owner: "Chef Pierre" },
        { name: "Projet Beta", owner: "Chef Marie" }
    ];

    // Afficher les projets dans la liste
    const projectList = document.getElementById("projectList");
    projects.forEach(project => {
        const li = document.createElement("li");
        li.textContent = `${project.name} - Géré par ${project.owner}`;
        projectList.appendChild(li);
    });

    // Déconnexion
    document.getElementById("logoutBtn").addEventListener("click", function() {
        alert("Déconnexion réussie !");
        window.location.href = "index.html"; // Rediriger vers la page de connexion après la déconnexion
    });

    // Gestion du bouton "Créer un projet"
    document.getElementById("createProjectBtn").addEventListener("click", function() {
        alert("Fonctionnalité à venir : Création de projet !");
        // Ici, on pourra rediriger vers une page de création de projet plus tard
    });
}
