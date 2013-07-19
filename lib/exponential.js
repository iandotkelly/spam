/**
 * @description Class for handling an exponential timeout
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
function Exponential(options) {

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

	// the current timeout - starts at the start ms
	this.currentTimeoutMs = this.startMs;

	// the biggest number before multipliying the 
	// current value will cause an overflow
	this.maxValue = Number.MAX_VALUE / this.multiplier;
}

/**
 * Method to bump the timeout up
 */
Exponential.prototype.failed = function () {
	// in the unlikely event that multiplying would cause an overflow
	if (this.currentTimeoutMs > this.maxValue) {
		// this is never going to run - it is like longer than the age
		// of the universe by now
		this.currentTimeoutMs = Number.MAX_VALUE;
	} else {
		// exponentially increase the timeout
		this.currentTimeoutMs = this.currentTimeoutMs * this.multiplier;
	}
};

/**
 * Method to return the timeout to the start
 * @return {[type]} [description]
 */
Exponential.prototype.worked = function () {
	// reset the time back
	this.currentTimeoutMs = this.startMs;
};

/**
 * Callback after timeout duration
 * 
 * @param  {Function} callback Function to call
 */
Exponential.prototype.setTimeout = function (callback) {

	if (typeof callback !== 'function') {
		throw new Error('callback must be a function');
	}

	setTimeout(callback, this.currentTimeoutMs);
};

module.exports = Exponential;