// Hightile
// ========
// 
// A basic RESTful carto.css tileserver for CartoDB
//


var mapnik    = require('mapnik')
  , mercator  = require('mapnik/sphericalmercator')
  , connect   = require('connect')
  , redis_lib = require('redis')
  , redis     = redis_lib.createClient(6379, '127.0.0.1', {return_buffers: true})
  , _         = require('underscore')
  , path      = require('path')
  , url       = require('url')
  , fs        = require('fs')
  , crypto    = require('crypto');


module.exports = connect.createServer(  
  
  connect.logger('\033[90m:method\033[0m \033[36m:url\033[0m \033[90m:status :response-timems -> :res[Content-Type]\033[0m')
  
, connect.static(__dirname + '/../../public/', { maxAge: global.settings.oneDay })
  
, connect.router(function(app){
    
    // Flush all cache
    // Todo: Add a pattern specific flush
    app.get('/tiles/flush', function(req,res,next){
      redis.FLUSHALL(function(err,result){
        if (err) throw err
        res.writeHead(200, {'Content-Type': 'text/javascript'});
        res.end(JSON.stringify({status: 'ok', message: 'chocolate for you!'}));
      });      
    });

    // Tile style set URL    
    // Tile styles get URL
    
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
            return_tile(res, 200, buffer)          
          } else {
                        
            // CALCULATE BBOX FOR RENDER STEP
            var bbox = mercator.xyz_to_envelope(parseInt(req.params.x),
                                                parseInt(req.params.y),
                                                parseInt(req.params.z), false);

            // CREATE MAP
            var map = new mapnik.Map(256, 256, mercator.srs);
            map.buffer_size(50);

            // GET XML STYLESHEET FROM CACHE OR COMPILE
            
            //this should be get_tile and should return a Tile object, itself a child of Map
            get_map_stylesheet(req.params, function(err, map_xml){
              if (err) throw "Bad map stylesheet"

              try {                
                map.from_string(map_xml, global.settings.styles + "/");
                map.render(bbox, 'png', function(err, buffer) {
                  if (err) throw err
                  return_tile(res, 200, buffer)
                  weird_cache(cache_key, buffer)                                                 
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
        res.writeHead(500, {'Content-Type': 'text/plain'});        
        res.end(err.message);
      }
    });
  })  
);


// @res server result object
// @code http status code 
// @data tile data
function return_tile(res, code, buffer){
  res.writeHead(code, {'Content-Type': 'image/png'});
  res.end(buffer);        
}

function send_bad_tile(res){    
  bad_tile_key = "bad_tile"  
    
  redis.get(bad_tile_key, function(err,buffer){
    if (err) throw err
    if (_.isNull(buffer)){    
      fs.readFile(global.settings.bad_tile, function (err, data) {
        if (err) throw err
        return_tile(res, 500, data)
        redis.set(bad_tile_key, data, function(err,res){})
      });      
    } else {
      return_tile(res, 500, buffer)
    }
  })
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
        
  // SET DATABASE 
  mml.Layer[0].Datasource.user   = global.settings.db_user
  mml.Layer[0].Datasource.host   = global.settings.db_host
  mml.Layer[0].Datasource.dbname = global.settings.db_base_name.replace(/{user_id}/i,args.user_id)

  // SET TABLE NAME
  mml.Layer[0].Datasource.table = unescape(args.sql)
                
  // SET LAYER SRS
  mml.Layer[0].srs = mercator.srs
      
  // SET LAYER STYLE ID - UPDATE
  mml.Layer[0].name = 'point'
  
  // SET CSS - either get from cache store here, or choose default based on geom_type arg
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
  } catch (err) {
    requested_style = {}
  }

  merged_style = _.extend(base_point_style, requested_style)
  carto_css_point = "#point{"
  _.each(merged_style, function(val, key){
    carto_css_point += key + ":" + val + ";"
  })
  carto_css_point += "}"
      
  return carto_css_point
}

// Cache tile like a weirdo
// Perhaps I'll understand this one day
function weird_cache(cache_key, buffer){
  fs.writeFile(cache_key, buffer, function (err) {
    if (err) throw err
    fs.readFile(cache_key, function (err, data) {
        if (err) throw err
        redis.set(cache_key, data, function(err,res){
          fs.unlink(cache_key, function(err){
            if (err) throw err;
          })
        }); 
    });
  });
}


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
//         var req1 = connect.request(options, function(res1) {
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
// app.get('/tiles/styles/:user_id/:table_name', function(req, res, next){
//   try{
//     if(req.params.style == null){
//       throw "must supply a style parameter"
//     }
//     
//     set_style(req.params, function(){
//       res.writeHead(200, {'Content-Type': 'text/javascript'});
//       res.end(JSON.stringify({status: 'ok', message: 'chocolate for you!'}));
//     });
//     
//     
//   } catch (err) {        
//     res.writeHead(500, {'Content-Type': 'text/javascript'});
//     res.end(JSON.stringify({status: 'error', message: err.message}));
//   }      
// });
// 
