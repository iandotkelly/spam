/*jshint -W068 */

/**
 * @description Unit tests for the child.js module
 */


'use strict';

var path = require('path'),
	spamRootPath = path.join(__dirname, '../../index.js'),
	spamPath = path.join(__dirname, '../../lib/spam.js'),
	Child = require('../../lib/child'),
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

spam.setScript('./test/fixtures/worker');

describe('Child (listening script) tests.', function () {

	this.timeout(5000);

	before(function () {
		// we want to run the child script with the worker result
		process.env['SPAMTEST'] = 'listener';
	});

	describe('Spawn of a script', function () {

		it('with callback paraneter of the wrong type should throw', function () {
			var c = new Child();

			(function () {
				c.spawn(1);
			}).should.throw();


			(function () {
				c.spawn('cats');
			}).should.throw();


		});

		it('should eventually return ready and initialized', function (done) {
			var c = new Child({ readyOn: 'listening' });

			c.spawn(function (err) {
				if (err) {
					throw err;
				}

				c.worker.should.be.an.object;
				c.state.should.be.equal('initialized');

				done();
			});
		});

		describe('with a short timeout', function () {

			it('should callback with a timeout error', function (done) {
				var c = new Child({ readyOn: 'listening', timeout: 50});

				c.spawn(function (err) {
					err.should.be.an.object;
					err.message.should.be.equal('timeout forking the worker');
					c.state.should.be.equal('timedout');
					done();
				});
			});

		});
	});

});
