// @flow

/*global describe, it, before, after, beforeEach, afterEach */

const assert = require('chai').assert;
const sinon = require('sinon');
const Application = require('../../src/app');
const app = new Application();
const request = require('supertest')(app.express);
const settings = app.settings;
const mockLeader = require('../fixtures/leaderMock');
const path = require('path');
const fs = require('fs');
const containersLifecycleHelper = require('../../src/routes/containersLifecycleHelper');

let stopContainer;
let startContainers;
let isContainer;
const service1 = 'pryvio_dns';
const service2 = 'pryvio_register';
const serviceFake = 'fake_service';

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
  before(function() {
    containersLifecycleHelper.COMPOSE_FILE_LOCATION = './comp_file.js';
    fs.writeFileSync(containersLifecycleHelper.COMPOSE_FILE_LOCATION, 'just smth');
  });
  after(function() {
    fs.unlinkSync(containersLifecycleHelper.COMPOSE_FILE_LOCATION);
  });
  describe('write to the disk', () => {
    beforeEach(() => {
      startContainers = sinon.stub(containersLifecycleHelper, 'startContainers');
      stopContainer = sinon.stub(containersLifecycleHelper, 'stopContainers');
      stopContainer.returns();
    });
    afterEach(() => {
      sinon.assert.calledOnce(stopContainer);
      sinon.assert.calledOnce(startContainers);
      stopContainer.restore();
      startContainers.restore();
    });
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
      for (let i = 0; i < filesWritten.length; i++) {
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

  describe('restart containers', () => {
    beforeEach(() => {
      startContainers = sinon.stub(containersLifecycleHelper, 'startContainers');
      isContainer = sinon.stub(containersLifecycleHelper, 'isContainer');
      stopContainer = sinon.stub(containersLifecycleHelper, 'stopContainers');
      stopContainer.returns();
    });
    afterEach(() => {
      sinon.assert.calledOnce(startContainers);
      startContainers.restore();
      stopContainer.restore();
      isContainer.restore();
    });

    it('should kill only one service', async () => {
      mockLeader(filesToWrite);
      isContainer.returns(true);

      const auth = settings.get('leader:auth');
      const res = await request
        .post('/notify')
        .set('Authorization', auth)
        .send({ services: [service1] });

      sinon.assert.calledOnce(stopContainer);
      sinon.assert.calledWith(stopContainer, service1);
    });

    it('should kill two services', async () => {
      mockLeader(filesToWrite);
      isContainer.returns(true);

      const auth = settings.get('leader:auth');
      const res = await request
        .post('/notify')
        .set('Authorization', auth)
        .send({ services: [service1, service2] });

      sinon.assert.calledTwice(stopContainer);
      sinon.assert.calledWith(stopContainer, service1);
      sinon.assert.calledWith(stopContainer, service2);
    });

    it('service is not a running container and should ignore it', async () => {
      mockLeader(filesToWrite);
      isContainer.returns(false);

      const auth = settings.get('leader:auth');
      const res = await request
        .post('/notify')
        .set('Authorization', auth)
        .send({ services: [serviceFake] });
      sinon.assert.notCalled(stopContainer);
    });

    it('should restart all containers', async () => {
      mockLeader(filesToWrite);
      isContainer.returns(true);

      const auth = settings.get('leader:auth');
      const res = await request
        .post('/notify')
        .set('Authorization', auth);

      sinon.assert.calledOnce(stopContainer);
    });

    it('should kill one service and ignore the other', async () => {
      mockLeader(filesToWrite);
      isContainer.withArgs(serviceFake).returns(false);
      isContainer.withArgs(service2).returns(true);

      const auth = settings.get('leader:auth');
      const res = await request
        .post('/notify')
        .set('Authorization', auth)
        .send({ services: [serviceFake, service2] });

      sinon.assert.calledOnce(stopContainer);
      sinon.assert.calledWith(stopContainer, service2);
    });
  });
});
