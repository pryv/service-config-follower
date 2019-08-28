// @flow

import type Application from '../app';

module.exports = function (expressApp: express$Application, app: Application) {

  // POST /restart: receives notifications about configuration changes and restart the components
  expressApp.post('/restart', (req: express$Request, res: express$Response, next: express$NextFunction) => {
    app.restart()
      .then(() => {
        res.send('OK');
      })
      .catch(next);
  });
};
