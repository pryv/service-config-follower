/**
 * @license
 * Copyright (C) Pryv https://pryv.com
 * This file is part of Pryv.io and released under BSD-Clause-3 License
 * Refer to LICENSE file
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
