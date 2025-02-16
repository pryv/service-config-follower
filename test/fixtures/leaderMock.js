/**
 * @license
 * Copyright (C) Pryv https://pryv.com
 * This file is part of Pryv.io and released under BSD-Clause-3 License
 * Refer to LICENSE file
 */
const nock = require('nock');
const settings = require('../../src/settings');

module.exports = function (filesToWrite) {
  const leader = settings.get('leader');
  nock(leader.url)
    .get('/conf')
    .reply(function () {
      const headerValue = this.req.headers.authorization;
      let status, result;
      if (headerValue === leader.auth) {
        status = 200;
        result = filesToWrite;
      } else {
        status = 403;
        result = 'Unauthorized.';
      }
      return [status, result];
    });
};
