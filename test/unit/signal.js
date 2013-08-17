/**
 * @description Unit tests for the child.js module
 */

'use strict';


var signal = process.env['SPAM_COV']
	? require('../../lib-cov/signal')
	: require('../../lib/signal'),      // i'm not exposing signal - so need to do this for coverage
	should = require('should'),
	assert = require('assert');

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
