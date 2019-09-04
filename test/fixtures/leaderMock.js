// @flow

const nock = require('nock');
const settings = require('../../src/settings');
import type { PryvFilesObject } from '../../src/app.js';

module.exports = function (filesToWrite: PryvFilesObject): void {
  const leader = settings.get('leader');

  nock(leader.url)
    .get('/conf')
    .reply(function () {
      const headerValue = this.req.headers.authorization;
      let status, result;
      if (headerValue === leader.auth) {
        status = 200;
        result = filesToWrite;
      }
      else {
        status = 403;
        result = 'Unauthorized.';
      }
      return [status, result];
    });
};
