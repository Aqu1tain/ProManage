// Configuration pour l'authentification JWT
module.exports = {
    jwtSecret: process.env.JWT_SECRET || 'your_jwt_secret_should_be_complex',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
    
    // Définition des rôles
    roles: {
      ADMIN: 'admin',
      PROJECT_MANAGER: 'project_manager',
      CONTRIBUTOR: 'contributor'
    },
    
    // Permissions par rôle (pour référence)
    permissions: {
      admin: [
        'manage_users',
        'manage_teams',
        'view_logs',
        'manage_all_projects'
      ],
      project_manager: [
        'create_projects',
        'manage_team_members',
        'assign_tasks',
        'create_tasks_for_anyone'
      ],
      contributor: [
        'view_assigned_projects',
        'create_own_tasks',
        'update_assigned_tasks',
        'comment_on_tasks'
      ]
    }
  };