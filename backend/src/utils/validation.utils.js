const Joi = require('joi');
const { ValidationError } = require('./error.utils');

/**
 * Middleware de validation générique
 * @param {Object} schema - Schéma Joi pour valider les données
 * @param {string} source - Source des données à valider ('body', 'query', 'params')
 * @returns {Function} Middleware Express
 */
exports.validate = (schema, source = 'body') => {
  return (req, res, next) => {
    const data = req[source];
    const { error, value } = schema.validate(data, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return next(new ValidationError(errors));
    }

    // Mettre à jour les données validées
    req[source] = value;
    next();
  };
};

// Schémas de validation pour l'authentification
exports.authSchemas = {
  register: Joi.object({
    name: Joi.string().min(3).max(50).required()
      .messages({
        'string.min': 'Le nom doit contenir au moins 3 caractères',
        'string.max': 'Le nom ne peut pas dépasser 50 caractères',
        'any.required': 'Le nom est requis'
      }),
    email: Joi.string().email().required()
      .messages({
        'string.email': 'Veuillez fournir une adresse email valide',
        'any.required': 'L\'email est requis'
      }),
    password: Joi.string().min(8).required()
      .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)'))
      .messages({
        'string.min': 'Le mot de passe doit contenir au moins 8 caractères',
        'string.pattern.base': 'Le mot de passe doit contenir au moins une lettre majuscule, une lettre minuscule et un chiffre',
        'any.required': 'Le mot de passe est requis'
      }),
    role: Joi.string().valid('admin', 'project_manager', 'contributor').default('contributor')
      .messages({
        'any.only': 'Le rôle doit être admin, project_manager ou contributor'
      }),
    team_name: Joi.string().when('role', {
      is: 'project_manager',
      then: Joi.string().min(3).max(50).required()
        .messages({
          'string.min': 'Le nom d\'équipe doit contenir au moins 3 caractères',
          'string.max': 'Le nom d\'équipe ne peut pas dépasser 50 caractères',
          'any.required': 'Le nom d\'équipe est requis pour un chef de projet'
        })
    })
  }),

  join: Joi.object({
    name: Joi.string().min(3).max(50).required()
      .messages({
        'string.min': 'Le nom doit contenir au moins 3 caractères',
        'string.max': 'Le nom ne peut pas dépasser 50 caractères',
        'any.required': 'Le nom est requis'
      }),
    email: Joi.string().email().required()
      .messages({
        'string.email': 'Veuillez fournir une adresse email valide',
        'any.required': 'L\'email est requis'
      }),
    password: Joi.string().min(8).required()
      .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)'))
      .messages({
        'string.min': 'Le mot de passe doit contenir au moins 8 caractères',
        'string.pattern.base': 'Le mot de passe doit contenir au moins une lettre majuscule, une lettre minuscule et un chiffre',
        'any.required': 'Le mot de passe est requis'
      }),
    invitation_key: Joi.string().required()
      .messages({
        'any.required': 'La clé d\'invitation est requise'
      })
  }),

  login: Joi.object({
    email: Joi.string().email().required()
      .messages({
        'string.email': 'Veuillez fournir une adresse email valide',
        'any.required': 'L\'email est requis'
      }),
    password: Joi.string().required()
      .messages({
        'any.required': 'Le mot de passe est requis'
      })
  })
};

// Schémas de validation pour les projets
exports.projectSchemas = {
  create: Joi.object({
    name: Joi.string().min(3).max(100).required()
      .messages({
        'string.min': 'Le nom du projet doit contenir au moins 3 caractères',
        'string.max': 'Le nom du projet ne peut pas dépasser 100 caractères',
        'any.required': 'Le nom du projet est requis'
      }),
    description: Joi.string().max(1000)
      .messages({
        'string.max': 'La description ne peut pas dépasser 1000 caractères'
      }),
    team_id: Joi.string().uuid().required()
      .messages({
        'string.guid': 'L\'ID de l\'équipe doit être un UUID valide',
        'any.required': 'L\'ID de l\'équipe est requis'
      })
  }),

  update: Joi.object({
    name: Joi.string().min(3).max(100)
      .messages({
        'string.min': 'Le nom du projet doit contenir au moins 3 caractères',
        'string.max': 'Le nom du projet ne peut pas dépasser 100 caractères'
      }),
    description: Joi.string().max(1000)
      .messages({
        'string.max': 'La description ne peut pas dépasser 1000 caractères'
      }),
    status: Joi.string().valid('active', 'archived')
      .messages({
        'any.only': 'Le statut doit être active ou archived'
      })
  })
};

