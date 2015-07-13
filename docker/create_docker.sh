#!/bin/bash
WD=$(pwd)
APP_DIR=$(cd ..; pwd)
echo $APP_DIR
docker create \
    -P \
    -v $WD/entrypoint.sh:/entrypoint.sh:ro \
    -v $APP_DIR:/app:ro \
    -v $WD/nginx_config_docker:/etc/nginx/sites-available/default:ro \
    --name malign_viz \
    malign_viz:0.0.2
