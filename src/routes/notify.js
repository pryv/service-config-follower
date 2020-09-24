// @flow

import type Application from '../app';
const containersLifecycleHelper = require('./containersLifecycleHelper');


module.exports = function (expressApp: express$Application, app: Application) {

  // POST /notify: receives notifications about configuration changes and fetch them
  expressApp.post('/notify', (req: express$Request, res: express$Response, next: express$NextFunction) => {
    app.fetchConfig()
      .then((filesWritten) => {
        let services = req.body.services;
        res.send({ files: filesWritten });
        containersLifecycleHelper.restartPryvContainers(services);
      })
      .catch(next);
  });
 };