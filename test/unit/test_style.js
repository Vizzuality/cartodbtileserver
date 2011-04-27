var Tyler = require('tyler');
var assert = require('assert');
var _ = require('underscore');

exports['test truth'] = function(){
    assert.ok(true,  'it is');
};

exports['test style exists'] = function(){
  assert.ok(Tyler.Style);
}

exports['test can set a user style and get a key back'] = function(){
  var user_id = 1
  var map_style = "this is some cartocss map style data";
  
  Tyler.Style.create(user_id, map_style, function(style){
    assert.match(style.key, /^node\:style\:\d.*/);
  });
}

exports['test can list a users styles'] = function(){
  var user_id = 1;
  var map_style = "this is some cartocss map style data";

  Tyler.Style.create(user_id, map_style, function(style){    
    Tyler.Style.list(user_id, function(style_keys){
      assert.includes(style_keys, String(style.id));
    });
  });
}

exports['test can find a specific styles'] = function(){
  var user_id = 1;
  var map_style = "this is some cartocss map style data";

  Tyler.Style.create(user_id, map_style, function(style){    
    Tyler.Style.find(style.id, function(style){
      assert.eql(style, map_style);
    });
  });
}

exports['test can update a specific styles'] = function(){
  var user_id = 1;
  var map_style_1 = "this is some cartocss map style data";
  var map_style_2 = "and this is what I want it to update to."
  
  Tyler.Style.create(user_id, map_style_1, function(style_key){    
    Tyler.Style.find(style_key.id, function(style){
      assert.eql(style, map_style_1);
      Tyler.Style.update(style_key.id, map_style_2, function(style_id){
        Tyler.Style.find(style_id, function(style){
          assert.eql(style,map_style_2);
        });
      });
    });
  });
}

exports['test can delete a users style'] = function(){
  var user_id = 1;
  var map_style = "this is some cartocss map style data";
  var style_key;
  
  Tyler.Style.create(user_id, map_style, function(style_key){    
    Tyler.Style.list(user_id, function(data){
      style_keys = data;
      Tyler.Style.delete(style_key.id, function(data){
        Tyler.Style.list(user_id, function(style_keys){
          assert.ok(!_.includes(style_keys, String(style_key.id)));
        })
      })
    });
  });
}

exports['test set/get a users layer default style'] = function(){
  var user_id = 1;
  var layer_id = 1;
  var map_style = "this is some cartocss map style data";
  var style_key;
  
  Tyler.Style.create(user_id, map_style, function(style_key){    
    Tyler.Style.set_default(user_id, layer_id, style_key.id, function(data){        
      Tyler.Style.get_default(user_id, layer_id, function(style){
        assert.eql(style.data, map_style);
      });
    });
 });
}


exports['test get a non-existant users layer default style returns null'] = function(){
  var user_id = 99;
  var layer_id = 99;
  
  Tyler.Style.get_default(user_id, layer_id, function(style){
    assert.eql(style, {id:null, data:null} );
  });
}





//Style.set(key,value); #=> sets carto css (possible to have validation here too). Returns combined object of cartomapnik XML?
//Style.get(key); Returns 
//Style.delete("pattern");
                          