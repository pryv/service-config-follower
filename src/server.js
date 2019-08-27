// @flow

const Application = require('./app');
const logger = require('./utils/logging').getLogger('server');

const app = new Application();
const settings = app.settings;
const port = settings.get('http:port');
const ip = settings.get('http:ip');

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
