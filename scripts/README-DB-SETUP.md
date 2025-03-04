# Guide de configuration des bases de données

Ce guide explique comment configurer MySQL et MongoDB pour le projet ProManage.

## Configuration de MySQL

### Installer MySQL

#### Sur Windows
1. Téléchargez et installez MySQL depuis le [site officiel](https://dev.mysql.com/downloads/installer/)
2. Suivez les instructions d'installation
3. Assurez-vous de définir un mot de passe pour l'utilisateur root

#### Sur macOS
```bash
brew install mysql
brew services start mysql
```

#### Sur Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install mysql-server
sudo systemctl start mysql
sudo mysql_secure_installation
```

### Configurer la base de données

1. Connectez-vous à MySQL:
```bash
mysql -u root -p
```

2. Exécutez le script de configuration:
```bash
mysql -u root -p < scripts/setup-mysql.sql
```

Ou copiez-collez le contenu du script directement dans la console MySQL.

## Configuration de MongoDB

### Installer MongoDB

#### Sur Windows
1. Téléchargez et installez MongoDB Community Edition depuis le [site officiel](https://www.mongodb.com/try/download/community)
2. Suivez les instructions d'installation

#### Sur macOS
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

#### Sur Linux (Ubuntu/Debian)
```bash
# Importer la clé publique
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -

# Créer un fichier liste pour MongoDB
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# Installer MongoDB
sudo apt update
sudo apt install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod
```

### Configurer la base de données

1. Connectez-vous à MongoDB:
```bash
mongosh
```

2. Exécutez le script de configuration:
```bash
load("scripts/setup-mongodb.js")
```

Ou copiez-collez le contenu du script directement dans la console MongoDB.

## Configuration du fichier .env

Après avoir configuré les bases de données, mettez à jour votre fichier `.env`:

```
# Base de données MySQL
DB_HOST=localhost
DB_PORT=3306
DB_NAME=promanage
DB_USER=promanage_user  # ou root pour le développement
DB_PASSWORD=password    # votre mot de passe

# MongoDB pour les logs
MONGO_URI=mongodb://localhost:27017/promanage-logs
```

## Vérification

Pour vérifier que tout est correctement configuré:

1. Lancez le serveur avec `npm run dev`
2. Consultez les logs pour confirmer que les connexions aux bases de données sont établies