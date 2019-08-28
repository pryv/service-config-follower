// @flow

/*global describe, it */

const assert = require('chai').assert;
const Application = require('../../src/app');
const app = new Application();
const request = require('supertest')(app.express);
const settings = app.settings;

describe('POST /restart', function () {

  it('answers OK', async () => {
    const auth = settings.get('leader:auth');
    const res = await request
      .post('/restart')
      .set('Authorization', auth);

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.text, 'OK');
  });
});
