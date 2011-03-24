var mapnik = require('mapnik')
  , mercator = require('mapnik/sphericalmercator')
  , http = require('http')
  , url = require('url')
  , fs = require('fs')
  , path = require('path')
  , settings = require('./settings');

function isEmpty(obj) {
    for(var prop in obj) {
        if(obj.hasOwnProperty(prop))
            return false;
    }
    return true;
}

module.exports.server = http.createServer(function(req, res) {

  var query = url.parse(req.url.toLowerCase(), true).query;

  res.writeHead(500, {
  'Content-Type': 'text/plain'
  });

  if (!query || isEmpty(query)) {
      try {
        res.writeHead(200, {
        'Content-Type': 'text/html'
        });
        if (req.url == '/') {
            res.end(fs.readFileSync('./public/index.html'));
        } else {
            res.end(fs.readFileSync('./public/' + req.url));      
        }
      } catch (err) {
            res.end('Not found: ' + req.url);      
      }
  } else {

      // ENSURE ALL PARAMS ARE PASSED  
      if (query &&
          query.x !== undefined &&
          query.y !== undefined &&
          query.z !== undefined &&
          query.sql !== undefined &&
          query.style !== undefined
          ) {
    
          // CALCULATE BBOX FOR RENDER STEP
          var bbox = mercator.xyz_to_envelope(parseInt(query.x),
                                              parseInt(query.y),
                                              parseInt(query.z), false);
          
          // CREATE MAP
          var map = new mapnik.Map(256, 256, mercator.srs);
          
          // SET ?
          map.buffer_size(50);
          
          // CREATE LAYER TO RENDER
          var layer = new mapnik.Layer('tile', mercator.srs);
          
          try {
              // SET TABLE NAME
              settings.postgis.table = unescape(query.sql);

              // CREATE MAPNIK DATASOURCE
              var postgis = new mapnik.Datasource(settings.postgis);
              layer.datasource = postgis;
              
              // LOAD STYLE FROM QUERY FLAG
              styles = [query.style];
              map.load(path.join(settings.styles, query.style + '.xml'));
              
              // ADD LABEL STYLES BY DEFAULT
              styles.push('text');
              map.load(path.join(settings.styles, 'text.xml'));
              
              // ADD STYLES TO LAYER
              layer.styles = styles;
              
              // ADD LAYER TO MAP
              map.add_layer(layer);
              
              // show map in terminal with toString()
              console.log(map.toString());
          }
          catch (err) {
              res.end(err.message);
          }
    
          // RENDER MAP AS PNG
          map.render(bbox, 'png', function(err, buffer) {
              if (err) {
                  res.end(err.message);
              } else {
                  //console.log(map.scaleDenominator());
                  res.writeHead(200, {
                    'Content-Type': 'image/png'
                  });
                  res.end(buffer);
              }
          });
      } else {
          res.end('missing x, y, z, sql, or style parameter');
      }
  }
});
