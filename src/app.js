// @flow
const nconfSettings = require('./settings');
const request = require('superagent');
const url = require('url');
const fs = require('fs-extra'); // fs.mkdir doesn't include "recursive" option in node < 10 // See https://github.com/nodejs/node/issues/24698
const path = require('path');
const express = require('express');
const middlewares = require('./middlewares');

export type PryvFilesObject = {
  files: PryvFileList
};
export type PryvFileList = Array<PryvFileItem>;
export type PryvFileItem = {
  path: string,
  content: string
};

class Application {
  express: express$Application;
  settings: Object;
  logger: Object;

  constructor(params: {
    logger: Object,
  }) {
    this.settings = nconfSettings;
    this.express = this.setupExpressApp();
    if (params != null) {
      this.logger = params.logger;
    }
  }

  setupExpressApp(): express$Application {
    const expressApp = express();

    expressApp.use(express.json());
    expressApp.use(middlewares.authorization(this.settings));

    require('./routes/notify')(expressApp, this);

    expressApp.use(middlewares.errors);

    return expressApp;
  }

  async fetchConfig (): Promise<Array<string>> {
    const leaderUrl = this.settings.get('leader:url');
    const dataFolder = this.settings.get('paths:dataFolder');

    const fileList = await this.getFiles(leaderUrl);

    if(! Array.isArray(fileList)) {
      throw new Error(`File list is not an array: ${fileList}`);
    }

    return await this.writeFiles(fileList, dataFolder);
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
    
    const files = res.body.files;
    files.forEach(f => {
      this.log('info', 'Retrieved file: ' + f.path)
    })
    
    return res.body.files;
  }

  async writeFiles(fileList: PryvFileList, dataFolder: string): Promise<Array<string>> {
    if (dataFolder == null) {
      throw new Error('Parameter dataFolder is missing.');
    }

    const filesWritten: Array<string> = [];
    let file;
    for (file of fileList) {
      const fullPath = path.resolve(path.join(dataFolder, file.path));
      const directoryPath = path.dirname(fullPath);

      // Create directory structure if it doesn't exist
      if(! fs.existsSync(directoryPath)) {
        fs.mkdirpSync(directoryPath, {recursive: true});
      }

      // Don't pull files in the data directory
      const whitelistRoot = new RegExp('.*' + dataFolder + '[^/\\\\]+$', 'g'); // authorize files in root (no slash or backslash allowed in the filename)
      const whitelistConf = new RegExp('.*' + dataFolder + '[^/\\\\]+/conf/.*', 'g'); // authorize files in /conf/ folder
      const whitelistTemplates = new RegExp('.*' + dataFolder + '[^/\\\\]+/templates/.*', 'g'); // authorize files in /templates/ folder
      if(!fullPath.match(whitelistRoot) && !fullPath.match(whitelistConf) && !fullPath.match(whitelistTemplates)){
        continue;
      }

      // Write the file
      const fileWritten = path.join(dataFolder, file.path);
      this.log('info', 'Writing file: ' + fileWritten);
      fs.writeFileSync(fullPath, file.content, { encoding: 'utf8' });
      filesWritten.push(fileWritten);
    }

    return filesWritten;
  }

  log(level, message) {
    if (this.logger == null) return;
    this.logger[level](message);
  }
}

module.exports = Application;
