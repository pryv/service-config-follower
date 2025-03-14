/**
 * @license
 * Copyright (C) Pryv https://pryv.com
 * This file is part of Pryv.io and released under BSD-Clause-3 License
 * Refer to LICENSE file
 */
const Application = require('./app');
const logger = require('./utils/logging').getLogger('server');

const app = new Application({
  logger
});
const settings = app.settings;
const port = settings.get('http:port');
const ip = settings.get('http:ip');

// Fetch config at startup then launch the server
app.fetchConfig()
  .then((filesWritten) => {
    app.express.listen(port, ip, () => {
      logger.info(`Server running on: ${ip}:${port}`);
    });
  })
  .catch((err) => {
    logger.error(err, err);
    process.exit(1);
  });
