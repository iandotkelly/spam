
var Child = require('./child'),
	path = require('path');


var s = require('./spam', { timeout: 10 });


s.on('log', function(message) {
	console.log(message);
})

var c = path.join(__dirname, '../test/fixtures/works.js');


var options = { number: 10, strategy: 'parallel', timeout: 20000 };
 
s.spawn(c, options, function(err) {
	if (err) {
		throw err;
	}
	console.log('started');
	s.restart({ strategy: 'series' }, function(err) {
		if (err) {
			throw err;
		}
		console.log('restarted');
	})
});

