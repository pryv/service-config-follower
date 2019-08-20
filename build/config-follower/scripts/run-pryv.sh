#!/bin/bash

echo "launching"
pushd ../config-rec.la/pryv.io/single\ node/
docker stop $(docker ps -a -q)
docker-compose -f pryv.yml up -d
popd