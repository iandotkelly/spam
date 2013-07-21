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
function Child(script, options) {

	if (typeof script !== 'string') {
		throw new Error('script must be a string');
	}

	options = options || {};
	options.timeout = options.timeout || 0;  // no timeout

	if (options.timeout < 0) {
		throw new Error('options.timeout must be 0 or greater');
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

	// standard timeout for spawning
	this.timeout = options.timeout;

	// state
	this.state = 'new';
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

	this.log('Child process: worker exit event received, worker ID: '
		+ this.worker.id);

	this.state = 'died';

	if (this.worker.suicide) {
		this.log('               worker committed suicide');
	} else {
		if (signal) {
			this.log('               worker was killed by signal: ' + signal);
		} else if (code !== 0) {
			this.log('               worker exited with error code: ' + code);
		} else {
			this.log('               worker exited without error');
		}

		if (code !== 0) {
			this.log('Child process: attempting to start replacement worker in '
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
 * 
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
Child.prototype.spawn = function (callback) {

	callback = callback || function () {};

	if (typeof callback !== 'function') {
		throw new Error('callback must be a function');
	}

	var self = this,
		worker;

	this.log('Child process: spawn worker command received');

	// set up the script
	cluster.setupMaster({ exec: this.script });

	// fork the worker
	self.state = 'new';
	worker = cluster.fork();
	this.worker = worker;

	// handler for exit of the worker
	worker.on('exit', function (code, signal) {
		self.handleExit(code, signal);
	});

	// handler for the timeout
	if (this.timeout > 0) {
		setTimeout(function () {

			if (self.state === 'new') {
				self.log('Child process: Timeout when forking the worker, worker ID: '
					+ self.worker.id);
				self.state = 'timedout';
				callback(new Error('timeout forking the worker'));
			}
		}, this.timeout);
	}

	// we need to handle ready messages
	worker.on('message', function (message) {

		if (message.cmd && message.cmd === 'ready') {
			self.log('Child process: Worker ready message received, worker ID: '
				+ self.worker.id);
			if (self.state === 'new') {
				self.state = 'initialized';
				if (callback) {
					callback(null);
				}

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
		this.state = 'disconnected';
		this.log('Child process: worker disconnected, worked ID: ' + this.worker.id);

	}
};

/**
 * Replace the worker this child is managing,
 * creating new worker before disconnecting old
 * 
 * @param  {Function} callback Callback when worker is ready
 */
Child.prototype.replace = function (callback) {

	callback = callback || function () {};

	if (typeof callback !== 'function') {
		throw new Error('callback must be a function');
	}

	var self = this,
		oldWorker = this.worker;

	this.spawn(function () {

		oldWorker.disconnect();
		self.log('Child process: worker disconnected, worker ID: ' + oldWorker.id);
		callback();

	});
};


module.exports = Child;