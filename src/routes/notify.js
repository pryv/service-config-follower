// @flow

import type Application from '../app';
const logger = require('../utils/logging').getLogger('notify');

module.exports = function (expressApp: express$Application, app: Application) {

  // POST /notify: receives notifications about configuration changes and fetch them
  expressApp.post('/notify', (req: express$Request, res: express$Response, next: express$NextFunction) => {
    app.fetchConfig()
      .then((filesWritten) => {
        logger.debug('files written : ' + JSON.stringify(filesWritten, null, 2));
        res.send({files: filesWritten});
      })
      .catch(next);
  });
};
