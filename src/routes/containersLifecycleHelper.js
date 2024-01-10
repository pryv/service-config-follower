/**
 * @license
 * Copyright (C) 2019–2024 Pryv S.A. https://pryv.com - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */
const childProcess = require('child_process');
const fs = require('fs');
const yaml = require('js-yaml');

module.exports.COMPOSE_FILE_LOCATION = '/app/pryv/pryv.yml';

let dockerCompose;
try {
  dockerCompose = yaml.safeLoad(fs.readFileSync(this.COMPOSE_FILE_LOCATION, 'utf8'));
} catch (e) {
  if (process.env.NODE_ENV !== 'test') {
    console.error(`containersLifecycleHelper cannot load docker-compose file from ${this.COMPOSE_FILE_LOCATION}`);
    console.error(e);
  }
}

module.exports.stopContainers = (service) => {
  if (service == null) {
    childProcess.execSync(`sudo docker-compose -f ${this.COMPOSE_FILE_LOCATION} down`);
  } else {
    childProcess.execSync(`sudo docker-compose -f ${this.COMPOSE_FILE_LOCATION} stop ${service}`);
  }
};

module.exports.startContainers = () => {
  childProcess.execSync(`sudo docker-compose -f ${this.COMPOSE_FILE_LOCATION} up -d`);
};

module.exports.restartPryvContainers = (services) => {
  if (fs.existsSync(this.COMPOSE_FILE_LOCATION)) {
    try {
      if (services == null) {
        this.stopContainers();
      } else {
        for (const service of services) {
          if (this.isContainer(service)) {
            this.stopContainers(service);
          }
        }
      }
    } catch (e) {
      console.error('Error during stopping containers', e);
    }
    try {
      this.startContainers();
    } catch (e) {
      console.error('Error during starting containers', e);
    }
  } else {
    console.error(`Docker compose file: ${this.COMPOSE_FILE_LOCATION} does not exist`);
  }
};
module.exports.isContainer = (service) => {
  return Object.keys(dockerCompose.services).includes(service);
};
