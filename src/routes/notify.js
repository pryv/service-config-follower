// @flow

module.exports = function (expressApp: express$Application, settings: Object) {

  // POST /notify: notifies a configuration change
  expressApp.post('/notify', (req: express$Request, res: express$Response, next: express$NextFunction) => {
    planUpdate();
    res.send('OK');
  });

  function planUpdate (): void {
    // TODO: Implement update
  }
};
