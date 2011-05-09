#!/usr/bin/env node

/*
* RTVE tiler
* ===============
*
* node app [environment] [election_id]
*
* environments: [development, production] 
* election_id: [election id table primary keys]
*
*/
var _  = require('underscore');

// sanity check arguments
var ENV = process.argv[2]
var ELECTION_ID = process.argv[3]
if ((ENV != 'development' && ENV != 'production') || _.isNull(ELECTION_ID)){
  console.error("\nnode app [environment] [election_id]");
  console.error("environments: [development, production], election_id: [see procesos_electorales table]\n");
  process.exit(1);
}

// set Node.js app settings and boot
global.settings     = require(__dirname + '/../../config/settings')
global.environment  = require(__dirname + '/../../config/environments/' + ENV)
_.extend(global.settings, global.environment)

var pg = require('pg').native
  , mercator = require('mapnik/sphericalmercator')
  , mapnik    = require('mapnik')
  , mercator  = require('mapnik/sphericalmercator')
  , path      = require('path')
  , fs        = require('fs')        
  , Tyler     = require(path.join(__dirname, '../../lib/tyler'));


// Postgres connection 
var user_id = '123';
var conString = "tcp://" + global.settings.db_user + "@" + global.settings.db_host + "/" + _.template(global.settings.db_base_name, {user_id : user_id});

// Create denomalised version of GADM4 table with votes, and party names
var sql = '' + 
'DROP TABLE IF EXISTS gadm4_processed; ' +
'CREATE TABLE gadm4_processed AS ( ' +
'SELECT ' +
'g.gid gid,' + 
'v.primer_partido_id,pp1.name primer_nombre,v.primer_partido_percent,v.primer_partido_votos,' +
'v.segundo_partido_id,pp2.name segundo_nombre,v.segundo_partido_percent,v.segundo_partido_votos,' +
'v.tercer_partido_id,pp3.name tercer_nombre,v.tercer_partido_percent,v.tercer_partido_votos,' +
'g.the_geom,' +
'g.the_geom_webmercator,' +
'CASE ' +
"WHEN pp1.name ='PSOE' THEN "  +
'  CASE ' +
"  WHEN v.primer_partido_percent >= 75  THEN 'red_H'" +
"  WHEN (v.primer_partido_percent >= 50) AND (v.primer_partido_percent < 75) THEN 'red_M' " +
"  WHEN (v.primer_partido_percent >= 0) AND (v.primer_partido_percent < 50)  THEN 'red_L'" +
'  END ' +
"WHEN pp1.name = 'PP' THEN " +
'  CASE ' +
"  WHEN v.primer_partido_percent >= 75  THEN 'blue_H'" +
"  WHEN (v.primer_partido_percent >= 50) AND (v.primer_partido_percent < 75)  THEN 'blue_M' " +
"  WHEN (v.primer_partido_percent >= 0) AND (v.primer_partido_percent < 50)  THEN 'blue_L'" +
'  END ' +
"ELSE 'other' " +
"END as color " +
"FROM gadm4 AS g " +
"INNER JOIN votaciones_por_municipio AS v ON g.cartodb_id=v.gadm4_cartodb_id " +
"INNER JOIN partidos_politicos AS pp1 ON pp1.cartodb_id = v.primer_partido_id " +
"INNER JOIN partidos_politicos AS pp2 ON pp2.cartodb_id = v.segundo_partido_id " + 
"INNER JOIN partidos_politicos AS pp3 ON pp3.cartodb_id = v.tercer_partido_id " +
'WHERE proceso_electoral_id=' + 
ELECTION_ID + 
");" +
"ALTER TABLE gadm4_processed ADD PRIMARY KEY (gid); " +
"CREATE INDEX gadm4_processed_the_geom_webmercator_idx ON gadm4_processed USING gist(the_geom_webmercator); " +
"CREATE INDEX gadm4_processed_the_geom_idx ON gadm4_processed USING gist(the_geom);"
 
// there are 2 bounding boxes at each zoom level. one for spain, one for canaries 
var tile_extents = {
  6 : {xmin: 30, ymin: 23, xmax: 32, ymax: 25},
  6 : {xmin: 28, ymin: 26, xmax: 29, ymax: 27},
  7 : {xmin: 60, ymin: 46, xmax: 65, ymax: 50},
  7 : {xmin: 57, ymin: 52, xmax: 59, ymax: 54},
  8 : {xmin: 120, ymin: 92, xmax: 131, ymax: 101},
  8 : {xmin: 114, ymin: 105, xmax: 118, ymax: 108},
  9 : {xmin: 241, ymin: 185, xmax: 263, ymax: 203},
  9 : {xmin: 229, ymin: 211, xmax: 237, ymax: 216},
  10 : {xmin: 482, ymin: 370, xmax: 526, ymax: 407},
  10 : {xmin: 458, ymin: 422, xmax: 475, ymax: 433},
  11 : {xmin: 964, ymin: 741, xmax: 1052, ymax: 815},
  11 : {xmin: 916, ymin: 844, xmax: 951, ymax: 866},
  12 : {xmin: 1929, ymin: 1483, xmax: 2105, ymax: 1631},
  12 : {xmin: 1832, ymin: 1688, xmax: 1902, ymax: 1732},  
} 

pg.connect(conString, function(err, client) {
  if (err) throw err;
  client.query(sql, function(err, result) {
    if (err) throw err;
    
    // BUILD UP LAYERS AND LOAD 
    _.each(tile_extents, function(extent, zoom){ 
      for (var x = extent.xmin; x <= extent.xmax; x++){
        for (var y = extent.ymin; y <= extent.ymax; y++){
          var params = {x: x, y: y, z: Number(zoom), user_id: 123, layer_id: 'gadm1|gadm2|gadm3|gadm4_processed'}
          var tile = new Tyler.Tile(params);
          tile.render(function(buffer){
            console.log("tried to render?")
            var filename = params.x + "_" + params.y + "_" + params.z + "_" + ELECTION_ID + ".png"
            fs.writeFile(filename, buffer, function (err) {
              if (err) throw err;
              console.log('Saved tile to: ' + filename);
            })
          });
          
        }
      }
    });
    
    process.exit(1);
    
    
    
  });
});




