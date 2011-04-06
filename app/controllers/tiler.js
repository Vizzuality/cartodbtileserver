// TODO: SECURITY OF USER INPUT
// TODO: ADD EXPRESSO


var mapnik = require('mapnik')
  , mercator = require('mapnik/sphericalmercator')
  , fs = require('fs')
  , path = require('path')
  , crypto = require('crypto')
  , redis = require('redis')
  , client = redis.createClient()
  , tile_request_queue = "tiler:queue1:request"
  , tile_response_queue = "tiler:queue1:responses";
  
// REDIS SETTINGS 
client.on("error", function (err) {
    console.log("Error " + err);
});

// BOOT TILER
blpopRequest();

function blpopRequest(){
  client.blpop(tile_request_queue, 0, function(err,res){handleRequest(err,res)});
}

// PROCESS TILE QUEUE
function handleRequest(error, result){
  try {
    json = JSON.parse(result[1]);   
  } catch (err){
    console.log("weirdness in json parse for: " + result[1].toString());
  }       
  try {
    console.log("tiling: " + result[1].toString());
    map  = configureMap(json.args);
    bbox = setEnvelope(json.args);
    
    map.render(bbox, 'png', function(err, buffer) {
      if (err) {
        throw err; //maybe return processing tile here and requeue?
      } else {
        // generate cache key
        key = tile_key(json)
      
        // pop tile in cache and notify proxy
        client.set(key, buffer, function(err,res){
          message = JSON.stringify({"node_id": json.args.node_id, "tile_cache_key": key});
          client.rpush(tile_response_queue, message);        
        })      
      }
    });  
  }
  catch (err) {        
    console.log("Error " + err);
  }  
  
  blpopRequest();
}  


function tile_key(args){
  return crypto.createHash('md5').update(JSON.stringify(args)).digest("hex");
}

function configureMap(args){
  // CREATE MAP
  var map = new mapnik.Map(256, 256, mercator.srs);

  // SET ?
  map.buffer_size(50);

  // CREATE LAYER TO RENDER
  var layer = new mapnik.Layer('tile', mercator.srs);

  // SET DATABASE NAME
  global.settings.postgis.dbname = global.settings.db_base_name.replace(/{user_id}/i, args.user_id);

  // SET TABLE NAME
  global.settings.postgis.table = unescape(args.sql);

  // CREATE MAPNIK DATASOURCE
  var postgis = new mapnik.Datasource(global.settings.postgis);
  layer.datasource = postgis;

  // SET STYLE FROM REQUEST
  styles = [args.style];
  map.load(path.join(global.settings.styles, args.style + '.xml'));

  // ADD LABEL STYLES BY DEFAULT
  // styles.push('text');
  // map.load(path.join(settings.styles, 'text.xml'));

  // ADD STYLES TO LAYER
  layer.styles = styles;

  // ADD LAYER TO MAP
  map.add_layer(layer);

  // LOG MAP WITH toString()
  //console.log(map.toString());

  return map;
}

function setEnvelope(args){
  return mercator.xyz_to_envelope(parseInt(args.x), parseInt(args.y), parseInt(args.z), false);  
}