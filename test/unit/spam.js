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
				spam.spawn({ timeout: 'fred'});
			}).should.throw();

			(function() {
				spam.spawn({ timeout: -1});
			}).should.throw();

		});

		it('will throw with an invalid readyOn', function () {

			(function() {
				spam.spawn({ readyOn: 'cats'});
			}).should.throw();

		});

		it('with sensible options will create children', function (done) {
			spam.children.length.should.be.equal(0);
			spam.spawn({ timeout: 0, readyOn: 'ready', number: 3 }, function (err) {
				if (err) {
					throw err;
				}
				spam.children.length.should.be.equal(3);
				done();
			})

		});

	});
});
