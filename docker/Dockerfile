FROM ubuntu:14.04
MAINTAINER Lee Mendelowitz <Lee.Mendelowitz@gmail.com>

ENV DEBIAN_FRONTEND noninteractive

#############################
# Install MongoDB

RUN apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 7F0CEB10
RUN echo 'deb http://downloads-distro.mongodb.org/repo/ubuntu-upstart dist 10gen' | sudo tee /etc/apt/sources.list.d/mongodb.list
RUN apt-get update && apt-get install -y mongodb-org

#############################
# Install nginx

RUN apt-get update && apt-get install -y nginx

#############################
# Install python
RUN apt-get update && apt-get install -y python python-dev wget

# Add the get-pip.py script and install it

RUN rm -f /get-pip.py; wget https://bootstrap.pypa.io/get-pip.py -O /get-pip.py
RUN python /get-pip.py
COPY requirements.txt /requirements.txt
RUN pip install -r /requirements.txt

#############################
# Add a persisted data volume

VOLUME /data
RUN mkdir -p /data/logs /data/mongodb

#############################
# Move the Nginx configure file to the container
COPY nginx_config_docker /etc/nginx/sites-available/default

#############################
# Expose Ports

EXPOSE 80
EXPOSE 27017

#############################
# Define the Entrypoint

COPY entrypoint.sh /entrypoint.sh
WORKDIR /app
ENTRYPOINT ["/entrypoint.sh"]


#############################
# Done :-)
