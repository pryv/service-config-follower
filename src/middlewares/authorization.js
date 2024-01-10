/**
 * @license
 * Copyright (C) 2019–2024 Pryv S.A. https://pryv.com - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */
const errorsFactory = require('../utils/errorsHandling').factory;

// Middleware that enforces and verifies 'Authorization' header or 'auth' query parameter.
//
module.exports = (settings) => {
  return (req, res, next) => {
    const auth = req.headers.authorization || req.query.auth;
    if (auth == null) {
      return next(
        errorsFactory.unauthorized(
          "Missing 'Authorization' header or 'auth' query parameter."
        )
      );
    }

    const validAuth = settings.get('leader:auth');
    if (validAuth == null || auth !== validAuth) {
      return next(errorsFactory.unauthorized('Invalid authorization key.'));
    }

    next();
  };
};
