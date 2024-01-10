/**
 * @license
 * Copyright (C) 2019–2024 Pryv S.A. https://pryv.com - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
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
