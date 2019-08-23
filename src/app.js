// @flow
const logger = require('./utils/logging').getLogger('app');
const child_process = require('child_process');
const request = require('superagent');
const url = require('url');
const fs = require('fs-extra'); // fs.mkdir doesn't include "recursive" option in node < 10 // See https://github.com/nodejs/node/issues/24698
const path = require('path');
const settings = require('./settings');

async function run() {
  const regUrlPath = settings.get('services:config_leader:url');
  const configPath = settings.get('configPath');
  const machines = settings.get('machines');

  try {
    let machine;
    for (machine of machines) { // We can parallelize by using machines.forEach(async () => {
      const fileList = await getMachineFileList(machine, regUrlPath);
      await createFiles(fileList, regUrlPath, configPath, machine.name);
    } //);

    startPryv();
  } catch (error) {
    logger.error(error);
  }
}

async function getMachineFileList(machine: Object, regUrlPath: string): Promise<Object> {
  logger.debug('Retrieving file list of machine ' + machine.name);
  if(!regUrlPath) {
    throw new Error('Parameter "services.config_leader.url" is undefined, set it in the configuration to allow service-config-follower to fetch other services configuration');
  }

  const regUrl = url.resolve(regUrlPath, 'conf');
  let res;
  try {
    res = await request
      .get(regUrl)
      .set('Authorization', machine.key);
  } catch (error) {
    throw new Error('Unable to retrieve file list from config_leader on URL: ' + regUrl + ' Error:' + error); // TODO let the throw here to enhance the log ? Or let the upper try/catch handle that ?
  }

  return res.body.files;
}

async function createFiles(fileList: Array<Object>, regUrlPath: string, configPath: string, machineName: string) {
  if(!Array.isArray(fileList)) {
    throw new Error('File list is not an array. ' + fileList);
  }

  let file;
  for (file of fileList) {
    const fullPath = path.resolve(path.join(configPath, machineName, file.path));
    const directoryPath = path.dirname(fullPath);

    // Create directory structure if it doesn't exist
    if(!fs.existsSync(directoryPath)) {
      fs.mkdirpSync(directoryPath, {recursive: true});
    }

    // Write the file
    fs.writeFileSync(fullPath, file.content, { encoding: 'utf8' });
  }
}

function startPryv() {
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
  logger.info('if the application is stuck here, consume the pipe (tail -f "$mypipe" | sh)');
  child_process.spawn(runPryvPath, [pipePath]);
}

run();
