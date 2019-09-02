// @flow
const nconfSettings = require('./settings');
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

    require('./routes/notify')(expressApp, this);

    expressApp.use(middlewares.errors);

    return expressApp;
  }

  async fetchConfig (): Promise<void> {
    const leaderUrl = this.settings.get('leader:url');
    const dataFolder = this.settings.get('paths:dataFolder');

    const fileList = await this.getFiles(leaderUrl);

    if(! Array.isArray(fileList)) {
      throw new Error(`File list is not an array: ${fileList}`);
    }

    await this.writeFiles(fileList, dataFolder);
  }

  async getFiles(leaderUrl: string): Promise<PryvFileList> {
    if (leaderUrl == null) {
      throw new Error('Parameter leaderUrl is missing.');
    }

    const leaderEndpoint = url.resolve(leaderUrl, 'conf');
    const auth = this.settings.get('leader:auth');

    const res = await request
      .get(leaderEndpoint)
      .set('Authorization', auth);

    return res.body.files;
  }

  async writeFiles(fileList: PryvFileList, dataFolder: string): Promise<void> {
    if (dataFolder == null) {
      throw new Error('Parameter dataFolder is missing.');
    }

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
}

module.exports = Application;
