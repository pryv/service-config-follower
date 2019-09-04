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

import type { PryvFileList } from '../../src/app.js';

const files: PryvFileList = [
  {
    path: '/core/conf/core.json',
    content: 'I am a dummy config'
  },
  {
    path: '/register/conf/register.json',
    content: 'Another one (bite the dust)'
  }
];
const filesToWrite = {
  files: files
};

describe('POST /notify', function () {

  before(async () => {
    mockLeader(filesToWrite);
  });

  it('should write files to the disk', async () => {
    const auth = settings.get('leader:auth');
    const res = await request
      .post('/notify')
      .set('Authorization', auth);

    assert.strictEqual(res.status, 200);

    const filesWritten = res.body;
    assert.isArray(filesWritten);
    assert.strictEqual(filesWritten.length, filesToWrite.files.length);

    const dataFolder = settings.get('paths:dataFolder');
    for(let i = 0; i < filesWritten.length; i++) {
      console.log('\n\n'+filesWritten[i].path+'\n'+filesToWrite.files[i].path);
      assert.include(filesWritten[i].path, filesToWrite.files[i].path);

      const writtenFilePath = path.join(dataFolder, filesToWrite.files[i].path);
      const fileExist = fs.existsSync(writtenFilePath);
      assert.strictEqual(fileExist, true);
    }
  });
});
