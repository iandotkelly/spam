/**
 * @description Manage a single worker process
 * @author Ian Kelly
 *
 * @copyright Copyright (C) Ian Kelly
 * @license  MIT
 */

'use strict';

var cluster = require('cluster'),
	Backoff = require('./backoff');

/**
 * Constructor
 * 
 * @param {String} script  Path to the script file to run
 */
function Child(script) {

	if (typeof script !== 'string') {
		throw new Error('script must be a string');
	}

	// a restart timer - exponential back off
	this.backoff = new Backoff(
		{
			startMs: 200,
			maxMs: 120000,
			multiplier: 2
		});

	// the script file to run
	this.script = script;

	// the cluster worker object
	this.worker = null;

	// a callback for logging
	this.logCallback = null;
}

/**
 * Utility function for logging from this child
 * 
 * @param  {Any} message The thing to log
 */
Child.prototype.log = function (message) {
	if (typeof this.logCallback === 'function') {
		this.logCallback(message);
	}
};

/**
 * Handles an 'exit' event from the worker
 * 
 * @param  {String} code   What was the exit code, non-zero is an error
 * @param  {Number} signal What signal caused this to exit
 */
Child.prototype.handleExit = function (code, signal) {

	var self = this;

	if (this.worker.suicide) {

		this.log('Child process worker committed suicide');

	} else {

		if (signal) {
			this.log('Child process was killed by signal: ' + signal);
		} else if (code !== 0) {
			this.log('Child process exited with error code: ' + code);
		} else {
			this.log('Child process exited without error');
		}

		if (code !== 0) {
			this.log('Attempting to restart worker in '
				+ this.backoff.currentDelayMs + 'ms');
			// attempt to respawn this
			this.backoff.backoff(function () {
				self.spawn();
			});
		}
	}

};


/**
 * Spawn a process from this child
 *
 * If you do this more than once, more than one process will be created
 * but only one will be managed by this module
 */
Child.prototype.spawn = function (callback) {

	var self = this,
		worker;

	this.log('Spawn worker command received');

	// set up the script
	cluster.setupMaster({ exec: this.script });

	// fork the worker
	worker = cluster.fork();
	this.worker = worker;

	// handler for exit of the worker
	worker.on('exit', function (code, signal) {
		self.handleExit(code, signal);
	});

	// we need to handle ready messages
	worker.on('message', function (message) {

		self.log('Worker ready message received');

		if (message.cmd && message.cmd === 'ready') {
			if (callback) {
				callback();
			}
		}
	});
};

/**
 * Allow registration of event listeners on the worker
 * Supports all the node worker events, plus a 'log' event
 * 
 * @param  {String}   id       The name of the event
 * @param  {Function} callback The function to call when event is raised
 */
Child.prototype.on = function (id, callback) {

	if (typeof id !== 'string') {
		throw new Error('The id of an event must be a string');
	}

	if (typeof callback !== 'function') {
		throw new Error('An event handler must be passed');
	}

	if (id === 'log') {
		// we want to keep the log functon for ourselves 
		this.logCallback = callback;
	} else {
		// anything else, assume it can be dealt with by the worker
		this.worker.on(id, callback);
	}

};

/**
 * Kill a child process
 * 
 * @param  {String} signal Signal to send (optional, defaults to SIGTERM)
 */
Child.prototype.disconnect = function () {
	if (this.worker) {
		this.worker.disconnect();
	}
};

/**
 * Replace the worker this child is managing
 * 
 * @param  {Function} callback Callback when worker is ready
 */
Child.prototype.replace = function (callback) {
	var oldWorker = this.worker;
	this.spawn(function () {
		oldWorker.disconnect();
		callback();
	});
};


module.exports = Child;