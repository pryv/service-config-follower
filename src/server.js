// @flow
const request = require('superagent');
const url = require('url');
const settings = require('./settings');
const logger = require('./utils/logging').getLogger('server');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'; // TODO delete. C'est pour bypasser le certificat SSL expiré

async function fetchSettings(serviceName: string): Promise<Object> {
  logger.debug('loading ' + serviceName + ' settings');

  const regUrlPath = settings.get('services:register:url');
  if(!regUrlPath) {
    logger.warn('Parameter "services.register.url" is undefined, set it in the configuration to allow service-config-follower to fetch other services configuration');
    return;
  }

  const regUrl = url.resolve(regUrlPath, '/conf/' + serviceName);
  let res;
  try {
    res = await request.get(regUrl);
  } catch (error) {
    logger.warn('Unable to retrieve settings from Register on URL: ' + regUrl + '. Error:', error);
    return;
  }

  return res.body;
}

(async ()=>{
  try {
    const res = await fetchSettings('core');
    logger.debug('finished', res);
  } catch (error) {
    logger.error(error);
  }
})();
