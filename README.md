# MalignViz

MalignViz is a tool for visualizing multiple alignment candidates
for a query against a reference using malignerDP.

## Installation

Maligner is a 'Dockerized' web application which can be run using the Docker
daemon.

First, you need to install Docker.

### Building the Docker image.

Execute this script to build the MalignViz Docker image:

```bash
# Build the docker image
./build_docker.sh 
```

### Creating & Running the Docker Container.

Execute this script to create and run a MalignViz Docker container:

```bash
./run_docker.sh
```

To stop MalignViz, type `CTRL + C` in the terminal running MalignViz, or
execute `docker stop malign_viz` in a separate terminal.

To start MalignViz again, run the existing Docker container:

```bash
docker start malign_viz
```
