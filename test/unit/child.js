/**
 * @description Unit tests for the child.js module
 */


'use strict';

var Child = require('../../lib/child'),
	should = require('should'),
	assert = require('assert');

describe('Child', function () {

	describe('constructor', function () {

		it('should be a method', function () {
			Child.should.be.a.function;
		});

		it('needs a string parameter', function () {
			(function() {
				var c = new Child();
			}).should.throw();
		})

		it('should return default initialized object with no options', function () {
			var c = new Child('./cats.js');

			c.should.be.an.object;
			assert.strictEqual(null, c.worker);
			c.script.should.be.equal('./cats.js');
			c.timeout.should.be.equal(0);
			c.state.should.be.equal('new');
			c.backoff.should.be.an.object;
		});


		it('should return  initialized object with options', function () {
			var c = new Child('./cats.js', { timeout: 10000 });

			c.should.be.an.object;
			assert.strictEqual(null, c.worker);
			c.script.should.be.equal('./cats.js');
			c.timeout.should.be.equal(10000);
			c.state.should.be.equal('new');
			c.backoff.should.be.an.object;
		});


		it('with a bad value for timeout should throw an error', function () {
			(function () {
				var c = new Child('./cats.js', { timeout: 'fred' });
			}).should.throw();

			(function () {
				var c = new Child('./cats.js', { timeout: -1 });
			}).should.throw();
		});

	});


	describe('on', function () {

		it('should be able to emit events - e.g. the log event', function (done) {

			var c = new Child('./cats.js'),
				f = function (message) {
					message.should.be.equal('cats');
					done();
				};

			c.on('log', f);
			// check that we can emit a log event
			c.emit('log', 'cats');
		});
	});


	describe('spawn of a working script', function () {

		it('should eventually return ready and initialized', function (done) {
			var c = new Child('./test/fixtures/works');

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
				var c = new Child('./test/fixtures/works', {timeout: 500});

				c.spawn(function (err) {
					err.should.be.an.object;
					err.message.should.be.equal('timeout forking the worker');
					c.state.should.be.equal('timedout');
					done();
				});
			});

		});
	});

	describe('stopping a working script', function () {

		it('should move the state of the child to disconnecting', function (done) {
			var c = new Child('./test/fixtures/works');

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
			var c = new Child('./test/fixtures/works'),
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

	});

});
