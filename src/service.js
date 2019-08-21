//@flow

const request = require('superagent');
const url = require('url');
const settings = require('./settings');
const fs = require('fs-extra'); // fs.mkdir doesn't include "recursive" option in node < 10 // See https://github.com/nodejs/node/issues/24698
const path = require('path');
const logger = require('./utils/logging').getLogger('service');

const regUrlPath = settings.get('services:config_leader:url');
const configPath = settings.get('configPath');

class Service {
    name: string;

    constructor(name: string) {
      this.name = name;
    }

    async process() {
      const fileList = await this.getConfigFileList();
      this.createFiles(fileList);
    }

    async getConfigFileList(): Promise<Object> {
      logger.debug('Retrieving file list for ' + this.name);
      if(!regUrlPath) {
        throw new Error('Parameter "services.config_leader.url" is undefined, set it in the configuration to allow service-config-follower to fetch other services configuration');
      }

      const regUrl = url.resolve(regUrlPath, 'machine/' + this.name); // TODO better use of resolve ??
      let res;
      try {
        res = await request.get(regUrl);
      } catch (error) {
        throw new Error('Unable to retrieve file list from config_leader on URL: ' + regUrl + ' Error:' + error);
      }

      return res.body;
    }

    createFiles(fileList: Array<string>) {
      if(!Array.isArray(fileList)) {
        throw new Error('File list is not an array. ' + fileList);
      }

      fileList.forEach(async settings => {
        try {
          const fullPath = path.resolve(path.join(configPath, settings));
          const directoryPath = path.dirname(fullPath);

          // Create directory structure if it doesn't exist
          if(!fs.existsSync(directoryPath)) {
            fs.mkdirpSync(directoryPath, {recursive: true});
          }

          // Only pull file in the conf directory
          if(path.basename(path.dirname(fullPath)) !== 'conf') {
            return;
          }

          // Don't pull .gitkeep files
          const fileName = path.basename(fullPath);
          if (fileName === '.gitkeep') {
            return;
          }

          // Pull the file
          const moduleUrl = url.resolve(regUrlPath, 'conf' + settings); // TODO better use of resolve ??
          let res;
          try {
            res = await request.get(moduleUrl);
          } catch (error) {
            throw new Error('Unable to retrieve file list from config_leader on URL: ' + moduleUrl + ' ' + error);
          }

          // Write the file
          fs.writeFileSync(fullPath, res.text, { encoding: 'utf8' });
        } catch (error) {
          logger.error(error);
        }
      });
    }
}

module.exports = Service;