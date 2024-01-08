/**
 * @license
 * Copyright (C) 2019–2023 Pryv S.A. https://pryv.com - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */
const nconfSettings = require('./settings');
const request = require('superagent');
const fs = require('fs-extra'); // fs.mkdir doesn't include "recursive" option in node < 10 // See https://github.com/nodejs/node/issues/24698
const path = require('path');
const express = require('express');
const middlewares = require('./middlewares');

class Application {
  /**
   * @type {express$Application}
   */
  express;
  settings;
  logger;

  constructor (params) {
    this.settings = nconfSettings;
    this.express = this.setupExpressApp();
    if (params != null) {
      this.logger = params.logger;
    }
  }

  /**
   * @returns {any}
   */
  setupExpressApp () {
    const expressApp = express();
    expressApp.use(express.json());
    expressApp.use(middlewares.authorization(this.settings));
    require('./routes/notify')(expressApp, this);
    expressApp.use(middlewares.errors);
    return expressApp;
  }

  /**
   * @returns {Promise<string[]>}
   */
  async fetchConfig () {
    const leaderUrl = this.settings.get('leader:url');
    const dataFolder = this.settings.get('paths:dataFolder');
    const fileList = await this.getFiles(leaderUrl);
    if (!Array.isArray(fileList)) {
      throw new Error(`File list is not an array: ${fileList}`);
    }
    return await this.writeFiles(fileList, dataFolder);
  }

  /**
   * @param {string} leaderUrl
   * @returns {Promise<import("/Users/sim/Code/Pryv/dev/service-config-follower/app.ts-to-jsdoc").PryvFileList>}
   */
  async getFiles (leaderUrl) {
    if (leaderUrl == null) {
      throw new Error('Parameter leaderUrl is missing.');
    }
    const leaderEndpoint = new URL('conf', leaderUrl).href;
    const auth = this.settings.get('leader:auth');
    const res = await request.get(leaderEndpoint).set('Authorization', auth);
    const files = res.body.files;
    files.forEach((f) => {
      this.log('info', 'Retrieved file: ' + f.path);
    });
    return res.body.files;
  }

  /**
   * @param {PryvFileList} fileList
   * @param {string} dataFolder
   * @returns {Promise<string[]>}
   */
  async writeFiles (fileList, dataFolder) {
    if (dataFolder == null) {
      throw new Error('Parameter dataFolder is missing.');
    }
    const filesWritten = [];
    let file;
    for (file of fileList) {
      const fullPath = path.resolve(path.join(dataFolder, file.path));
      const directoryPath = path.dirname(fullPath);
      try {
        if (!fs.existsSync(directoryPath)) {
          fs.mkdirpSync(directoryPath, { recursive: true });
        }
      } catch (e) {
        this.log(
          'info',
          `Encountered error when trying to run mkdirp on ${directoryPath}`
        );
        if (e.message?.contains('EEXIST')) {
          this.log(
            'info',
            `Encountered error ${e.message} when trying to run mkdirp on ${directoryPath}`
          );
        } else {
          throw e;
        }
      }
      // Don't pull files in the data directory
      const whitelistRoot = new RegExp('.*' + dataFolder + '[^/\\\\]+$', 'g'); // authorize files in root (no slash or backslash allowed in the filename)
      const whitelistConf = new RegExp(
        '.*' + dataFolder + '[^/\\\\]+/conf/.*',
        'g'
      ); // authorize files in /conf/ folder
      const whitelistTemplates = new RegExp(
        '.*' + dataFolder + '[^/\\\\]+/templates/.*',
        'g'
      ); // authorize files in /templates/ folder
      if (
        !fullPath.match(whitelistRoot) &&
        !fullPath.match(whitelistConf) &&
        !fullPath.match(whitelistTemplates)
      ) {
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

  /** @returns {void} */
  log (level, message) {
    if (this.logger == null) return;
    this.logger[level](message);
  }
}
module.exports = Application;

/**
 * @typedef {{
 *   files: PryvFileList
 * }} PryvFilesObject
 */

/**
 * @typedef {Array<PryvFileItem>} PryvFileList
 */

/**
 * @typedef {{
 *   path: string
 *   content: string
 * }} PryvFileItem
 */
