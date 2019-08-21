#!/bin/bash
set -e

echo "cd ../../../" > "$1"
echo "./run-pryv" > "$1"
echo "exit" > "$1" # leave the tail -f
