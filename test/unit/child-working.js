/**
 * @description Unit tests for the child.js module
 */


'use strict';

var Child = process.env['SPAM_COV'] ? require('../../lib-cov/child') : require('../../lib/child'),
	should = require('should'),
	assert = require('assert'),
	path = require('path'),
	spamPath = path.join(__dirname, '../../lib/spam.js');

if (require.cache[spamPath]){
  delete require.cache[spamPath];
}

require('../../lib/spam').setScript('./test/fixtures/worker');

describe('Child (working script) tests.', function() {

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

		it('should move the state of the child to disconnecting', function (done) {
			var c = new Child({ readyOn: 'ready' });

			c.spawn(function (err) {
				if (err) {
					throw err;
				}

				c.disconnect();
				c.state.should.be.equal('disconnecting');
				done();
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

			var c = new Child({ readyOn: 'ready' }),
				worker = null;

			c.spawn(function (err) {
				if (err) {
					throw err;
				}

				(function() {
					c.replace(1);
				}).should.throw();


				(function() {
					c.replace('cats');
				}).should.throw();
			});
		});

	});

});
