const fs = require('fs');
const request = require('./requestPageSpeed');

const urls = process.argv[2];
let urlArr = [];

process.on('unhandledRejection', console.log);

fs.readFile(urls, 'utf8', function(err, contents) {
  if(err)  {
    fs.writeFile(
    'log.txt',
    'url: ' + urls + ', ' + err +'\n',
    { flag: "a" },
    function(err) { }
    )
    return;
  }
    urlArr = contents.split(/\r\n/);
    request.makeRequest(urlArr);
});






