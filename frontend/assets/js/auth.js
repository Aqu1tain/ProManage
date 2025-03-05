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
  
  // Fonction pour faire des requêtes API authentifiées
  async function authenticatedFetch(url, options = {}) {
    const token = localStorage.getItem('token');
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      defaultHeaders['Authorization'] = `Bearer ${token}`;
    }
    
    const fetchOptions = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...(options.headers || {})
      }
    };
    
    try {
      const response = await fetch(url, fetchOptions);
      
      // Si le token est invalide (401), déconnecter l'utilisateur
      if (response.status === 401) {
        logout();
        throw new Error('Session expirée, veuillez vous reconnecter');
      }
      
      return response;
    } catch (error) {
      console.error('Erreur lors de la requête API:', error);
      throw error;
    }
  }
  
  // Fonction de gestion des erreurs API
  function handleApiError(error) {
    if (error && error.errors && Array.isArray(error.errors)) {
      // Récupérer le premier message d'erreur de validation
      return error.errors[0].message;
    } else if (error.message) {
      return error.message;
    }
    return 'Une erreur est survenue. Veuillez réessayer.';
  }