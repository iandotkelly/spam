# Simple Process Manager (SPaM)
[![Version](https://img.shields.io/npm/v/spam.svg)](https://www.npmjs.com/package/spam) [![Downloads](https://img.shields.io/npm/dm/spam.svg)](https://www.npmjs.com/package/spam)
[![Build Status](https://secure.travis-ci.org/iandotkelly/spam.svg)](http://travis-ci.org/iandotkelly/spam)
[![Dependency Status](https://gemnasium.com/iandotkelly/spam.svg)](https://gemnasium.com/iandotkelly/spam)
[![Coverage Status](https://coveralls.io/repos/github/iandotkelly/spam/badge.svg?branch=master)](https://coveralls.io/github/iandotkelly/spam?branch=master)

SPAM is a module for simple node.js process management, and wraps the cluster module.

## Use

To install:

```sh
$ npm install spam
```

To create some processes, using the spawn method.  This takes the following parameters:

- Configuration object
  - number (number of processes to spawn, e.g. 4)
  - timeout (time in milliseconds to allow each spawn to occur, before timing out)
  - strategy (either 'series', or 'parallel', to spawn one at a time, or all together)
  - readyOn (what signal indicates the script is ready, 'ready' or 'listening' - default)
- Callback when initialization of the module is complete

```javascript
var spam = require('spam');

// to create 4 processes using the myscript.js script - ready on listen(),
// created in parallel, with a timeout of 60 seconds
spam.setScript('./myscript.js');
spam.spawn(
	{
		number: 4,
		timeout: 60000,
		strategy: 'parallel'
	}, function(err) {
			// callback occurs when all processes have declared they are working
			// or a timeout occurs
			if (err) {
				console.log('oops');
			}
});

// to create 2 processes callback is called when 'ready' message sent, not on 'listen'
// created in series, with no timeout
spam.spawn(
	{
		number: 2,
		timeout: 0,
		strategy: 'serial',
		readyOn: 'ready'
	},  function(err) {
			// callback occurs when all processes have declared they are working
			// or a timeout occurs
			if (err) {
				console.log('oops');
			}
});
```

If you want to log what's going on in SPAM
```javascript
spam.on('log', function(message) {
	// do some logging
	console.log('SPAM: ' + message);
});
```

If you want to gracefully restart all the processes, by starting a new worker before killing
the old worker, do this with the restart method.

```javascript
// graceful restart of all the processes
spam.restart({ strategy: 'series' }, function(err) {
	if (err) {
		console.log('oops');
	}
});
```

To stop all the processes:
```javascript
// stop all
spam.stop(function() {
	console.log('stop initiated')
});
```

NOTE: The scripts that are run, either need to run server.listen() or emit a specific 'ready' message.
If they do not do this, then SPAM will assume they've not started and time them out.  You can emit
a 'ready' message using a convenience function or explicitly using process.send();

```javascript
// using the signal module
var signal = require('spam').signal;
signal.ready();

// using the process.send method
process.send({ cmd: 'ready'});
```

### Tests

To run the npm unit tests, install development dependencies and run tests with 'npm test' or 'make'.

```sh
$ cd node_modules/spam
$ npm install
$ npm test
```
If you contribute to the project, tests are written in [mocha](http://mochajs.org/), using [should.js](https://github.com/visionmedia/should.js/) or the node.js assert module.

Coverage can be measured using the [node-jscoverage](https://github.com/visionmedia/node-jscoverage) project.  After installing jscoverage from github, just:
```sh
$ make test-cov
```
