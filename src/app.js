// @flow
const Service = require('./service');
const logger = require('./utils/logging').getLogger('app');

// process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'; // TODO delete. C'est pour bypasser le certificat SSL expiré

(async ()=>{
  const services = [
    // {name: 'core', path: '/root/production.js'},
    {name: 'core', path: '../service-core/dist/components/api-server/config/production.js'},
    {name:'register', path: '../service-register/build/register/config/register.js'}]; // TODO

  try {
    for (const service of services) { // We can parallelize by using services.forEach(async () => {
      await new Service(service.name, service.path).process();
    }

    logger.debug('\n\nfinished');
  } catch (error) {
    logger.error(error);
  }
})();




