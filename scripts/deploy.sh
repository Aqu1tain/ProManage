#!/bin/bash

echo "Déploiement sur l'environnement de test..."

# Variables
DEPLOY_DIR="./deploy"

# Créer le répertoire de déploiement s'il n'existe pas
mkdir -p $DEPLOY_DIR

# Copier les fichiers backend
echo "Copie des fichiers backend..."
mkdir -p $DEPLOY_DIR/backend
cp -r backend/* $DEPLOY_DIR/backend/
cp .env $DEPLOY_DIR/

# Copier les fichiers frontend
echo "Copie des fichiers frontend..."
mkdir -p $DEPLOY_DIR/frontend
cp -r frontend/* $DEPLOY_DIR/frontend/

echo "Déploiement terminé! Les fichiers sont dans le dossier $DEPLOY_DIR"