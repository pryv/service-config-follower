/**
 * @license
 * Copyright (C) 2019–2024 Pryv S.A. https://pryv.com - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */
const errorsHandling = require('../utils/errorsHandling');
const errorsFactory = errorsHandling.factory;
const ApiError = errorsHandling.ApiError;
const logging = require('../utils/logging');
const logger = logging.getLogger('errors');

// Error middleware.
// NOTE: next is not used, since the request is terminated on all errors.
/* eslint-disable no-unused-vars */
module.exports = (error, req, res, next) => {
  logger.debug('Error with message: ' + error.message, error);

  if (!(error instanceof ApiError)) {
    error = errorsFactory.unexpectedError(error);
  }

  res
    .status(error.httpStatus || 500)
    .json({ error: error.getPublicErrorData() });
};
