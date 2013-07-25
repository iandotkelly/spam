/**
 * @description Unit tests for the child.js module
 */


'use strict';

var spam,
	should = require('should'),
	assert = require('assert'),
	path = require('path'),
	spamPath = process.env['SPAM_COV'] ? path.join(__dirname, '../../lib-cov/spam.js') : path.join(__dirname, '../../lib/spam.js') 

if (require.cache[spamPath]){
  delete require.cache[spamPath];
}

spam = require(spamPath);

describe('spam', function () {

	describe('(before setScript called)', function() {

		describe('setScript', function() {

			it('called with bad arguments should throw', function() {

				(function() {
					spam.setScript();
				}).should.throw();

				(function() {
					spam.setScript(1);
				}).should.throw();

				(function() {
					spam.setScript(function() {});
				}).should.throw();

			})

		})

	});

	describe('(after setScript called)', function() {

		before(function () {
			spam.setScript('./test/fixtures/worker')
			// we want to run the child script with the worker result
			process.env['SPAMTEST'] = 'listener';
		});

		describe('module', function () {

			it('should be an object', function () {
				spam.should.be.a.object;
			});

			it('should be an event emitter', function (done) {
				spam.on('cats', function() {
					spam.removeAllListeners('cats');
					done();
				});
				spam.emit('cats');
			});
		});

		describe('.setScript', function () {


			it('cannot be called again', function () {

				(function() {
					spam.setScript('./cats.js');
				}).should.throw();

			});

		});

		describe('.spawn', function () {

			it('requires a callback', function () {

				(function() {
					spam.spawn();
				}).should.throw();

			});

			it('will throw with an invalid timeout', function () {

				(function() {
					spam.spawn({ timeout: 'fred'}, function() {});
				}).should.throw();

				(function() {
					spam.spawn({ timeout: -1});
				}).should.throw();

			});

			it('will throw with an invalid readyOn', function () {

				(function() {
					spam.spawn({ readyOn: 'cats'}, function() {});
				}).should.throw();

			});


			it('will throw with an invalid strategy', function () {

				(function() {
					spam.spawn({ strategy: 'cats'}, function() {});
				}).should.throw();

			});

			it('with sensible options will create children', function (done) {
				spam.children.length.should.be.equal(0);
				spam.spawn({ timeout: 0, readyOn: 'listening', number: 2 }, function (err) {
					if (err) {
						throw err;
					}
					spam.children.length.should.be.equal(2);
					done();
				});

			});

			it('with just a callback will create one additonal child', function (done) {
				spam.children.length.should.be.equal(2); // from previous test
				spam.spawn(function (err) {
					if (err) {
						throw err;
					}
					spam.children.length.should.be.equal(3);
					done();
				});

			});

			// ideally these would be separate tests, but I have to stop this anyway
			// to run those separate tests
			describe('and spawned children', function() {

				before(function () {
					// we want to run the child script with the worker result
					// as I don't want a ton of http listeners being created
					process.env['SPAMTEST'] = 'listener';
				});

				it('can be restarted in series', function (done) {
					spam.restart(function (err) {
						if (err) {
							throw err;
						}
						for (var index = 0; index < spam.children.length; index++) {
							spam.children[index].state.should.be.equal('initialized');
						}
						done();
					})
				});

				it('can be restarted in parallel', function () {
					spam.restart({ strategy: 'parallel' }, function (err) {
						if (err) {
							throw err;
						}
						for (var index = 0; index < spam.children.length; index++) {
							spam.children[index].state.should.be.equal('initialized');
						}
						done();
					});
				});

				it('can be stopped', function (done) {

					spam.stop(function (err) {
						if (err) {
							throw err;
						}

						// todo ... I don't know what to do other than wait a bit
						setTimeout(function() {
							spam.children.length.should.be.equal(3);
							for (var index = 0; index < spam.children.length; index++) {
								spam.children[index].state.should.be.equal('died');
							}
							done();
						}, 1500);

					});
				});
			})

		});
	});
});
