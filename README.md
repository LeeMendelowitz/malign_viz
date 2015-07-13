# MalignViz

MalignViz is a tool for visualizing multiple alignment candidates
for a query against a reference using malignerDP.
    
Maligner is a 'Dockerized' web application which can be run using the Docker
daemon on Linux, Mac OS X, Windows, and other platforms.

## Installation

First, you need to install Docker.

### Building the Docker image.

Execute the `build_docker.sh` script to build the MalignViz Docker image. Note: You must first
change into the repository working directory.

```bash
# Build the docker image
cd REPO_DIR/docker
./build_docker.sh 
```

This will install all MalignViz dependencies inside of a Docker container
based off of Ubuntu 14.04. This may take some time.

### Create the Docker Container

Execute the `create_docker.sh` script to create a MalignViz Docker container. Note: You
must first change into the repository working directory.

```bash
cd REPO_DIR/docker
./create_docker.sh
```

### Starting the Docker Container

Execute the `start_docker.sh` script to start the MalignViz Docker container.

```bash
REPO_DIR/docker/start_docker.sh
```

### Open MalignViz in your browser

To see what port the MalignViz webserver is exposed on, use `docker port`:

```bash
docker port malign_viz
```

which outputs:

```
27017/tcp -> 0.0.0.0:32860
80/tcp -> 0.0.0.0:32861
```

This indicates that you should open your browser to: `http://localhost:32861`.

Note: If you are using `boot2docker` on Windows or Mac OS X, then instead of `localhost` you should
use the IP address of the `boot2docker` VM, which you can determine using the command `boot2docker ip`. 

### Stopping MalignViz

To stop MalignViz, type `CTRL + C` in the terminal running MalignViz, or
execute `docker stop malign_viz` in a separate terminal.
