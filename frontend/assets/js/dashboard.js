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
      welcomeMessage.textContent = `Bienvenue, ${user.name || 'Utilisateur'}`;
      
      // Afficher le bouton de création de projet uniquement pour les chefs de projet
      if (user.role === 'project_manager') {
        createProjectBtn.style.display = 'inline-block';
      }
      
      console.log('Informations utilisateur:', user);
    }
  
    // Gérer la déconnexion
    logoutBtn.addEventListener('click', () => {
      logout();
    });
  
    // Charger les projets depuis l'API
    loadProjects();
  });
  
  // Fonction pour charger les projets
  async function loadProjects() {
    try {
      const projectList = document.getElementById('projectList');
      
      // Pour le moment, afficher des projets d'exemple
      // À remplacer par l'appel API ci-dessous une fois implémenté
      const exampleProjects = [
        { id: 1, name: 'Projet A', description: 'Description du projet A' },
        { id: 2, name: 'Projet B', description: 'Description du projet B' }
      ];
  
      /*
      // Code pour récupérer les projets depuis l'API (à activer plus tard)
      const response = await authenticatedFetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PROJECTS}`);
      const data = await response.json();
      
      if (response.ok && data.status === 'success') {
        const projects = data.data.projects || [];
        displayProjects(projects);
      } else {
        console.error('Erreur lors du chargement des projets:', data.message);
        projectList.innerHTML = '<li class="error">Impossible de charger les projets</li>';
      }
      */
      
      // Afficher les projets d'exemple pour le moment
      displayProjects(exampleProjects);
      
    } catch (error) {
      console.error('Erreur lors du chargement des projets:', error);
      document.getElementById('projectList').innerHTML = 
        '<li class="error">Erreur lors du chargement des projets</li>';
    }
  }
  
  // Fonction pour afficher la liste des projets
  function displayProjects(projects) {
    const projectList = document.getElementById('projectList');
    projectList.innerHTML = '';
    
    if (projects.length === 0) {
      projectList.innerHTML = '<li>Aucun projet disponible</li>';
      return;
    }
    
    projects.forEach(project => {
      const li = document.createElement('li');
      li.innerHTML = `
        <h3>${project.name}</h3>
        <p>${project.description}</p>
        <button class="view-project-btn" data-id="${project.id}">Voir le projet</button>
      `;
      projectList.appendChild(li);
    });
    
    // Ajouter les écouteurs d'événements sur les boutons
    document.querySelectorAll('.view-project-btn').forEach(button => {
      button.addEventListener('click', (e) => {
        const projectId = e.target.getAttribute('data-id');
        // Rediriger vers la page du projet (à implémenter plus tard)
        console.log(`Afficher le projet ${projectId}`);
      });
    });
  }