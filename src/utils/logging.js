/**
 * @license
 * Copyright (C) Pryv https://pryv.com
 * This file is part of Pryv.io and released under BSD-Clause-3 License
 * Refer to LICENSE file
 */
const winston = require('winston');
const settings = require('../settings');

// Setup logging levels (match logging methods below)
const levels = Object.freeze({
  debug: 3,
  info: 2,
  warn: 1,
  error: 0
});
winston.setLevels(levels);
winston.addColors({
  debug: 'blue',
  info: 'green',
  warn: 'yellow',
  error: 'red'
});

// Spply settings
const logsSettings = settings.get('logs');

// (Console transport is present by default)
const consoleSettings = winston.default.transports.console;
consoleSettings.silent = !logsSettings.console.active;
if (logsSettings.console.active) {
  consoleSettings.level = logsSettings.console.level;
  consoleSettings.colorize = logsSettings.console.colorize;
  consoleSettings.timestamp = logsSettings.console.timestamp || true;
}
if (winston.default.transports.file) {
  // In production env it seems winston already includes a file transport...
  winston.remove(winston.transports.File);
}
if (logsSettings.file.active) {
  winston.add(winston.transports.File, {
    level: logsSettings.file.level,
    filename: logsSettings.file.path,
    maxsize: logsSettings.file.maxFileBytes,
    maxFiles: logsSettings.file.maxNbFiles,
    timestamp: true,
    json: false
  });
}

const loggers = new Map();
const prefix = logsSettings.prefix;

// Returns a logger singleton for the given component. Keeps track of initialized
// loggers to only use one logger per component name.
//
module.exports.getLogger = function (componentName) {
  const context = prefix + ':' + componentName;
  // Return memoized instance if we have produced it before.
  const existingLogger = loggers.get(context);
  if (existingLogger) return existingLogger;
  // Construct a new instance. We're passing winston as a logger here.
  const logger = new LoggerImpl(context, winston);
  loggers.set(context, logger);
  return logger;
};

class LoggerImpl {
  /**
   * @type {string}
   */
  messagePrefix = undefined;
  winstonLogger = undefined;

  // Creates a new logger for the given component.
  constructor (context, winstonLogger) {
    this.messagePrefix = context ? '[' + context + '] ' : '';
    this.winstonLogger = winstonLogger;
  }

  /**
   * @param {string} msg
   * @param {{}} metaData
   * @returns {void}
   */
  debug (msg, metaData) {
    this.log('debug', msg, metaData);
  }

  /**
   * @param {string} msg
   * @param {{}} metaData
   * @returns {void}
   */
  info (msg, metaData) {
    this.log('info', msg, metaData);
  }

  /**
   * @param {string} msg
   * @param {{}} metaData
   * @returns {void}
   */
  warn (msg, metaData) {
    this.log('warn', msg, metaData);
  }

  /**
   * @param {string} msg
   * @param {unknown} metaData
   * @returns {void}
   */
  error (msg, metaData = {}) {
    this.log('error', msg + ':' + JSON.stringify(metaData, null, 2));
  }

  /**
   * @param {string} level
   * @param {string} message
   * @param {{}} metaData
   * @returns {void}
   */
  log (level, message, metaData) {
    const msg = this.messagePrefix + message;
    const meta = metaData ? JSON.stringify(metaData) : {};
    this.winstonLogger[level](msg, meta);
  }
}

/**
 * @typedef {Object} Logger
 */
