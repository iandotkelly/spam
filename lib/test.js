
var Child = require('./child'),
	path = require('path');


var s = require('./spam');


s.on('log', function(message) {
	console.log(message);
})

var c = path.join(__dirname, '../test/fixtures/works.js');


var options = { number: 10, strategy: 'parallel' };
 
s.spawn(c, options, function(err) {
	console.log('done');
});

