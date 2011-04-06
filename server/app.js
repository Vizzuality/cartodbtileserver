// TODO: SECURITY OF USER INPUT
// TODO: ADD NODEUNIT

var mapnik = require('mapnik')
  , mercator = require('mapnik/sphericalmercator')
  , connect = require('connect')
  , url = require('url')
  , fs = require('fs')
  , path = require('path')
  , settings = require('./settings');


// CONNECT MIDDLEWARE
module.exports = connect.createServer(  
  
  // LOGGING
  connect.logger('\033[90m:method\033[0m \033[36m:url\033[0m \033[90m:status :response-timems -> :res[Content-Type]\033[0m')
  
  // STATIC ASSETS FOR DEMO ONLY (REMOVE LATER WHEN USING NGINX)
, connect.static(__dirname + '/../public/', { maxAge: settings.oneDay })

  // TILER APPLICATION START
, connect.router(function(app){
    
    // TILE REQUEST URL
    app.get('/tiles/:x/:y/:z/:user_id/:sql/:style', function(req, res, next){      

      try {
        // CALCULATE BBOX FOR RENDER STEP
        var bbox = mercator.xyz_to_envelope(parseInt(req.params.x),
                                            parseInt(req.params.y),
                                            parseInt(req.params.z), false);
      
        // CREATE MAP
        var map = new mapnik.Map(256, 256, mercator.srs);
      
        // SET ?
        map.buffer_size(50);
      
        // CREATE LAYER TO RENDER
        var layer = new mapnik.Layer('tile', mercator.srs);

        // SET DATABASE NAME
        settings.postgis.dbname = settings.db_base_name.replace(/{user_id}/i,req.params.user_id);

        // SET TABLE NAME
        settings.postgis.table = unescape(req.params.sql);

        // CREATE MAPNIK DATASOURCE
        var postgis = new mapnik.Datasource(settings.postgis);
        layer.datasource = postgis;
  
        // SET STYLE FROM REQUEST
        styles = [req.params.style];

        // LOAD STYLE FROM FILE
        // map.load(path.join(settings.styles, req.params.style + '.xml')); 
        
        // LOAD STYLE FROM STRING
        var style_string = fs.readFileSync(path.join(settings.styles, req.params.style + '.xml'), 'utf8');
        map.from_string(style_string, settings.styles + "/"); //must end in trailing slash
                
  
        // ADD LABEL STYLES BY DEFAULT
        // styles.push('text');
        // map.load(path.join(settings.styles, 'text.xml'));
  
        // ADD STYLES TO LAYER
        layer.styles = styles;
  
        // ADD LAYER TO MAP
        map.add_layer(layer);
  
        // LOG MAP WITH toString()
        //console.log(map.toString());
        
        // RENDER MAP AS PNG
        map.render(bbox, 'png', function(err, buffer) {
          if (err) {
            throw err;
          } else {
            //console.log(map.scaleDenominator());
            res.statusCode = 200;
            res.setHeader('Content-Type', 'image/png');        
            res.end(buffer);            
          }
        });
      }
      catch (err) {        
        res.statusCode = 500;
        res.setHeader('Content-Type', 'text/plain');        
        res.end(err.message);
      }
    });
  })  
);