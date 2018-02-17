const fs = require('fs');

fs.readFile('results.txt', 'utf8', function(err, contents) {
  if(err)  {
    console.log(err);
    return;
  }

    let arr = contents.split(/\n/);
    let last = arr.length-1;
    console.log(arr);
});






