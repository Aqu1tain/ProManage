// Configuration de l'API
const API_CONFIG = {
    BASE_URL: 'http://localhost:5000/api', // URL de base de l'API
    ENDPOINTS: {
      // Authentification
      LOGIN: '/auth/login',
      REGISTER: '/auth/register',
      JOIN: '/auth/join',
      PROFILE: '/auth/me',
      
      // Projets
      PROJECTS: '/projects',
      
      // Tâches
      TASKS: '/tasks',
    }
  };