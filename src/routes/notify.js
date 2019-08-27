// @flow

import type Application from '../app';

module.exports = function (expressApp: express$Application, app: Application) {

  // POST /notify: notifies a configuration change
  expressApp.post('/notify', (req: express$Request, res: express$Response, next: express$NextFunction) => {
    planUpdate();
    res.send('OK');
  });

  function planUpdate (): void {
    setTimeout(app.startPryv, 10000);
  }
};
