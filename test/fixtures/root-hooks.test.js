// @flow

/*global before, after */

// https://mochajs.org/#root-level-hooks

const fs = require('fs-extra');

const pryvPath = 'test/fixtures/pryv/';

before(done => {
  fs.remove(pryvPath, done);
});

after(done => {
  fs.remove(pryvPath, done);
});
