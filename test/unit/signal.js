/**
 * @description Unit tests for the child.js module
 */

'use strict';


var path = require('path'),
	spamRootPath = path.join(__dirname, '../../index.js'),
	spamPath = path.join(__dirname, '../../lib/spam.js'),
	signal,
	assert = require('assert');

// make sure no pre-existing SPAM is in the cache
if (require.cache[spamPath]) {
	delete require.cache[spamPath];
}

if (require.cache[spamRootPath]) {
	delete require.cache[spamRootPath];
}

signal =  require('../..').signal;

require('should');

describe('signal', function () {

	// todo better testing

	it('should be an object', function () {
		signal.should.be.an.object;
	});

	describe('.ready', function () {

		it('should be a method', function () {
			signal.ready.should.be.a.function;
		});

		it('should not throw an exception if run from master', function () {
			assert.doesNotThrow(
				function () {
					signal.ready();
				},
				'should not throw an exception'
			);
		});

		// todo work out how to test the signal method - cannot be run from a master
		// might have to execute another process


	});

});
