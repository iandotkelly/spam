

/*
	options: {
		cwd: String current working directory
		script: Script to run

	}


 */

'use strict';

var cluster = require('cluster'),
	Child = require('./child'),
	async = require('async'),
	children = [];

function spawn(script, options) {

	if (!cluster.isMaster) {
		throw new Errror('a child process cannot do this');
	}

	options = options || {};
	options.number = options.number || 1;

	cluster.setupMaster({ exec: script });

	var worker = cluster.fork();

	worker.on('message', function(blah) {
		console.log('got message' + blah.cmd);
	})
}

function restart() {

}

function on(id, callback) {



}

function ready() {
	if (cluster.isMaster) {
		throw new Error('ready can only be called by a child process');
	}
}

module.exports = {
	spawn: spawn,
	restart: restart,
	on: on,
	ready: ready
};

