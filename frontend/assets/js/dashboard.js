document.addEventListener('DOMContentLoaded', () => {
    // Vérifier si l'utilisateur est connecté
    if (!isLoggedIn()) {
        window.location.href = 'index.html';
        return;
    }

    // Récupérer les informations de l'utilisateur
    const user = getUserInfo();
    const welcomeMessage = document.getElementById('welcomeMessage');
    const createProjectBtn = document.getElementById('createProjectBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const projectList = document.getElementById('projectList');

    // Mettre à jour le message de bienvenue
    if (user) {
        welcomeMessage.textContent = `Bienvenue, ${user.username}`;
        
        // Afficher le bouton de création de projet uniquement pour les chefs de projet
        if (user.role === 'chef_de_projet') {
            createProjectBtn.style.display = 'inline-block';
        }
    }

    // Gérer la déconnexion
    logoutBtn.addEventListener('click', () => {
        logout();
    });

    // Pour l'instant, afficher des projets d'exemple
    // À remplacer par un appel API
    const exampleProjects = [
        { id: 1, name: 'Projet A', description: 'Description du projet A' },
        { id: 2, name: 'Projet B', description: 'Description du projet B' }
    ];

    exampleProjects.forEach(project => {
        const li = document.createElement('li');
        li.innerHTML = `
            <h3>${project.name}</h3>
            <p>${project.description}</p>
            <button class="view-project-btn" data-id="${project.id}">Voir le projet</button>
        `;
        projectList.appendChild(li);
    });
});