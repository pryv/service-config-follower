// @flow

/*global before, after */

// https://mochajs.org/#root-level-hooks

const fs = require('fs-extra');
const Application = require('../../src/app');
const app = new Application();
const settings = app.settings;

const pryvPath = settings.get('paths:dataFolder');

before(done => {
  fs.remove(pryvPath, done);
});

after(done => {
  fs.remove(pryvPath, done);
});
