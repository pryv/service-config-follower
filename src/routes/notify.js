/**
 * @license
 * Copyright (C) Pryv https://pryv.com
 * This file is part of Pryv.io and released under BSD-Clause-3 License
 * Refer to LICENSE file
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
