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
    }
  
    // Gérer la déconnexion
    logoutBtn.addEventListener('click', () => {
      logout();
    });
  
    // Ajouter l'événement pour créer un projet
    createProjectBtn.addEventListener('click', () => {
      // Pour l'instant, afficher une boîte de dialogue simple
      const projectName = prompt('Nom du projet:');
      if (projectName) {
        const projectDescription = prompt('Description du projet:');
        createProject(projectName, projectDescription);
      }
    });
  
    // Charger les projets depuis l'API
    loadProjects();
  });
  
  // Fonction pour charger les projets
  async function loadProjects() {
    try {
      const projectList = document.getElementById('projectList');
      projectList.innerHTML = '<li>Chargement des projets...</li>';
      
      const response = await authenticatedFetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PROJECTS}`);
      const data = await response.json();
      
      console.log('Réponse API projets:', data);
      
      if (response.ok && data.status === 'success') {
        // Les projets sont directement dans data.data (tableau)
        const projects = data.data || [];
        displayProjects(projects);
      } else {
        console.error('Erreur lors du chargement des projets:', data.message);
        projectList.innerHTML = '<li class="error">Impossible de charger les projets</li>';
      }
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
      
      // Formater la date de création
      const createdDate = new Date(project.createdAt);
      const formattedDate = createdDate.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
      
      // Traduire le statut
      const statusText = project.status === 'active' ? 'Actif' : 'Archivé';
      
      li.innerHTML = `
        <h3>${project.name}</h3>
        <p>${project.description || 'Aucune description'}</p>
        <div class="project-meta">
          <span class="project-status status-${project.status}">${statusText}</span>
          <span class="project-date">Créé le ${formattedDate}</span>
        </div>
        <button class="view-project-btn" data-id="${project.id}">Voir le projet</button>
      `;
      projectList.appendChild(li);
    });
    
    // Ajouter les écouteurs d'événements sur les boutons
    document.querySelectorAll('.view-project-btn').forEach(button => {
      button.addEventListener('click', (e) => {
        const projectId = e.target.getAttribute('data-id');
        // À implémenter plus tard - naviguer vers la page du projet
        alert(`Affichage du projet ${projectId} à implémenter`);
      });
    });
  }
  
  // Fonction pour créer un nouveau projet
  async function createProject(name, description) {
    try {
      const response = await authenticatedFetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PROJECTS}`, {
        method: 'POST',
        body: JSON.stringify({
          name,
          description
        })
      });
      
      const data = await response.json();
      
      if (response.ok && data.status === 'success') {
        alert('Projet créé avec succès!');
        // Recharger la liste des projets
        loadProjects();
      } else {
        console.error('Erreur lors de la création du projet:', data);
        alert(`Erreur: ${data.message || 'Impossible de créer le projet'}`);
      }
    } catch (error) {
      console.error('Erreur lors de la création du projet:', error);
      alert('Une erreur est survenue lors de la création du projet');
    }
  }