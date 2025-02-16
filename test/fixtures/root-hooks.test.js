/**
 * @license
 * Copyright (C) Pryv https://pryv.com
 * This file is part of Pryv.io and released under BSD-Clause-3 License
 * Refer to LICENSE file
 */
// https://mochajs.org/#root-level-hooks
const fs = require('fs-extra');
const Application = require('../../src/app');
const app = new Application();
const settings = app.settings;
const pryvPath = settings.get('paths:dataFolder');

before((done) => {
  fs.remove(pryvPath, done);
});

after((done) => {
  fs.remove(pryvPath, done);
});
