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

if (require.cache[path.join(__dirname, '../../lib/signal.js')]) {
	delete require.cache[path.join(__dirname, '../../lib/signal.js')];
}
if (require.cache[path.join(__dirname, '../../lib-cov/signal.js')]) {
	delete require.cache[path.join(__dirname, '../../lib-cov/signal.js')];
}


spam = require('../..');
require('should');

describe('spam - on ready', function () {

	this.timeout(12000);

	before(function () {
		spam.setScript('./test/fixtures/worker');
		// we want to run the child script with the readyon result
		process.env['SPAMTEST'] = 'worker';
	});

	describe('.spawn', function () {

		it('with sensible options will create children', function (done) {
			spam.children.length.should.be.equal(0);
			spam.spawn({ timeout: 0, readyOn: 'ready', number: 2 }, function (err) {
				if (err) {
					throw err;
				}
				spam.children.length.should.be.equal(2);
				done();
			});

		});

		describe('and spawned children', function () {

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

					spam.children.length.should.be.equal(2);
					for (var index = 0; index < spam.children.length; index++) {
						spam.children[index].state.should.be.equal('stopped');
					}
					done();
				});
			});
		});

	});
});