// Schémas de validation pour les tâches
exports.taskSchemas = {
  create: Joi.object({
    title: Joi.string().min(3).max(100).required()
      .messages({
        'string.min': 'Le titre de la tâche doit contenir au moins 3 caractères',
        'string.max': 'Le titre de la tâche ne peut pas dépasser 100 caractères',
        'any.required': 'Le titre de la tâche est requis'
      }),
    description: Joi.string().max(1000)
      .messages({
        'string.max': 'La description ne peut pas dépasser 1000 caractères'
      }),
    project_id: Joi.string().uuid().required()
      .messages({
        'string.guid': 'L\'ID du projet doit être un UUID valide',
        'any.required': 'L\'ID du projet est requis'
      }),
    assigned_to: Joi.string().uuid()
      .messages({
        'string.guid': 'L\'ID de l\'utilisateur assigné doit être un UUID valide'
      }),
    deadline: Joi.date().greater('now')
      .messages({
        'date.greater': 'La date d\'échéance doit être future'
      }),
    priority: Joi.string().valid('low', 'medium', 'high').default('medium')
      .messages({
        'any.only': 'La priorité doit être low, medium ou high'
      }),
    tags: Joi.array().items(Joi.string())
      .messages({
        'array.base': 'Les tags doivent être un tableau de chaînes'
      })
  }),

  update: Joi.object({
    title: Joi.string().min(3).max(100)
      .messages({
        'string.min': 'Le titre de la tâche doit contenir au moins 3 caractères',
        'string.max': 'Le titre de la tâche ne peut pas dépasser 100 caractères'
      }),
    description: Joi.string().max(1000)
      .messages({
        'string.max': 'La description ne peut pas dépasser 1000 caractères'
      }),
    assigned_to: Joi.string().uuid()
      .messages({
        'string.guid': 'L\'ID de l\'utilisateur assigné doit être un UUID valide'
      }),
    deadline: Joi.date().greater('now')
      .messages({
        'date.greater': 'La date d\'échéance doit être future'
      }),
    priority: Joi.string().valid('low', 'medium', 'high')
      .messages({
        'any.only': 'La priorité doit être low, medium ou high'
      }),
    tags: Joi.array().items(Joi.string())
      .messages({
        'array.base': 'Les tags doivent être un tableau de chaînes'
      })
  }),

  status: Joi.object({
    status: Joi.string().valid('todo', 'in_progress', 'done').required()
      .messages({
        'any.only': 'Le statut doit être todo, in_progress ou done',
        'any.required': 'Le statut est requis'
      })
  })
};

// Schémas de validation pour les commentaires
exports.commentSchemas = {
  create: Joi.object({
    content: Joi.string().min(1).max(500).required()
      .messages({
        'string.min': 'Le commentaire ne peut pas être vide',
        'string.max': 'Le commentaire ne peut pas dépasser 500 caractères',
        'any.required': 'Le contenu du commentaire est requis'
      }),
    task_id: Joi.string().uuid().required()
      .messages({
        'string.guid': 'L\'ID de la tâche doit être un UUID valide',
        'any.required': 'L\'ID de la tâche est requis'
      })
  })
};

// Schémas de validation pour les équipes
exports.teamSchemas = {
  create: Joi.object({
    name: Joi.string().min(3).max(50).required()
      .messages({
        'string.min': 'Le nom d\'équipe doit contenir au moins 3 caractères',
        'string.max': 'Le nom d\'équipe ne peut pas dépasser 50 caractères',
        'any.required': 'Le nom d\'équipe est requis'
      }),
    description: Joi.string().max(500)
      .messages({
        'string.max': 'La description ne peut pas dépasser 500 caractères'
      })
  }),

  update: Joi.object({
    name: Joi.string().min(3).max(50)
      .messages({
        'string.min': 'Le nom d\'équipe doit contenir au moins 3 caractères',
        'string.max': 'Le nom d\'équipe ne peut pas dépasser 50 caractères'
      }),
    description: Joi.string().max(500)
      .messages({
        'string.max': 'La description ne peut pas dépasser 500 caractères'
      })
  })
};