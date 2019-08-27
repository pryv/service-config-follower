// @flow
const nconfSettings = require('./settings');
const logger = require('./utils/logging').getLogger('app');
const child_process = require('child_process');
const request = require('superagent');
const url = require('url');
const fs = require('fs-extra'); // fs.mkdir doesn't include "recursive" option in node < 10 // See https://github.com/nodejs/node/issues/24698
const path = require('path');
const express = require('express');
const middlewares = require('./middlewares');

type PryvFileList = Array<PryvFileItem>;
type PryvFileItem = {
  path: string,
  content: string
};

class Application {
  express: express$Application;
  settings: Object;

  constructor() {
    this.settings = nconfSettings;
    this.express = this.setupExpressApp();
  }

  setupExpressApp(): express$Application {
    const expressApp = express();

    expressApp.use(express.json());
    expressApp.use(middlewares.authorization(this.settings));

    require('./routes/notify')(expressApp, this.settings);

    expressApp.use(middlewares.errors);

    return expressApp;
  }

  async run() {
    const leaderUrl = this.settings.get('config-leader:url');
    const dataFolder = this.settings.get('paths:dataFolder');

    if (leaderUrl == null) {
      throw new Error('Missing setting "config-leader:url".');
    }

    if (dataFolder == null) {
      throw new Error('Missing setting "paths:dataFolder".');
    }

    const fileList = await this.getFiles(leaderUrl);

    if(! Array.isArray(fileList)) {
      throw new Error(`File list is not an array: ${fileList}`);
    }

    await this.writeFiles(fileList, dataFolder);

    this.startPryv();
  }

  async getFiles(leaderUrl: string): Promise<PryvFileList> {
    const leaderEndpoint = url.resolve(leaderUrl, 'conf');
    const auth = this.settings.get('config-leader:auth');

    const res = await request
      .get(leaderEndpoint)
      .set('Authorization', auth);

    return res.body.files;
  }

  async writeFiles(fileList: PryvFileList, dataFolder: string): Promise<void> {
    for (const file of fileList) {
      const fullPath = path.resolve(path.join(dataFolder, file.path));
      const directoryPath = path.dirname(fullPath);

      // Create directory structure if it doesn't exist
      if(! fs.existsSync(directoryPath)) {
        fs.mkdirpSync(directoryPath, {recursive: true});
      }

      // Write the file
      fs.writeFileSync(fullPath, file.content, { encoding: 'utf8' });
    }
  }

  startPryv() {
    const pipePath = this.settings.get('paths:pipe');
    const runPryvPath = this.settings.get('paths:runPryv');

    if(! fs.existsSync(pipePath)) {
      throw new Error(`Pipe does not exist: ${pipePath}.`);
    }

    if(! fs.existsSync(runPryvPath)) {
      throw new Error(`Run-pryv script does not exist: ${runPryvPath}.`);
    }

    logger.info('Starting all pryv components');
    logger.info(`command : ${runPryvPath} "${pipePath}"`);
    logger.info('if the application is stuck here, consume the pipe (tail -f "/app/scripts/mypipe" | sh)');
    child_process.spawn(runPryvPath, [pipePath]);
  }
}

module.exports = Application;
