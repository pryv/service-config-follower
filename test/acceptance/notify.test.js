// @flow

/*global describe, it, before */

const assert = require('chai').assert;
const Application = require('../../src/app');
const app = new Application();
const request = require('supertest')(app.express);
const settings = app.settings;
const mockLeader = require('../fixtures/leaderMock');

describe('POST /notify', function () {

  before(async () => {
    mockLeader();
  });

  it('answers OK', async () => {
    const auth = settings.get('leader:auth');
    const res = await request
      .post('/notify')
      .set('Authorization', auth);

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.text, 'OK');

    // TODO: test that it actually writes the config file
  });
});
