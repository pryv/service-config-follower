/**
 * @license
 * Copyright (C) 2019–2024 Pryv S.A. https://pryv.com - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */
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
