var Tyler = require('tyler');
var assert = require('assert');
var _ = require('underscore');

exports['test truth'] = function(){
    assert.ok(true,  'it is');
};

exports['test create layer base object'] = function(){
  assert.ok(Tyler.Layer);
}

exports['test layer compile will fail as expected on blank layer'] = function(){
  try {
    var layer = new Tyler.Layer();
    layer.compile();
  } catch (err){
    assert.eql(err, 'layer must be built with user_id and layer_id in options options object');
  }
}

exports['test layer compile will fail if datasource is not complete'] = function(){
  var opts = {layer:{type: "postgis", table: "simon"}}
  var layer = new Tyler.Layer(opts);
  try {
    layer.compile();
  } catch (err){
    assert.eql(err, 'datasource object must have all fields completed: host, dbname, user, geometry_field, extent, srid, max_size');
  }
}





//exports['test ']

// exports['test can set a user style and get a key back'] = function(){
//   var user_id = 1
//   var map_style = "this is some cartocss map style data";
//   
//   Tyler.Style.create(user_id, map_style, function(style){
//     assert.match(style.key, /^node\:style\:\d.*/);
//   });
// }
