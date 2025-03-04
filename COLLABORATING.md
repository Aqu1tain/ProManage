# Guide de collaboration sur GitHub

Ce document explique comment nous allons travailler ensemble sur le projet ProManage en utilisant GitHub.

## 🚀 Pour commencer

### 1. Cloner le repository

```bash
git clone https://github.com/Aqu1tain/ProManage.git
cd ProManage
```

### 2. Installer les dépendances

Suivez les instructions dans le README.md pour installer les dépendances du projet.

## 🌿 Organisation des branches

Nous utiliserons l'organisation suivante :

- **main** : code stable et prêt à être déployé
- **develop** : branche principale de développement
- **feature/xxx** : pour développer de nouvelles fonctionnalités
- **fix/xxx** : pour corriger des bugs

## 📝 Guide étape par étape

### Pour créer une nouvelle fonctionnalité

1. **Mettez-vous à jour avec la dernière version**
   ```bash
   git checkout develop
   git pull origin develop
   ```

2. **Créez votre branche de fonctionnalité**
   ```bash
   git checkout -b feature/ma-nouvelle-fonctionnalite
   ```
   Exemple : `feature/formulaire-connexion` ou `feature/creation-projet`

3. **Travaillez sur votre code**
   
4. **Enregistrez vos modifications régulièrement**
   ```bash
   git add .
   git commit -m "feat: description de ce que vous avez fait"
   ```

5. **Envoyez votre branche sur GitHub**
   ```bash
   git push origin feature/ma-nouvelle-fonctionnalite
   ```

6. **Créez une Pull Request** sur GitHub
   - Allez sur GitHub
   - Cliquez sur "Pull Requests" puis "New Pull Request"
   - Sélectionnez votre branche comme source et `develop` comme destination
   - Décrivez vos changements et assignez un membre pour la revue

### Pour corriger un bug

Suivez les mêmes étapes mais nommez votre branche `fix/description-du-bug`.

## 📋 Convention de commit

Pour que tout soit clair, utilisez ces préfixes dans vos messages de commit :

- **feat:** pour une nouvelle fonctionnalité
- **fix:** pour la correction d'un bug
- **docs:** pour la documentation
- **style:** pour les changements de style (CSS, formatage)
- **refactor:** pour une amélioration du code sans ajout de fonctionnalité
- **test:** pour ajouter des tests

Exemple : `feat: ajout du formulaire d'inscription`

## 🔄 Mise à jour de votre branche

Si la branche `develop` a été mise à jour pendant que vous travailliez :

```bash
# Sauvegardez votre travail en cours
git commit -m "WIP: description de ce sur quoi vous travaillez"

# Récupérez les dernières modifications
git checkout develop
git pull origin develop

# Revenez à votre branche
git checkout feature/votre-fonctionnalite

# Fusionnez les changements de develop
git merge develop
```

## ⚠️ En cas de conflit

Si vous avez un conflit :

1. Ouvrez les fichiers marqués comme conflictuels
2. Vous verrez des sections comme :
   ```
   <<<<<<< HEAD
   Votre code
   =======
   Le code de la branche develop
   >>>>>>> develop
   ```
3. Choisissez le code à garder en supprimant les marqueurs et le code non désiré
4. Enregistrez le fichier
5. Ajoutez les fichiers résolus
   ```bash
   git add [fichiers-resolus]
   ```
6. Terminez la fusion
   ```bash
   git commit -m "fix: résolution des conflits"
   ```

## 🚫 À ne pas faire

- **Ne commitez jamais directement sur `main` ou `develop`**
- **Ne poussez pas de code qui ne fonctionne pas**
- **Ne commitez pas de fichiers contenant des mots de passe ou clés API**

## 📱 Communication

- Annoncez dans le chat quand vous commencez à travailler sur une fonctionnalité
- Demandez de l'aide si vous êtes bloqué plus de 30 minutes
- Faites une démo rapide de vos fonctionnalités lors des points quotidiens

---

En cas de doute, n'hésitez pas à demander de l'aide à Akitain (responsable infrastructure) ou à tout autre membre de l'équipe.