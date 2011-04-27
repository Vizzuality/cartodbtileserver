var Tyler = require('tyler');
var assert = require('assert');
var _ = require('underscore');
var fs = require('fs');

exports['test truth'] = function(){
    assert.ok(true,  'it is');
};

exports['test render'] = function(){
  var ops = {x: 4011, y: 3088, z: 13
      , user_id: 1
      , layer_id: 'madrid_bars'
      //, style_id: 1
      //, sql: "text"
      //, auth: "text"      
  }
  
  var tile = new Tyler.Tile(ops);
  
  tile.render(function(buffer){
    
    assert.ok(buffer);
    fs.writeFile('test_image_0.png', buffer, function (err) {
      if (err) throw err
    });
  });
};


exports['test render unusual style'] = function(){
  
   var user_id = 1;
   var layer_id = 'madrid_bars';
   var map_style = "#madrid_bars{marker-fill: #999999}";
   var exact_map_style = "#madrid_bars{marker-fill: #000000}";
   var ops = {x: 4011, y: 3088, z: 13
        , user_id: 1
        , layer_id: 'madrid_bars'
    }
        

   Tyler.Style.create(user_id, exact_map_style, function(style_key){

     ops.style_id = style_key.id; // set override here

     Tyler.Style.create(user_id, map_style, function(style_key){    

      Tyler.Style.set_default(user_id, layer_id, style_key.id, function(data){                          
        var tile = new Tyler.Tile(ops);
        
        tile.render(function(buffer){

          assert.ok(buffer);
          fs.writeFile('test_image_1.png', buffer, function (err) {
            if (err) throw err
          });
        });
      });
     });       
   });
};


//, style_id: 1
//, sql: "text"
//, auth: "text"