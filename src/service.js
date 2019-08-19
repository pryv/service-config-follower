//@flow

const request = require('superagent');
const url = require('url');
const settings = require('./settings');
const fs = require('fs');
const logger = require('./utils/logging').getLogger('service');

class Service {
    name: string;
    configPath: string;

    constructor(name: string, configPath: string) {
      this.name = name;
      this.configPath = configPath;
    }

    async process() {
      const config = await this.fetchSettings();
      await this.pushSettings(config);
    }

    async fetchSettings(): Promise<Object> {
      const regUrlPath = settings.get('services:register:url');
      if(!regUrlPath) {
        logger.warn('Parameter "services.register.url" is undefined, set it in the configuration to allow service-config-follower to fetch other services configuration');
        return;
      }

      const regUrl = url.resolve(regUrlPath, '/conf/' + this.name);
      let res;
      try {
        res = await request.get(regUrl);
      } catch (error) {
        logger.warn('Unable to retrieve settings from Register on URL: ' + regUrl + ' Error:', error);
        return;
      }

      return res.body;
    }

    async pushSettings(config: Object): Promise<void> {
      fs.writeFileSync(this.configPath, JSON.stringify(config, null, 2), {encoding: 'utf8'});
    }
}

module.exports = Service;