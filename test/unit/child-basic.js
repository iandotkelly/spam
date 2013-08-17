/*jshint -W068 */
/**
 * @description Unit tests for the child.js module
 */


'use strict';

var Child = process.env['SPAM_COV'] ? require('../../lib-cov/child') : require('../../lib/child'),
	assert = require('assert'),
	path = require('path'),
	spamPath = path.join(__dirname, '../../lib/spam.js'),
	spam = require('../../lib/spam');

require('should');

if (require.cache[spamPath]) {
	delete require.cache[spamPath];
}

spam.setScript('./test/fixtures/worker');
spam.setMaxListeners(15);

describe('Child tests', function () {

	this.timeout(5000);

	before(function () {
		// we want to run the child script with the worker result
		process.env['SPAMTEST'] = 'worker';
	});

	describe('constructor', function () {

		it('should be a method', function () {
			Child.should.be.a.function;
		});

		it('should return default initialized object with no options', function () {
			var c = new Child();

			c.should.be.an.object;
			assert.strictEqual(null, c.worker);
			c.timeout.should.be.equal(0);
			c.state.should.be.equal('new');
			c.backoff.should.be.an.object;
			c.readyOn.should.be.equal('listening');
			c.disconnectTimeout.should.be.equal(2000);
		});

		it('should return  initialized object with options', function () {
			var c = new Child({ readyOn: 'ready', timeout: 10000 });

			c.should.be.an.object;
			assert.strictEqual(null, c.worker);
			c.timeout.should.be.equal(10000);
			c.state.should.be.equal('new');
			c.backoff.should.be.an.object;
			c.readyOn.should.be.equal('ready');
		});

		it('with a bad value for timeout should throw an error', function () {
			/* jshint nonew: false */
			(function () {
				new Child({ timeout: 'fred' });
			}).should.throw();

			(function () {
				new Child({ timeout: -1 });
			}).should.throw();
		});


		it('with a bad value for readyOn should throw an error', function () {
			/* jshint nonew: false */

			(function () {
				new Child({ readyOn: 'fred' });
			}).should.throw();

			(function () {
				new Child({ readyOn: -1 });
			}).should.throw();

			(function () {
				new Child({readyOn: function () {} });
			}).should.throw();
		});

	});


	describe('on', function () {

		it('should be able to emit events - e.g. the log event', function (done) {

			var c = new Child(),
				f = function (message) {
					message.should.be.equal('cats');
					done();
				};

			c.on('log', f);
			// check that we can emit a log event
			c.emit('log', 'cats');
		});
	});


});
