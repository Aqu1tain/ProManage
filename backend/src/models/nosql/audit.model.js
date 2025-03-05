const mongoose = require('mongoose');

const auditSchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    default: Date.now
  },
  action: {
    type: String,
    required: true
  },
  user: {
    id: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    role: {
      type: String,
      required: true
    }
  },
  entity: {
    type: {
      type: String,
      enum: ['user', 'team', 'project', 'task', 'comment', 'system'],
      required: true
    },
    id: {
      type: String,
      required: false
    },
    name: {
      type: String,
      required: false
    }
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    required: false
  },
  ip: {
    type: String,
    required: false
  }
}, {
  timestamps: true
});

// Indexation pour améliorer les performances des requêtes
auditSchema.index({ timestamp: -1 });
auditSchema.index({ 'user.id': 1, timestamp: -1 });
auditSchema.index({ 'entity.type': 1, 'entity.id': 1, timestamp: -1 });

const AuditLog = mongoose.model('AuditLog', auditSchema);

module.exports = AuditLog;