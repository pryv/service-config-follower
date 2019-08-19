// @flow
const Service = require('./service');
const logger = require('./utils/logging').getLogger('app');
const nconf = require('nconf');
const child_process = require('child_process');

async function start() {
  const modules = nconf.get('modules');

  try {
    for (const module of modules) { // We can parallelize by using services.forEach(async () => {
      await new Service(module.name, module.path).process();
    } //);

    const command = '/app/scripts/run-pryv.sh';
    const result = child_process.execSync(command);
    logger.debug(result);
  } catch (error) {
    logger.error(error);
  }
}

start();
