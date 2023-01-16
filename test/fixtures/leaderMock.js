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
