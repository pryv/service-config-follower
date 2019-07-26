// @flow
const Service = require('./service');
const logger = require('./utils/logging').getLogger('app');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'; // TODO delete. C'est pour bypasser le certificat SSL expiré

(async ()=>{
  const services = ['core', 'register']; // TODO

  try {
    for (const service of services) { // We can parallelize by using services.forEach(async () => {
      await new Service(service).process();
    }

    logger.debug('\n\nfinished');
  } catch (error) {
    logger.error(error);
  }
})();




