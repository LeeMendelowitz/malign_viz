#!/bin/bash
gunicorn -w 2 run_server:app -b 127.0.0.1:8001