#!/bin/bash
WD=$(pwd)
docker run \
    --rm \
    -ti \
    -P \
    -v $WD:/app \
    --name malign_viz_temp \
    --entrypoint /bin/bash \
    malign_viz:0.0
