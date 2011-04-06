// TODO: SECURITY OF USER INPUT
// TODO: ADD EXPRESSO

var connect = require('connect')
  , url = require('url')
  , fs = require('fs')
  , path = require('path')
  , redis = require('redis')
  , client_buffers = redis.createClient(6379, '127.0.0.1', {return_buffers: true})
  , client = redis.createClient(6379, '127.0.0.1')
  , client_2 = redis.createClient(6379, '127.0.0.1')
  , queuedRes = {} //move to redis
  , counter = 1
  , tile_request_queue = "tiler:queue1:request"
  , tile_response_queue = "tiler:queue1:responses";

// REDIS SETTINGS 
client.on("error", function (err) {
  console.log("Error " + err);
});
    

// CONNECT MIDDLEWARE
module.exports = connect.createServer(  
  
  // LOGGING
  connect.logger('\033[90m:method\033[0m \033[36m:url\033[0m \033[90m:status :response-timems -> :res[Content-Type]\033[0m')
  
  // STATIC ASSETS FOR DEMO ONLY (REMOVE LATER WHEN USING NGINX)
, connect.static(__dirname + '/../../public/', { maxAge: global.settings.oneDay })

  // TILER APPLICATION START
, connect.router(function(app){
    
    // TILE REQUEST URL
    app.get('/tiles/:x/:y/:z/:user_id/:sql/:style', function(req, res, next){                        
      pushOnTileQueue(req, res);      
    })  
  })  
);


function pushOnTileQueue(req, res){
  requestNumber = counter++;

  message = JSON.stringify({
    "class": "StandardTile",
    "args": {"node_id": requestNumber, 
                     x: req.params.x, 
                     y: req.params.y, 
                     z: req.params.z, 
               user_id: req.params.user_id, 
                   sql: req.params.sql,
                 style: req.params.style
             } 
  });

  queuedRes[requestNumber + "r"] = res;
  client.rpush(tile_request_queue, message, redis.print);
}

// RESPONSE HANDLER  
// KICK OFF RESPONSE HANDLER
//blpopResponse();

function blpopResponse(){
  client_2.blpop(tile_response_queue, 0, function(err,res){handleResponse(err,res)});
}

function handleResponse(err, result) {
  try{
    json = JSON.parse(result[1]);
    console.log(JSON.stringify(json));
    tile = client_buffers.get(json.tile_cache_key, function(err,buffer){
      debugger;
      try {
        requestNumber = json.node_id;    
        xxx = queuedRes[requestNumber + "r"];
        xxx.statusCode = 200;
        xxx.setHeader('Content-Type', 'image/png');        
        xxx.end(buffer);    
        delete queuedRes[requestNumber];         
      } catch (err) {
         console.log("Error " + err);
      }  
    });     
  } catch (err) {
    console.log("Error " + err);
  }
  blpopResponse();
}

//MAKES A WRITE THROUGH TILE CACHE SERVER

//CONFIGURE REDIS AS A LRU CACHE

// PROXY
// RETURN CACHED TILE IF IN CACHE,
// SEND REQUEST TO TILER QUEUE

// TILER
//RENDER TILE ** MORE ON THIS BELOW
//SAVE TILE BUFFER TO REDIS AS STANDARD KVP USING CACHE KEY
//SEND NODE_ID AND CACHE KEY PROXY RESPONSE QUEUE

//PROXY
//READS IN NODE_ID, 
//RETRIEVES REQUEST
//RETRIEVES IMAGE FROM REDIS
//RETURNS TILE TO USER


// RENDER TILE STEP HAS 3 QUEUES, EACH WITH LONGER SQL TIMEOUT
// IF TILE STEP FAILS DUE TO TIMEOUT, POPULATE CACHE WITH DEFAULT "PLEASE WAIT WE ARE RENDERING TILE" then requeue in lower priority queue. 