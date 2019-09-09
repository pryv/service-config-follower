// @flow

const nconf = require('nconf');

// 1. `process.env`
// 2. `process.argv`
//
nconf.env().argv();

// 3. Values in `config.json`
//
const configFile = nconf.get('config') || 'dev-config.json';
nconf.file({ file: configFile});

// 4. Any default values
//
nconf.defaults({
  http: {
    port: 7001,
    ip: '127.0.0.1'
  },
  logs: {
    prefix: 'config-follower',
    console: {
      active: true,
      level: 'info',
      colorize: true
    },
    file: {
      active: false
    }
  },
  leader: {
    url: 'http://config-leader:7000',
    auth: 'singlenode-machine-key'
  },
  paths: {
    dataFolder: '/app/pryv/'
  }
});

module.exports = nconf;