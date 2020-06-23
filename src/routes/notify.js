// @flow

import type Application from '../app';
const logger = require('../utils/logging').getLogger('notify');
const child_process = require('child_process');
const fs = require('fs');

module.exports = function (expressApp: express$Application, app: Application) {

  // POST /notify: receives notifications about configuration changes and fetch them
  expressApp.post('/notify', (req: express$Request, res: express$Response, next: express$NextFunction) => {
    app.fetchConfig()
      .then((filesWritten) => {
        res.send({files: filesWritten});
        restartPryvContainers();
      })
      .catch(next);
  });

  function restartPryvContainers() {
    const fileLoc = '/app/pryv/pryv.yml';
    if(fs.existsSync(fileLoc)) {
        try {
            child_process.execSync(`sudo docker-compose -f ${fileLoc} down`);
        }
        catch(e) {
            console.error('Error during stopping containers', e)
        }
        try {
            child_process.execSync(`sudo docker-compose -f ${fileLoc} up -d`);
        }
        catch(e) {
            console.error('Error during starting containers', e)
        }
    } else {
      console.error(`Docker compose file: ${fileLoc} does not exist`)
    }
  }
};
