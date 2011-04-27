var Tyler = require('tyler');
var assert = require('assert');
var _ = require('underscore');

exports['test truth'] = function(){
    assert.ok(true,  'it is');
};

exports['test create map base object'] = function(){
  assert.ok(Tyler.Map);
}

exports['test when you make a blank map...'] = function(){
  var map = new Tyler.Map();
  try{
    map.initialize(function(){console.log("done")});  
  } catch(err){
    assert.eql(err,'Map must have at least 1 stylesheet set')
  }  
}


exports['test can initialize a map...'] = function(){
  
  var ops = {x: 4011, y: 3088, z: 13
      , user_id: 1
      , layer_id: 'madrid_bars'
  }
    
  var map         = new Tyler.Map();
  var layer       = new Tyler.Layer(ops);  
  var style_sheet = new Tyler.StyleSheet(ops)  
  
  try{          
    style_sheet.compile(function(map_style){
      map.style_sheets.push(map_style);
      map.layers.push(layer.compile());
      map.initialize(function(err, result){
        assert.ok(map.initialized);
      });        
    });
  } catch(err){
    console.log(err);
  }  
}



