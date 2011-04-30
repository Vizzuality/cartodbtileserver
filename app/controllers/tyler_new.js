// Tyler
// ========
// 
// A basic RESTful carto.css tileserver for CartoDB
//


var mapnik    = require('mapnik')
  , mercator  = require('mapnik/sphericalmercator')
  , connect   = require('connect')
  , _         = require('underscore')
  , path      = require('path')
  , Tyler     = require(path.join(__dirname, '../../lib/tyler'))
  , url       = require('url')
  , fs        = require('fs')
  , crypto    = require('crypto')
  , spawn     = require('child_process').spawn;

  
module.exports = connect.createServer(  
  
  connect.logger('\033[90m:method\033[0m \033[36m:url\033[0m \033[90m:status :response-timems -> :res[Content-Type]\033[0m')
  
, connect.static(__dirname + '/../../public/', { maxAge: global.settings.oneDay })
  
, connect.router(function(app){
      
    // Extra possible params
    // sql
    // style    
    // oauth
    app.get('/tiles/:x/:y/:z/users/:user_id/layers/:layer_id', function(req, res, next){      

      var params = _.extend(url.parse(req.url, true).query,req.params)  // extend path params with query (?) params    
            
      try {
        var pngquant  = spawn('pngnq', ['-n 256', '-s 50']);        
        var tile = new Tyler.Tile(params);
        tile.render(function(buffer){        
          res.writeHead(200, {'Content-Type': 'image/png'});
          res.end(buffer);

//          pngquant.stdin.write(buffer);          
        });
      } 
      catch (err) {        
        res.writeHead(500, {'Content-Type': 'text/plain'});        
        res.end(err.message);
      }
            
      // pumpToBuffer(pngquant, function (er, buffer) {
      //   res.writeHead(200, {'Content-Type': 'image/png'});
      //   res.end(buffer);
      // })
      pngquant.stdout.on('data', function(data){
        res.write(data);
      });
      
      pngquant.on('exit', function (code) {
//        res.writeHead(200, {'Content-Type': 'image/png'});
        res.end();
      });
      
    });
    
    
    // TODO - update this so it sets and gets a default/set value if it's there rather than just creating a new one
    // and orphaning the old 
    app.get('/tiles/users/:user_id/layers/:layer_id/set_style', function(req, res, next){      
      var style_key;
      
      var params = _.extend(url.parse(req.url, true).query,req.params)  // extend path params with query (?) params    
      Tyler.Style.create(params.user_id, params.style, function(style_k){          
        style_key = style_k;
        Tyler.Style.set_default(params.user_id, params.layer_id, style_key.id, function(data){  
          Tyler.MapPool.reset(params, function(){
            res.writeHead(200, {'Content-Type': 'application/json'});
            res.end(params.callback + "(" + JSON.stringify({status:"ok", style_key:style_key}) + ")");            
          })      
       });
      });      
    });
    
    app.get('/tiles/users/:user_id/layers/:layer_id/get_style', function(req, res, next){      
      var params = _.extend(url.parse(req.url, true).query,req.params)  // extend path params with query (?) params    
      Tyler.Style.get_default(params.user_id, params.layer_id, function(style){        
        res.writeHead(200, {'Content-Type': 'application/javascript'});
        res.end(params.callback + "(" + JSON.stringify({status:"ok", style:style.data}) + ")");         
      });      
    });
    
    
    
  })  
);


function pumpToBuffer (readStream, cb) {
 var errState = null
   , chunks = []
   , length = 0
 readStream.stdout.on("error", function (er) { cb(errState = er) })
 readStream.stdout.on("data", function (chunk) {
   if (errState) return
   chunks.push(chunk)
   length += chunk.length
 })
 readStream.on("exit", function () {
   if (errState) return
   var buf = new Buffer(length)
     , i = 0
   chunks.forEach(function (b) {
     b.copy(buf, i, 0, b.length)
     i += b.length
   })
   cb(null, buf)
 })
}
