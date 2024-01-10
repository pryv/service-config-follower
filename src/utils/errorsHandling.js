/**
 * @license
 * Copyright (C) 2019–2024 Pryv S.A. https://pryv.com - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */
/**
 * @extends Error
 */
class ApiError extends Error {
  /**
   * @type {number}
   */
  httpStatus;
  /**
   * @type {string}
   */
  message;

  /**
   * @param {number} status
   * @param {string} msg
   */
  constructor (status, msg) {
    super(msg);
    this.httpStatus = status;
    this.message = msg;
  }

  /**
   * @returns {{ message: string; }}
   */
  getPublicErrorData () {
    return {
      message: this.message
    };
  }
}

// Factory class that allows to generate Api Error.
//
class ErrorsFactory {
  /**
   * @param {Error} error
   * @returns {ApiError}
   */
  unexpectedError (error) {
    const msg = error.message || 'Unexpected error.';
    return new ApiError(500, msg);
  }

  /**
   * @param {string | null} message
   * @returns {ApiError}
   */
  unauthorized (message) {
    const msg = message || 'Operation is not authorized.';
    return new ApiError(403, msg);
  }

  /**
   * @param {string | null} message
   * @returns {ApiError}
   */
  invalidParameter (message) {
    const msg = message || 'Some of the provided parameters are invalid.';
    return new ApiError(400, msg);
  }

  /**
   * @param {string} headerName
   * @returns {ApiError}
   */
  missingHeader (headerName) {
    const msg = `Missing expected header "${headerName}".`;
    return new ApiError(400, msg);
  }
}

module.exports.factory = new ErrorsFactory();
module.exports.ApiError = ApiError;
