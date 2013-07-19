/**
 * @description Unit tests for the child.js module
 */

'use strict';

var Child = require('../../lib/Child'),
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

		it('should return initialized object', function () {
			var c = new Child('./cats.js');

			c.should.be.an.object;
			assert.strictEqual(null, c.worker);
		})
	});

});
