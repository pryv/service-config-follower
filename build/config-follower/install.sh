#!/bin/bash
set -e
source /pd_build/buildconfig

# Install the application.
run /pd_build/release.sh

# Remove cron and sshd entirely, unless we use them
run rm -r /etc/service/cron
run rm -r /etc/service/sshd && rm /etc/my_init.d/00_regen_ssh_host_keys.sh

# Docker compose inside the container
# Dependencies
run apt-get update
run apt-get install -y sudo curl python-dev libffi-dev gcc libc-dev make
# Docker-compose download and preparation
run sudo curl -L "https://github.com/docker/compose/releases/download/1.26.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
run sudo chmod +x /usr/local/bin/docker-compose
run sudo ln -s /usr/local/bin/docker-compose /usr/bin/docker-compose
# To disable password prompt for sudo
echo "app ALL = NOPASSWD: /usr/local/bin/docker-compose, /usr/bin/docker-compose" > /etc/sudoers.d/docker-compose

# Clean up after ourselves.
run /pd_build/finalize.sh
