/**
 * @description Module for Simple Process Management (SPaM)
 *
 * @author Ian Kelly
 * @copyright Copyright (C) Ian Kelly 2013
 *
 * @license  MIT
 */

'use strict';

var cluster = require('cluster'),
	Child = require('./child'),
	async = require('async'),
	log,
	children = [];

/**
 * Log messages
 * 
 * @param  {Varies} message Log message - string, number etc.
 */
function logMessage(message) {
	if (log) {
		log(message);
	}
}

/**
 * Creates new child objects
 * 
 * @param  {String} script The script the child objects will use
 * @param  {number} count  The number of children to create
 * @return {Array}         An array of initialized new child objects
 */
function createNewChildren(script, count) {

	var created = [],
		index,
		child;

	for (index = 0; index < count; index++) {
		child = new Child(script);
		child.on('log', logMessage);
		created.push(child);
	}

	return created;
}

/**
 * Parses the options for the spawn method
 * 
 * @param  {Object} options An options object
 * @return {Object}         The options object with default values added
 */
function checkOptions(options) {

	options = options || {};
	options.number = options.number || 1;
	options.strategy = options.strategy || 'series';

	if (options.strategy !== 'series' && options.strategy !== 'parallel') {
		throw new Error('options.strategy must be either "series" or "parallel"');
	}

	return options;
}

/**
 * Spawn one or more child processes
 * 
 * @param  {String}   script   The filename of the scipt the child
 *                             process is to run
 * @param  {[type]}   options  [Optional] options object
 * @param  {Function} callback Callback
 */
function spawn(script, options, callback) {

	// this cannot be run from anything other than the master process
	if (!cluster.isMaster) {
		throw new Error('a child process cannot do this');
	}

	if (typeof options === 'function' && !callback) {
		callback = options;
		options = {};
	}

	// check the options
	options = checkOptions(options);

	logMessage('Process Manager: spawning child processes, script: "' + script + '", options: '
			+ JSON.stringify(options));

	// create an array of new children objects
	var spawning = createNewChildren(script, options.number),
		// choose spawning strategy - parallel or series
		eachFn = options.strategy === 'parallel' ? async.each : async.eachSeries;

	// add that array to the master list
	children = children.concat(spawning),

	// spawn the workers
	eachFn(
		children,
		function (child, callback) {
			child.spawn(function () {
				callback(null);
			});
		},
		function (err) {
			if (err) {
				return callback(err);
			}
			callback(null);
		}
	);
}

/**
 * Restart all the current children
 * 
 * @param  {Object}   options  Options object
 * @param  {Function} callback Callback when all the children restarted
 */
function restart(options, callback) {

	if (!callback && typeof options === 'function') {
		callback = options;
		options = {};
	}

	// default to a series restart
	options = options || {};
	options.strategy = options.strategy || 'series';

	logMessage('Process Manager: restarting all child processes, options: '
		+ JSON.stringify(options));

	var eachFn = options.strategy === 'parallel' ? async.each : async.eachSeries;

	eachFn(
		children,
		function (child, callback) {
			child.replace(function () {
				callback(null);
			});
		},
		function (err) {
			if (err) {
				return callback(err);
			}
			callback(null);
		}
	);
}

/**
 * Stop all the current children
 * 
 * @param  {Object}   options  Options object
 * @param  {Function} callback Callback when all the children stopped
 */
function stop(options, callback) {

	if (!callback && typeof options === 'function') {
		callback = options;
		options = {};
	}

	// default to a series restart
	options = options || {};
	options.strategy = options.strategy || 'series';

	var eachFn = options.strategy === 'parallel' ? async.each : async.eachSeries;

	eachFn(
		children,
		function (child, callback) {
			child.disconnect(function () {
				callback(null);
			});
		},
		function (err) {
			if (err) {
				return callback(err);
			}
			callback(null);
		}
	);

}

/**
 * Add event handlers 
 * 
 * @param  {String}   id       ID of the event
 * @param  {Function} callback Callback when the event is raised
 */
function on(id, callback) {

	if (id === 'log') {
		log = callback;
	}

}

module.exports = {
	spawn: spawn,
	restart: restart,
	stop: stop,
	on: on
};

