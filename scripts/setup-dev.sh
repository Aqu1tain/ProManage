#!/bin/bash

echo "Installation des dépendances du backend..."
cd backend
npm init -y
npm install express mongoose mysql2 sequelize bcrypt jsonwebtoken dotenv cors
npm install --save-dev nodemon

echo "Configuration du package.json..."
cat > package.json << EOF
{
  "name": "promanage-backend",
  "version": "1.0.0",
  "description": "Backend pour ProManage SaaS",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "dependencies": {
    "bcrypt": "^5.1.0",
    "cors": "^2.8.5",
    "dotenv": "^16.0.3",
    "express": "^4.18.2",
    "jsonwebtoken": "^9.0.0",
    "mongoose": "^7.0.3",
    "mysql2": "^3.2.0",
    "sequelize": "^6.30.0"
  },
  "devDependencies": {
    "nodemon": "^2.0.22"
  }
}
EOF

echo "Création du fichier .env..."
cp ../.env.example .env

cd ..
echo "Setup terminé avec succès!"