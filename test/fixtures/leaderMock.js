// @flow

const nock = require('nock');
const settings = require('../../src/settings');

module.exports = function (): void {
  const leader = settings.get('leader');
  const mockedConfig = {
    files: [
      {
        path: '/core/conf/core.json',
        content: 'I am a dummy config'
      }
    ]
  };

  nock(leader.url)
    .get('/conf')
    .reply(function () {
      const headerValue = this.req.headers.authorization;
      let status, result;
      if (headerValue === leader.auth) {
        status = 200;
        result = mockedConfig;
      }
      else {
        status = 403;
        result = 'Unauthorized.';
      }
      return [status, result];
    });
};
