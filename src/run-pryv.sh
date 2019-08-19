#!/bin/bash

echo "launching"
pushd ../config-rec.la/pryv.io/single\ node/
docker-compose -f pryv.yml up -d
popd