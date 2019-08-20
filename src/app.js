// @flow
const Service = require('./service');
const logger = require('./utils/logging').getLogger('app');
const nconf = require('nconf');
const spawn = require('child_process').spawn;

async function start() {
  const modules = nconf.get('modules');

  try {
    for (const module of modules) { // We can parallelize by using services.forEach(async () => {
      await new Service(module.name, module.path).process();
    } //);

    const proc = spawn(nconf.get('run-pryv'));
    proc.stdout.on('data', function(data) {
      logger.info(data);
    });
    proc.stderr.on('data', function(data) {
      logger.error(data);
    });
    proc.on('close', function(code) {
      logger.info('process exited with code : ' + code);
    });
  } catch (error) {
    logger.error(error);
  }
}

start();
