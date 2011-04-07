// TODO: SECURITY OF USER INPUT
// TODO: ADD EXPRESSO


var mapnik = require('mapnik')
  , mercator = require('mapnik/sphericalmercator')
  , connect = require('connect')
  , http = require('http')
  , url = require('url')
  , fs = require('fs')
  , crypto = require('crypto')
  , redis_lib = require('redis')
  , redis = redis_lib.createClient(6379, '127.0.0.1', {return_buffers: true})
  , _ = require('underscore')
  , path = require('path');

// CONNECT MIDDLEWARE
module.exports = connect.createServer(  
  
  // LOGGING
  connect.logger('\033[90m:method\033[0m \033[36m:url\033[0m \033[90m:status :response-timems -> :res[Content-Type]\033[0m')
  
  // STATIC ASSETS FOR DEMO ONLY (REMOVE LATER WHEN USING NGINX)
, connect.static(__dirname + '/../../public/', { maxAge: global.settings.oneDay })

  // TILER APPLICATION START
, connect.router(function(app){
    
    
    app.get('/tiles/flush', function(req,res,next){
      redis.FLUSHALL(function(err,result){
         if (err) {
            throw err;
          } else {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'text/javascript');        
            res.end(JSON.stringify({status: 'ok', message: 'chocolate for you!'}));
          }  
      });      
    });

    // MAKE ME ASYNCH
    // app.get('/tiles/prime/:user_id/:sql/:style', function(req,res,next){
    //   var z_min = 1
    //   var z_max = 4
    //   
    //   for (var z = z_min; z <= z_max; z++){
    //     var x_max = Math.pow(2,z)
    //     var y_max = Math.pow(2,z)
    //     
    //     for (var x = 0; x < x_max; x++){
    //       for (var y = 0; y < y_max; y++){
    //         var cache_path = '/tiles/' 
    //                         + x 
    //                         + '/' + y 
    //                         + '/' + z 
    //                         + '/' + req.params.user_id 
    //                         + '/' + req.params.sql 
    //                         + '/' + req.params.style
    //         
    //         var options = {
    //           host: 'localhost',
    //           port: 3000,
    //           path: cache_path,
    //           method: 'GET'
    //         };
    // 
    //         var req1 = http.request(options, function(res1) {
    //           console.log('CACHE_PRIME: ' + res1.statusCode + " : " + cache_path);
    //           req1.end()
    //         });
    //       }
    //     }        
    //   }
    //   res.statusCode = 200;
    //   res.setHeader('Content-Type', 'text/javascript');        
    //   res.end(JSON.stringify({status: 'ok', message: 'primetime!'}));            
    // });

    
    // FIXME: TILE STYLE API URL
    app.get('/tiles/styles/:user_id/:table_name', function(req, res, next){
      try{
        if(req.params.style == null){
          throw "must supply a style parameter"
        }
        
        set_style(req.params, function(){
          res.statusCode = 200;
          res.setHeader('Content-Type', 'text/javascript');        
          res.end(JSON.stringify({status: 'ok', message: 'chocolate for you!'}));
        });
        
        
      } catch (err) {        
        res.statusCode = 500;
        res.setHeader('Content-Type', 'text/javascript');        
        res.end(JSON.stringify({status: 'error', message: err.message}));
      }      
    });
    
    // TILE REQUEST URL
    app.get('/tiles/:x/:y/:z/:user_id/:sql/:style', function(req, res, next){      

      var cache_key = "tile_cache" + ":"
                + req.params.x + ":" 
                + req.params.y + ":" 
                + req.params.z + ":" 
                + req.params.user_id + ":" 
                + req.params.sql + ":" 
                + req.params.style;
      
      try {
        redis.get(cache_key, function(err,buffer){
          if (!_.isNull(buffer)){
          
            console.log("cache hit: " + cache_key);
          
            send_good_tile(res, buffer)
          
          } else {
            console.log("cache miss: " + cache_key)
            
            // CALCULATE BBOX FOR RENDER STEP
            var bbox = mercator.xyz_to_envelope(parseInt(req.params.x),
                                                parseInt(req.params.y),
                                                parseInt(req.params.z), false);

            // CREATE MAP
            var map = new mapnik.Map(256, 256, mercator.srs);
            map.buffer_size(50);

            // GET XML STYLESHEET FROM CACHE OR COMPILE
            get_map_stylesheet(req.params, function(err, map_xml){
              if (err != null){
                throw "Bad map stylesheet"
              }
              try {
                
                map.from_string(map_xml, global.settings.styles + "/");
                // RENDER MAP AS PNG
                map.render(bbox, 'png', function(err, buffer) {
                  if (err) {
                    throw err;
                  } else {
                    //console.log(map.scaleDenominator());

                    // SEND BACK TO CLIENT
                    send_good_tile(res, buffer)

                    // CACHE LIKE A WEIRDO
                    fs.writeFile(cache_key, buffer, function (err) {
                        if (err) {
                            console.log("Error on write: " + err)
                        } else {
                            fs.readFile(cache_key, function (err, data) {
                                if (err) throw err
                                redis.set(cache_key, data, function(err,res){ // SET CACHE HERE
                                  fs.unlink(cache_key, function(err){
                                    if (err) throw err;
                                  })
                                }); 
                            });
                        }
                    });              
                  }
                });
              } catch (err) {
                send_bad_tile(res)
                console.log("table doesn't exist? " + err); //DEBUG                                   
              }
            });
          }
        })
      } 
      catch (err) {        
        res.statusCode = 500;
        res.setHeader('Content-Type', 'text/plain');        
        res.end(err.message);
      }
    });
  })  
);


