/**
 * @description Unit tests for the child.js module
 */


'use strict';

var spam = require('../../lib/spam'),
	should = require('should'),
	assert = require('assert');

describe('spam', function () {

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
});
