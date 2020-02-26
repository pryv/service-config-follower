// @flow

/*global describe, it, before */

const assert = require('chai').assert;
const Application = require('../../src/app');
const app = new Application();
const request = require('supertest')(app.express);
const settings = app.settings;
const mockLeader = require('../fixtures/leaderMock');
const path = require('path');
const fs = require('fs');

import type { PryvFilesObject, PryvFileList } from '../../src/app.js';

const filesOk: PryvFileList = [
  {
    path: '/core/conf/core.json',
    content: 'I am a dummy config'
  },
  {
    path: '/register/conf/register.json',
    content: 'Another one (bite the dust)'
  },
  {
    path: '/mail/templates/reset-password/en/html.pug',
    content: 'I should be written now'
  }
];
const filesToWrite: PryvFilesObject = {
  files: filesOk
};

const filesKo: PryvFileList = [
  {
    path: '/register/data/dont_write.me',
    content: 'JSUIS PAS VENU ICI POUR SOUFFRIR, OK ?'
  }
];
const filesToNotWrite: PryvFilesObject = {
  files: filesKo
};

describe('POST /notify', function () {

  it('should write files to the disk', async () => {
    mockLeader(filesToWrite);

    const auth = settings.get('leader:auth');
    const res = await request
      .post('/notify')
      .set('Authorization', auth);

    assert.strictEqual(res.status, 200);

    const filesWritten = res.body.files;
    assert.isArray(filesWritten);
    assert.strictEqual(filesWritten.length, filesToWrite.files.length);

    const dataFolder = settings.get('paths:dataFolder');
    for(let i = 0; i < filesWritten.length; i++) {
      assert.include(filesWritten[i], filesToWrite.files[i].path);

      const writtenFilePath = path.join(dataFolder, filesToWrite.files[i].path);
      const fileExist = fs.existsSync(writtenFilePath);
      assert.strictEqual(fileExist, true);
    }
  });

  it('should not write data files to the disk', async () => {
    mockLeader(filesToNotWrite);

    const auth = settings.get('leader:auth');
    const res = await request
      .post('/notify')
      .set('Authorization', auth);

    assert.strictEqual(res.status, 200);

    const filesWritten = res.body.files;
    assert.isArray(filesWritten);
    assert.strictEqual(filesWritten.length, 0);

    const dataFolder = settings.get('paths:dataFolder');

    const writtenFilePath = path.join(dataFolder, filesToNotWrite.files[0].path);
    const fileExist = fs.existsSync(writtenFilePath);
    assert.strictEqual(fileExist, false);
  });
});
