/*jshint -W068 */

/**
 * @description Unit tests for the spam.js module 
 */


'use strict';

var path = require('path'),
	spamRootPath = path.join(__dirname, '../../index.js'),
	normSpamPath = path.join(__dirname, '../../lib/spam.js'),
	covSpamPath = path.join(__dirname, '../../lib-cov/spam.js'),
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

describe('spam - on listening', function () {

	this.timeout(12000);

	describe('(before setScript called)', function () {

		describe('setScript', function () {

			it('called with bad arguments should throw', function () {

				(function () {
					spam.setScript();
				}).should.throw();

				(function () {
					spam.setScript(1);
				}).should.throw();

				(function () {
					spam.setScript(function () {});
				}).should.throw();

			});
		});
	});

	describe('(after setScript called)', function () {

		before(function () {
			spam.setScript('./test/fixtures/worker');
			// we want to run the child script with the listener result
			process.env['SPAMTEST'] = 'listener';
		});

		describe('module', function () {

			it('should be an object', function () {
				spam.should.be.a.object;
			});

			it('should be an event emitter', function (done) {
				spam.on('cats', function () {
					spam.removeAllListeners('cats');
					done();
				});
				spam.emit('cats');
			});
		});

		describe('.setScript', function () {


			it('cannot be called again', function () {

				(function () {
					spam.setScript('./cats.js');
				}).should.throw();

			});

		});

		describe('.spawn', function () {

			it('requires a callback', function () {

				(function () {
					spam.spawn();
				}).should.throw();

			});

			it('will throw with an invalid timeout', function () {

				(function () {
					spam.spawn({ timeout: 'fred'}, function () {});
				}).should.throw();

				(function () {
					spam.spawn({ timeout: -1});
				}).should.throw();

			});

			it('will throw with an invalid readyOn', function () {

				(function () {
					spam.spawn({ readyOn: 'cats'}, function () {});
				}).should.throw();

			});


			it('will throw with an invalid strategy', function () {

				(function () {
					spam.spawn({ strategy: 'cats'}, function () {});
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
			describe('and spawned children', function () {

				before(function () {
					// we want to run the child script with the listener result
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
					});
				});

				it('can be restarted in parallel', function (done) {
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

						spam.children.length.should.be.equal(3);
						for (var index = 0; index < spam.children.length; index++) {
							spam.children[index].state.should.be.equal('stopped');
						}
						done();
					});
				});
			});
		});
	});
});
