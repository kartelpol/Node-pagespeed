const fs = require('fs');
/*const sleep = require('sleep');*/

const fetch = require('node-fetch');
const pageSpeed = 'https://www.googleapis.com/pagespeedonline/v4/runPagespeed?key=AIzaSyCnm5SJik_DNOhxwOkcgf3LGAeMg1M3V_c&url=';
const ResultsFileName = 'results.txt';
const LogFileName = 'log.txt';


let text;
let responseObj;
let counter = 0;
let fetchError = false;
let dateNow;


function makeRequest(urlArr) {
  let begin = 0;
  let end = 0;


  let timerId = setInterval( () => {

    if(end < urlArr.length) {
      begin = end;
      temp = 100 - (end - counter);
      
      (end + 100 < urlArr.length) ? 
        end += temp : 
        end + temp > urlArr.length ?
          end = urlArr.length :
          end += temp;

      for( let delay = 0, i = begin; i < end; i++, delay++) { 
        setTimeout(() => fetchWithRetry(urlArr[i], 100000, 5), delay*700);   
      }

    } else clearInterval(timerId);
    }, 100000);
}


function fetchWithRetry(url, delay, limit) {
    fetch(pageSpeed + url)
      .then(function(response){
          responseObj = response.json();
          return responseObj;
      })

      .then(function(json) {
       
        if(json.hasOwnProperty('error')) {
          json.url = url;
          throw new Error(JSON.stringify(json));
        } else {
          if(fetchError) {
            fetchError =false;
          }
          json.URL = url;
          json.limit = limit;
          text = JSON.stringify(json) + '\n';      

          fs.writeFile(
            ResultsFileName,
            text,
            { flag: "a" },
            function(err) { }
           )
          counter++; 
        }
      })

      .catch( function(err) {
        
        if((err + '').indexOf('FetchError') != -1 ) {
          if(!fetchError ) {
            dateNow = new Date();
            fetchError = true; 
            fs.writeFile(
            LogFileName,
            err + '' + dateNow + '\n',
            { flag: "a" },
            function(err) {} 
            );
          }

          setTimeout(function() { 
            fetchWithRetry(url, 100000, limit);
            }, 
            10000);  
        
          
        } else if(limit > 0 && (err + '').indexOf('rateLimitExceeded') != -1 ) {
          setTimeout( function() { 
            fetchWithRetry(url, delay, --limit)
            }, 
            delay); 

        } else if(!limit && (err + '').indexOf('rateLimitExceeded') != -1) {
         /* sleep.sleep(3600);
          console.log('go further');*/
           setTimeout( function() { 
            fetchWithRetry(url, delay, 5)
            }, 
            3600000); 
          
        } else if((err + '').indexOf('rateLimitExceeded') === -1) {
          fs.writeFile(
            LogFileName,
            err + '\n',
            { flag: "a" },
            function(err) {} 
            );
         
          fs.writeFile(
            ResultsFileName,
            JSON.stringify({error: {url: url}}) + '\n',
            { flag: "a" },
            function(err) {} 
            )
          counter++;  
        }
        
    })
}


exports.makeRequest = makeRequest;