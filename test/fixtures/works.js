'use strict';

console.log('hi - i\'m a worker');

function wait(fn) {
  setTimeout(fn, 200);
}

wait(function () {
  console.log('step 1');
  wait(function () {        
    console.log('step 2');
    wait(function () {
      console.log('step 3');
      wait(function () {
        console.log('ready');
		  process.send({cmd: 'ready'});
      });
    });
  });
});