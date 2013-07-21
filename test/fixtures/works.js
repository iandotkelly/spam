'use strict';

console.log('hi - i\'m a worker');

var ready = require('../../lib/signal').ready;

function wait(fn) {
  setTimeout(fn, 200);
}

function forever() {
  setTimeout(forever, 1000);
}

wait(function () {
  console.log('step 1');
  wait(function () {        
    console.log('step 2');
    wait(function () {
      console.log('step 3');
      wait(function () {
        console.log('ready');
		    ready();
        forever();
      });
    });
  });
});