/**
 * @license
 * Copyright (C) 2019–2023 Pryv S.A. https://pryv.com - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
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
