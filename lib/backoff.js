/**
 * @description Class for handling an exponential backoff
 * @author Ian Kelly
 *
 * @copyright Copyright (C) Ian Kelly 2013
 */

'use strict';

/**
 * Constructor
 * @param {Object} options  Options e.g. 
 *                          { startMs: 2, maxMs: 500, multiplier: 3 }
 */
function Backoff(options) {

	options = options || {};

	if (typeof options !== 'object') {
		throw new Error('options must be an object');
	}

	// the current timeout - defaults to 100ms
	this.startMs = options.startMs || 100;

	// the maximum timeout - defaults to 60s
	this.maxMs = options.maxMs || 60000;

	// default scaling multiplier - defaults to 2
	this.multiplier = options.multiplier || 2;

	// the current timeout - starts at 0
	this.currentDelayMs = 0;

	// the biggest number before multipliying the 
	// current value will cause an overflow
	this.maxValue = Number.MAX_VALUE / this.multiplier;
}

/**
 * Method to bump the timeout up
 */
Backoff.prototype._calculateNextDelay = function () {

	var currentDelayMs = this.currentDelayMs;

	if (currentDelayMs === 0) {
		// we set to the lower bound if this is going to be the first
		// time we use the backoff after the first immediate retry
		this.currentDelayMs = this.startMs;
	} else if (currentDelayMs > this.maxValue) {
		// this is never going to happen, but protects from overflow
		this.currentDelayMs = Number.MAX_VALUE;
	} else {
		// simple exponential backoff
		this.currentDelayMs = currentDelayMs * this.multiplier;
	}
};

/**
 * Method to return the timeout to zero
 * @return {[type]} [description]
 */
Backoff.prototype.reset = function () {
	// reset the time back
	this.currentDelayMs = 0;
};

/**
 * Callback after timeout duration
 * 
 * @param  {Function} callback Function to call
 */
Backoff.prototype.backoff = function (callback) {

	if (typeof callback !== 'function') {
		throw new Error('callback must be a function');
	}

	var currentDelay = this.currentDelayMs;
	this._calculateNextDelay();

	// we retry immediately if this is the first time
	if (currentDelay === 0) {
		callback();
	} else {
		setTimeout(callback, currentDelay);
	}
};

module.exports = Backoff;