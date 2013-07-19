
var Child = require('./child'),
	path = require('path');



var c = new Child(path.join(__dirname, '../test/fixtures/oops.js'));

function done() {
	c.replace(done);
}


c.on('log', function(message) {
	console.log('LOG:  ' + message);
})
c.spawn(done);


