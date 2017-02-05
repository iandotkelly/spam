'use strict';


var path = require('path'),
	spamRootPath = path.join(__dirname, '../../index.js'),
	normSpamPath = path.join(__dirname, '../../lib/spam.js'),
	covSpamPath = path.join(__dirname, '../../lib-cov/spam.js'),
	signal,
	testType = process.env['SPAMTEST'],
	chatty = process.env['SPAMTESTCHATTY'] === 'true',
	http = require('http');

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

signal = require('../..').signal;

if (!testType) {
	throw new Error('No test type defined');
}

if (chatty) {
	switch (testType) {
	case 'worker':
		console.log('Hi, I\'m a Worker');
		break;
	case 'listener':
		console.log('Hi, I\'m a Listener');
		break;
	case 'broken':
		console.log('Hi, I\'m broken');
		break;
	case 'badexit':
		console.log('Hi, I\'m going to exit with code 1');
		break
	default:
		console.log('Unexpected testType ' + testType);
	}
}

function wait(callback) {
	setTimeout(callback, 40);
}

wait(function () {
	if (chatty) {
		console.log('step 1');
	}

	wait(function () {
		if (chatty) {
			console.log('step 2');
		}

		wait(function () {
			if (chatty) {
				console.log('step 3');
			}

			wait(function () {
				/* jshint maxcomplexity:10 */

				switch (testType) {
				case 'worker':
					if (chatty) {
						console.log('ready');
					}
					signal.ready();
					break;
				case 'listener':
					if (chatty) {
						console.log('about to listen');
					}
					try {
						http.createServer(function () {
							// do nothing
						}).listen();
					} catch (err) {}
					break;
				case 'broken':
					if (chatty) {
						console.log('about to throw an excepton');
					}
					throw new Error('oops');
				case 'badexit':
					// signal that we are ready
					if (chatty) {
						console.log('about to signal ready');
					}
					signal.ready();
					// but die in 3 seconds
					setTimeout(function () {
						if (chatty) {
							console.log('about to exit with code 1');
						}
						process.exit(1);
					}, 5000);
				}
			});
		});
	});
});
