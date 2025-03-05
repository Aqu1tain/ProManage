document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const errorMessage = document.getElementById('error-message');
  
    // Si l'utilisateur est déjà connecté, le rediriger vers le tableau de bord
    if (isLoggedIn()) {
      window.location.href = 'dashboard.html';
      return;
    }
  
    loginForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      
      try {
        // Appel à l'API de connexion
        const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.LOGIN}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        
        const responseData = await response.json();
        
        if (response.ok) {
          // Accéder correctement aux données dans la structure de réponse
          if (responseData.data && responseData.data.token && responseData.data.user) {
            // Stocker le token JWT
            localStorage.setItem('token', responseData.data.token);
            // Stocker les informations de l'utilisateur
            localStorage.setItem('user', JSON.stringify(responseData.data.user));
            
            console.log('Connexion réussie', responseData.data);
            
            // Rediriger vers le tableau de bord
            window.location.href = 'dashboard.html';
          } else {
            console.error('Structure de réponse inattendue', responseData);
            errorMessage.textContent = 'Erreur de format dans la réponse du serveur';
          }
        } else {
          // Afficher le message d'erreur du serveur
          if (responseData.error && responseData.error.errors) {
            errorMessage.textContent = handleApiError(responseData.error);
          } else {
            errorMessage.textContent = responseData.message || 'Erreur lors de la connexion';
          }
        }
      } catch (error) {
        console.error('Erreur de connexion:', error);
        errorMessage.textContent = 'Une erreur est survenue. Veuillez réessayer.';
      }
    });
  });