function send_bad_tile(res){    
  bad_tile_key = "bad_tile"  
    
  redis.get(bad_tile_key, function(err,buffer){
    if (_.isNull(buffer)){    
      fs.readFile(global.settings.bad_tile, function (err, data) {
        if (err) throw err
        res.statusCode = 500;
        res.setHeader('Content-Type', 'image/png');        
        res.end(data);            
        redis.set(bad_tile_key, data, function(err,res){})
      });      
    } else {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'image/png');        
      res.end(buffer);                  
    }
  })
}

function send_good_tile(res, buffer){
  res.statusCode = 200;
  res.setHeader('Content-Type', 'image/png');        
  res.end(buffer);        
}


function style_key(args){
  return "tile_style:user:" + args.user_id + ":sql:" + args.sql + ":style:" + safe_hash(args.style)
}

function safe_hash(val){
  try{
    val = JSON.stringify(val)
  } catch (err) {
    console.log("error parsing style JSON")
  }
  return crypto.createHash('md5').update(val).digest("hex")  
}


function get_map_stylesheet(args, callback){
  key = style_key(args)
    
  redis.get(key, function(err, res){
    if (res == null){
      generate_map_stylesheet(args, function(err, output){
        redis.set(key, output, function(err, res){
          callback(null, output)
        });
      })
    } else{
      callback(err, res.toString())
    }    
  });
}


function generate_map_stylesheet(args, callback){
    
  // GRAB CARTO.MML BASE
  mml = global.settings.carto
        
  // SET DATABASE NAME
  mml.Layer[0].Datasource.dbname = global.settings.db_base_name.replace(/{user_id}/i,args.user_id)

  // SET TABLE NAME
  mml.Layer[0].Datasource.table = unescape(args.sql)
                
  // SET LAYER SRS
  mml.Layer[0].srs = mercator.srs
      
  // SET LAYER STYLE ID - UPDATE
  mml.Layer[0].name = 'point'
  
  // SET CSS
  mml.Stylesheet[0].data = point_cartocss(args.style)
      
  // RENDER CARTO MML TO XML
  try {
    var carto = require('carto');
    new carto.Renderer().render(mml, function(err, output) {
        if (err) {
            if (Array.isArray(err)) {
                err.forEach(function(e) {
                    carto.writeError(e)
                });
            }
            process.exit(1)
        } else {
          callback(null, output)
        }
    });
  } catch(e) {
    console.log('Carto is required to render .mml files.')
    process.exit(1)
  }
}

function point_cartocss(style){  
  base_point_style = {
      'marker-fill':'#FF6600'
    , 'marker-opacity': 1
    , 'marker-width': 8
    , 'marker-line-color': 'white'
    , 'marker-line-width': 3
    , 'marker-line-opacity': 0.9
    , 'marker-placement': 'point'
    , 'marker-type': 'ellipse'
    , 'marker-allow-overlap': true
    //, 'polygon-fill': '#FF6600'
  }  

  try {
    requested_style = JSON.parse(style)
  } catch (e) {
    requested_style = {}
  }

  merged_style = _.extend(base_point_style, requested_style)
  
  // Could replace this with mustache at some point
  carto_css_point = "#point{"
  _.each(merged_style, function(val, key){
    carto_css_point += key + ":" + val + ";"
  })
  carto_css_point += "}"
      
  return carto_css_point
}


