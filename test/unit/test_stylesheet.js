var Tyler = require('tyler');
var assert = require('assert');
var _ = require('underscore');

exports['test truth'] = function(){
    assert.ok(true,  'it is');
};

exports['test that if we have no styles set we return the default one'] = function(){
  
  var ops = {x: 4011, y: 3088, z: 13
       , user_id: 1
       , layer_id: 'madrid_bars'
   }
   var style_sheet = new Tyler.StyleSheet(ops)  
   
   style_sheet.compile(function(map_style){
     assert.ok(map_style.data)     
   });
}

exports['test that if set a default configured default'] = function(){
  
   var user_id = 1;
   var layer_id = 'my_layer';
   var map_style = "#my_layer{marker-fill: #999999}";
   var ops = {x: 4011, y: 3088, z: 13
        , user_id: 1
        , layer_id: 'my_layer'
    }

   Tyler.Style.create(user_id, map_style, function(style_key){    
     Tyler.Style.set_default(user_id, layer_id, style_key.id, function(data){        
       var style_sheet = new Tyler.StyleSheet(ops)  
       style_sheet.compile(function(stored_map_style){
         assert.eql(stored_map_style.data, map_style);     
       });            
     });
  });  
}


exports['test that if set an override style id it will use that'] = function(){
  
   var user_id = 1;
   var layer_id = 'my_layer';
   var map_style = "#my_layer{marker-fill: #999999}";
   var exact_map_style = "#my_layer{marker-fill: #000000}";
   var ops = {x: 4011, y: 3088, z: 13
        , user_id: 1
        , layer_id: 'my_layer'
    }
        
   Tyler.Style.create(user_id, exact_map_style, function(style_key){
     ops.style_id = style_key.id; // set override here
     Tyler.Style.create(user_id, map_style, function(style_key){    
      Tyler.Style.set_default(user_id, layer_id, style_key.id, function(data){            
        var style_sheet = new Tyler.StyleSheet(ops)  
        style_sheet.compile(function(stored_map_style){
          assert.eql(stored_map_style.data, exact_map_style);     
        });            
      });
     });       
   });  
}