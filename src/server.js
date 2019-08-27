// @flow

const Application = require('./app');
const logger = require('./utils/logging').getLogger('server');
const express = require('express');
const middlewares = require('./middlewares');

const app = new Application();
const settings = app.settings;
const port = settings.get('http:port');
const ip = settings.get('http:ip');

// Setup express app
const expressApp = express();

expressApp.use(express.json());
expressApp.use(middlewares.authorization(settings));

require('./routes/notify')(expressApp, app);

expressApp.use(middlewares.errors);

// Launch the app and server
app.run()
  .then(() => {
    app.express.listen(port, ip, () => {
      logger.info(`Server running on: ${ip}:${port}`);
    });
  })
  .catch((err) => {
    logger.error(err);
    process.exit(1);
  });
