/**
 * @description Unit tests for the child.js module
 */


'use strict';

var spam,
	should = require('should'),
	assert = require('assert'),
	path = require('path'),
	spamPath = path.join(__dirname, '../../lib/spam.js');

if (require.cache[spamPath]){
  delete require.cache[spamPath];
}

spam = require(spamPath);

describe('spam', function () {

	before(function () {
		spam.setScript('./test/fixtures/worker')
		// we want to run the child script with the worker result
		process.env['SPAMTEST'] = 'worker';
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

	describe('.spawn', function () {

		it('requires a callback', function () {

			(function() {
				spam.spawn();
			}).should.throw();

		});

	});
});
