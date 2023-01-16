/*global describe, it, beforeEach */
const settings = require('../../src/settings');
const middlewares = require('../../src/middlewares');
const authMiddleware = middlewares.authorization(settings);
const ApiError = require('../../src/utils/errorsHandling').ApiError;
const assert = require('chai').assert;
describe('Authorization middleware', function () {
  let req, res;
  beforeEach(async () => {
    req = { headers: {}, context: {}, query: {} };
    res = {};
  });
  it('fails if auth key is missing', async () => {
    const expectedErrorMsg =
      "Missing 'Authorization' header or 'auth' query parameter.";
    // FLOW: mocking req, res
    authMiddleware(req, res, expectAPIError(expectedErrorMsg, 403));
  });
  it('fails if auth key is invalid', async () => {
    const expectedErrorMsg = 'Invalid authorization key.';
    req.headers.authorization = 'unauthorized';
    // FLOW: mocking req, res
    authMiddleware(req, res, expectAPIError(expectedErrorMsg, 403));
  });
  it('succeeds if auth key is valid', async () => {
    const validAuth = settings.get('leader:auth');
    req.headers.authorization = validAuth;
    // FLOW: mocking req, res
    authMiddleware(req, res, (err) => {
      assert.isUndefined(err);
    });
  });
});
/** @param {string} msg
 * @param {number} status
 * @returns {(err: any) => void}
 */
function expectAPIError(msg, status) {
  return (err) => {
    assert.isNotNull(err);
    assert.isTrue(err instanceof ApiError);
    // FLOW: err is not null
    const [errMsg, errStatus] = [err.message, err.httpStatus];
    assert.strictEqual(errMsg, msg);
    assert.strictEqual(errStatus, status);
  };
}
