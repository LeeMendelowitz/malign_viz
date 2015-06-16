#!/bin/bash
LOG_DIR=/data/logs
DB_PATH=/data/mongodb
APP_DIR=/app
GUNICORN_PID=

export MALIGN_VIZ_DB_NAME="malign_viz"
export MALIGN_VIZ_UPLOAD_DIR="/data/uploads"

cd $APP_DIR

# stop service and clean up here
function cleanup(){
  echo "------------------------------------------------------"
  echo "stopping mongodb"
  mongod --smallfiles \
    --noauth \
    --shutdown \
    --dbpath $DB_PATH \
    --logpath $LOG_DIR/mongod.log

  echo "stopping nginx"
  nginx -s stop

  # NOTE: CTRL+C gets sent to the wait command, which will stop interrupt.
  # But "docker stop malign_viz" does not signal gunicorn, so we may 
  # need to kill it here
  echo "stopping gunicorn"
  kill $GUNICORN_PID &> /dev/null
  exit 0
}


trap cleanup HUP INT QUIT KILL TERM



mkdir -p $LOG_DIR $DB_PATH

echo "--------------------------------------------------------"
echo "1. STARTING MONGODB"
# Start MongoDB
mongod --smallfiles \
  --noauth \
  --fork \
  --dbpath $DB_PATH \
  --logpath $LOG_DIR/mongod.log

# Start Nginx
echo "--------------------------------------------------------"
echo "2. STARTING NGINX"
nginx

# # Wait for nginx
# until nc -z localhost 80
# do
#     echo 'Waiting for nginx...'
#     sleep 1
# done


# # Wait for mongodb to start
# until nc -z localhost 27017
# do
#     echo 'Waiting for mongodb...'
#     sleep 1
# done

# Start gunicorn
echo "--------------------------------------------------------"
echo "3. STARTING GUNICORN"
gunicorn -w 2 run_server:app -b 127.0.0.1:8001 -t 180 1>$LOG_DIR/gunicorn.stdout 2>$LOG_DIR/gunicorn.stderr &
GUNICORN_PID=$!

echo "GUNICORN PID: $GUNICORN_PID"

echo "--------------------------------------------------------"
echo "4. COOL BEANS! MalignViz is running."
echo -e "\nOpen browser to: http://localhost:(container_port) or http:/(boot2docker ip):(container_port)"
echo -e "\nTo quit: <CTRL> + C"

# Wait for Gunicorn to exit. CTRL+C at this point will kill Gunicorn.
wait


exit 0