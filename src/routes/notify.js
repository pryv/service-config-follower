// @flow

import type Application from '../app';

module.exports = function (expressApp: express$Application, app: Application) {

  // POST /notify: receives notifications about configuration changes and fetch them
  expressApp.post('/notify', (req: express$Request, res: express$Response, next: express$NextFunction) => {
    app.fetchConfig()
      .then(() => {
        res.send('OK');
      })
      .catch(next);
  });
};
