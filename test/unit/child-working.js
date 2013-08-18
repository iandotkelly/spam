/*jshint -W068 */

/**
 * @description Unit tests for the child.js module
 */


'use strict';

var path = require('path'),
	spamRootPath = path.join(__dirname, '../../index.js'),
	normSpamPath = path.join(__dirname, '../../lib/spam.js'),
	covSpamPath = path.join(__dirname, '../../lib-cov/spam.js'),
	Child = process.env.SPAM_COV ? require('../../lib-cov/child') : require('../../lib/child'),
	spam;

// make sure no pre-existing SPAM is in the cache
if (require.cache[covSpamPath]) {
	delete require.cache[covSpamPath];
}

if (require.cache[normSpamPath]) {
	delete require.cache[normSpamPath];
}

if (require.cache[spamRootPath]) {
	delete require.cache[spamRootPath];
}

spam = require('../..');
require('should');

spam.setScript('./test/fixtures/worker');

describe('Child (working script) tests.', function () {

	this.timeout(5000);

	before(function () {
		// we want to run the child script with the worker result
		process.env['SPAMTEST'] = 'worker';
	});

	describe('Spawn of a script', function () {

		it('Should eventually return ready and initialized', function (done) {
			var c = new Child({ readyOn: 'ready'});

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
				var c = new Child({ readyOn: 'ready', timeout: 50});

				c.spawn(function (err) {
					err.should.be.an.object;
					err.message.should.be.equal('timeout forking the worker');
					c.state.should.be.equal('timedout');
					done();
				});
			});

		});
	});


	describe('Stopping a working script', function () {

		it('should move the state of the child to stopped', function (done) {
			var c = new Child({ readyOn: 'ready' });

			c.spawn(function (err) {
				if (err) {
					throw err;
				}

				c.disconnect(function () {
					c.state.should.be.equal('stopped');
					done();
				});
			});
		});

	});

	describe('replacing a working script', function () {


		it('should work', function (done) {
			var c = new Child({ readyOn: 'ready' }),
				worker = null;

			c.spawn(function (err) {
				if (err) {
					throw err;
				}
				c.worker.should.be.an.object;
				worker = c.worker;

				c.replace(function (err) {
					if (err) {
						throw err;
					}

					c.worker.should.be.an.object;
					// it should be a different worker
					c.worker.should.not.be.equal(worker);
					done();
				});
			});
		});

		it('with callback paraneter of the wrong type should throw', function () {

			var c = new Child({ readyOn: 'ready' });

			c.spawn(function (err) {
				if (err) {
					throw err;
				}

				(function () {
					c.replace(1);
				}).should.throw();


				(function () {
					c.replace('cats');
				}).should.throw();
			});
		});
	});
});
