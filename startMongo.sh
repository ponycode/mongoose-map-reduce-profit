#! /bin/bash
echo Forking mongod.  Note process id
mongod --dbpath ./data --logpath ./data/log.txt --pidfilepath ./data/pid.txt --fork
