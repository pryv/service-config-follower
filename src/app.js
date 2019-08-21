// @flow
const Service = require('./service');
const logger = require('./utils/logging').getLogger('app');
const settings = require('./settings');
const child_process = require('child_process');
const fs = require('fs');

async function start() {
  const modules = settings.get('modules'); // TODO get list from a route on Leader

  try {
    for (const module of modules) { // We can parallelize by using services.forEach(async () => {
      await new Service(module).process();
    } //);

    const pipePath = settings.get('pipePath');
    if(!fs.existsSync(pipePath)) {
      logger.error('pipe is not set : ' + pipePath);
      return;
    }

    const runPryvPath = settings.get('runPryvPath');
    if(!fs.existsSync(runPryvPath)) {
      logger.error('script is not set : ' + runPryvPath);
      return;
    }

    const command = runPryvPath + ' "' + pipePath + '"';
    logger.info('Starting all pryv components');
    logger.info('command : ' + command);
    logger.info('if the application is stuck here, consome the pipe (tail -f "$mypipe" | sh)');
    child_process.spawn(runPryvPath, [pipePath]);
  } catch (error) {
    logger.error(error);
  }
}

start();
