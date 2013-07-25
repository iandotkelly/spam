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

describe('Child (listening script) tests.', function () {

	before(function () {
		// we want to run the child script with the worker result
		process.env['SPAMTEST'] = 'listener';
	});

	describe('Spawn of a script', function () {

		it('with callback paraneter of the wrong type should throw', function () {
			var c = new Child();

			(function() {
				c.spawn(1);
			}).should.throw();


			(function() {
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
