const child_process = require('child_process');
const fs = require('fs');

module.exports.COMPOSE_FILE_LOCATION = '/app/pryv/pryv.yml';

module.exports.stopContainers = (service) => {
  if (service == null) {
    child_process.execSync(`sudo docker-compose -f ${this.COMPOSE_FILE_LOCATION} down`);
  } else {
    child_process.execSync(`sudo docker stop ${service}`);
  }
};

module.exports.startContainers = () => {
  child_process.execSync(`sudo docker-compose -f ${this.COMPOSE_FILE_LOCATION} up -d`);
};

module.exports.restartPryvContainers = (services) => {
  if (fs.existsSync(this.COMPOSE_FILE_LOCATION)) {
    try {
      if (services == null) {
        this.stopContainers();
      } else {
        for (let service of services) {
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
  const list_container = child_process.execSync(
    `docker container ls -f "name=${service}" -q`
  );
  return list_container.length > 0;
};
