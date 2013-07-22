/**
 * @description Unit tests for the child.js module
 */

'use strict';

var Backoff = require('../../lib/backoff'),
	should = require('should'),
	assert = require('assert');

describe('Backoff', function () {

	describe('constructor', function () {

		it('should be a method', function () {
			Backoff.should.be.a.function;
		});

		it('should return initialized object with default parameters', function () {
			var b = new Backoff();

			b.should.be.an.object;
			b.startMs.should.be.equal(100);
			b.maxMs.should.be.equal(60000);
			b.multiplier.should.be.equal(2);
			b.currentDelayMs.should.be.equal(0);
			b.maxValue.should.be.equal(Number.MAX_VALUE / 2);
		});

		it('with an options object should set parameters', function () {

			var b = new Backoff({
				startMs: 53,
				maxMs: 999,
				multiplier: 15
			});

			b.should.be.an.object;
			b.startMs.should.be.equal(53);
			b.maxMs.should.be.equal(999);
			b.multiplier.should.be.equal(15);
			b.currentDelayMs.should.be.equal(0);
			b.maxValue.should.be.equal(Number.MAX_VALUE / 15);
		});
	});

	describe('backoff method with defaults', function () {

		var b = new Backoff();

		it('when called the first time should run immediately', function (done) {

			var start = new Date();

			b.backoff(function () {
				var end = new Date();

				// the delay should be short (e.g. < 5ms)
				var elapsed = end.getTime() - start.getTime();
				elapsed.should.be.lessThan(5);
				done();
			});

		});

		it('when called the second time should be 100 or more ms later', function (done) {

			var start = new Date();

			b.backoff(function () {
				var end = new Date();

				// the delay should be at least 100ms
				var elapsed = end.getTime() - start.getTime();
				elapsed.should.be.greaterThan(99.9);
				done();
			});

		});


		it('when called the third time should be 200 or more ms later', function (done) {

			var start = new Date();

			b.backoff(function () {
				var end = new Date();

				// the delay should be at least 100ms
				var elapsed = end.getTime() - start.getTime();
				elapsed.should.be.greaterThan(199.9);
				done();
			});

		});


		it('when called the third time should be 400 or more ms later', function (done) {

			var start = new Date();

			b.backoff(function () {
				var end = new Date();

				// the delay should be at least 100ms
				var elapsed = end.getTime() - start.getTime();
				elapsed.should.be.greaterThan(399.9);
				done();
			});

		});

		it('when reset is called, the backoff shound return to 0 ', function (done) {

			var start = new Date();
			b.reset();
			b.backoff(function () {
				var end = new Date();

				// the delay should be short (e.g. < 5ms)
				var elapsed = end.getTime() - start.getTime();
				elapsed.should.be.lessThan(5);
				done();
			});

		});
	});



	describe('backoff method with multipier of 4, startMs of 200ms and maxMs of 1000ms', function () {

		var b = new Backoff( { startMs: 200, maxMs: 1000, multiplier: 4 });

		it('when called the first time should run immediately', function (done) {

			var start = new Date();

			b.backoff(function () {
				var end = new Date();

				// the delay should be short (e.g. < 5ms)
				var elapsed = end.getTime() - start.getTime();
				elapsed.should.be.lessThan(5);
				done();
			});

		});

		it('when called the second time should be 200 or more ms later', function (done) {

			var start = new Date();

			b.backoff(function () {
				var end = new Date();

				// the delay should be at least 200ms
				var elapsed = end.getTime() - start.getTime();
				elapsed.should.be.greaterThan(199.9);
				done();
			});

		});


		it('when called the third time should be 800 or more ms later', function (done) {

			var start = new Date();

			b.backoff(function () {
				var end = new Date();

				// the delay should be at least 800ms
				var elapsed = end.getTime() - start.getTime();
				elapsed.should.be.greaterThan(799.9);
				done();
			});

		});


		it('when called the fourth time should be 1000 or more ms later', function (done) {

			var start = new Date();

			b.backoff(function () {
				var end = new Date();

				// the delay should be at least 1000ms
				var elapsed = end.getTime() - start.getTime();
				elapsed.should.be.greaterThan(999.9);
				done();
			});

		});


		it('when called the fifth time should be 1000 or more ms later', function (done) {

			var start = new Date();

			b.backoff(function () {
				var end = new Date();

				// the delay should be at least 1000ms
				var elapsed = end.getTime() - start.getTime();
				elapsed.should.be.greaterThan(999.9);
				done();
			});

		});

	});

});
