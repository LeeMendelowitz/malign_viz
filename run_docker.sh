#!/bin/bash
WD=$(pwd)
docker run \
    -ti \
    -P \
    -v $WD/entrypoint.sh:/entrypoint.sh:ro \
    -v $WD:/app:ro \
    --name malign_viz \
    malign_viz:0.0
