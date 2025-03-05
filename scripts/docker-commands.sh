#!/bin/bash
# Script pour gérer les bases de données via Docker

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction pour démarrer les conteneurs
start_containers() {
    echo -e "${BLUE}Démarrage des conteneurs MySQL et MongoDB...${NC}"
    docker-compose up -d mysql mongodb
    echo -e "${GREEN}Conteneurs démarrés avec succès!${NC}"
}

# Fonction pour arrêter les conteneurs
stop_containers() {
    echo -e "${BLUE}Arrêt des conteneurs...${NC}"
    docker-compose down
    echo -e "${GREEN}Conteneurs arrêtés avec succès!${NC}"
}

# Fonction pour initialiser MongoDB
init_mongodb() {
    echo -e "${BLUE}Initialisation de MongoDB...${NC}"
    # Attendre que MongoDB soit prêt
    sleep 5
    docker exec -i promanage-mongodb mongosh < scripts/setup-mongodb.js
    echo -e "${GREEN}MongoDB initialisé avec succès!${NC}"
}

# Fonction pour se connecter à MySQL
connect_mysql() {
    echo -e "${BLUE}Connexion à MySQL...${NC}"
    docker exec -it promanage-mysql mysql -upromanage_user -ppassword promanage
}

# Fonction pour se connecter à MongoDB
connect_mongodb() {
    echo -e "${BLUE}Connexion à MongoDB...${NC}"
    docker exec -it promanage-mongodb mongosh promanage-logs
}

# Vérifier les arguments
case "$1" in
    start)
        start_containers
        ;;
    stop)
        stop_containers
        ;;
    init-mongo)
        init_mongodb
        ;;
    mysql)
        connect_mysql
        ;;
    mongo)
        connect_mongodb
        ;;
    all)
        start_containers
        init_mongodb
        ;;
    *)
        echo -e "${RED}Usage: $0 {start|stop|init-mongo|mysql|mongo|all}${NC}"
        exit 1
        ;;
esac

exit 0