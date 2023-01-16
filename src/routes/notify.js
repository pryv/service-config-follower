const containersLifecycleHelper = require('./containersLifecycleHelper');

module.exports = function (expressApp, app) {
  // POST /notify: receives notifications about configuration changes and fetch them
  expressApp.post('/notify', (req, res, next) => {
    app.fetchConfig()
      .then((filesWritten) => {
        const services = req.body.services;
        res.send({ files: filesWritten });
        containersLifecycleHelper.restartPryvContainers(services);
      })
      .catch(next);
  });
};
