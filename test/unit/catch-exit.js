/*jshint -W068 */

/**
 * @description Unit tests for the spam.js module
 */


'use strict';

var path = require('path'),
	spamRootPath = path.join(__dirname, '../../index.js'),
	spamPath = path.join(__dirname, '../../lib/spam.js'),
	spam;

// make sure no pre-existing SPAM is in the cache
if (require.cache[spamPath]) {
	delete require.cache[spamPath];
}

if (require.cache[spamRootPath]) {
	delete require.cache[spamRootPath];
}

spam = require('../..');
require('should');

describe('spam with a script that will exit every 5 seconds', function () {

	var exits = [], spawnCount = 0;

	this.timeout(12000);

	// count exits
	spam.on('status', function (status) {
		if (status.event === 'spawn') {
			spawnCount++;
		} else if (status.event === 'exit') {
			exits.push(status);
		}
	});

	before(function () {
		spam.setScript('./test/fixtures/worker');
		// we want to run the child script with the listener result
		process.env['SPAMTEST'] = 'badexit';
	});

	it('will force the failing script to restart', function (done) {
		spam.children.length.should.be.equal(0);
		exits.length.should.be.equal(0);
		spawnCount.should.be.equal(0);
		spam.spawn({ timeout: 0, readyOn: 'ready', number: 1 }, function (err) {
			if (err) {
				throw err;
			}
			spawnCount.should.be.equal(1);
			spam.children.length.should.be.equal(1);
			exits.length.should.be.equal(0);

			// wait 6 seconds for it to fail
			setTimeout(function () {
				exits.length.should.be.equal(1);
				exits[0].id.should.be.equal(1);
				exits[0].event.should.be.equal('exit');
				exits[0].code.should.be.equal(1);
				spawnCount.should.be.equal(2);
				done();
			}, 6000);
		});
	});


});
