# Simple Process Manager (SPaM) [![Build Status](https://secure.travis-ci.org/iandotkelly/spam.png)](http://travis-ci.org/iandotkelly/spam)

SPAM is a module for simple node process management, and wraps the cluster module.

## Use

To install:

```sh
$ npm install spam
```

To create some processes, using the spawn method.  This takes the following parameters:

- Script
- Configuration object
  - number (number of processes to spawn, e.g. 4)
  - timeout (time in milliseconds to allow each spawn to occur, before timing out)
  - strategy (either 'series', or 'parallel', to spawn one at a time, or all together)
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
If you contribute to the project, tests are written in [mocha](http://visionmedia.github.com/mocha/), using [should.js](https://github.com/visionmedia/should.js/) or the node.js assert module.

## License

[The MIT License (MIT)](http://opensource.org/licenses/MIT)

Copyright (c) 2013 Ian Kelly

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

