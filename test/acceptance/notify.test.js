// @flow

/*global describe, it */

const assert = require('chai').assert;
const Application = require('../../src/app');
const app = new Application();
const request = require('supertest')(app.express);
const settings = app.settings;

describe('POST /notify', function () {

  it('answers OK', async () => {
    const auth = settings.get('config-leader:auth');
    const res = await request
      .post('/notify')
      .set('Authorization', auth);

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.text, 'OK');
  });
});
