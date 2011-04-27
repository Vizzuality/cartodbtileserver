var Tyler = require('tyler')
  , assert = require('assert')
  , _ = require('underscore');

_.mixin(require('underscore.string'));

exports['test user styles key interpolation'] = function(){
  var user_id = 1;
  var user_styles_key = Tyler.KeyStore.user_styles_key(user_id);
  assert.eql("node:user:1:styles", user_styles_key);
}

exports['test style users key interpolation'] = function(){
  var style_id = 1;
  var style_users_key = Tyler.KeyStore.style_users_key(style_id);
  assert.eql("node:style:1:users", style_users_key);
}

exports['test user layer style key interpolation'] = function(){
  var user_id = 1;
  var layer_id = 1;
  var user_layer_style_key = Tyler.KeyStore.user_layer_style_key(user_id, layer_id);
  assert.eql("node:user:1:layer:1:style", user_layer_style_key);
}

exports['test keystore object has an redis_pool'] = function(){
  assert.ok(Tyler.KeyStore.redis_pool);
}

exports['test new keystore initialises correct key'] = function(){
  Tyler.KeyStore.get_pkeys_keys(function(err, data){        
    assert.includes(data, 'style_id');
  });    
}

exports['test new keystore initialises correct key with a hash'] = function(){
  Tyler.KeyStore.get_pkeys(function(err, data){        
    assert.includes(_.keys(data), 'style_id');
  });
}

exports['test keystore object has basic keys'] = function(){
  assert.ok(Tyler.KeyStore.key_base);
}

exports['test keystore object can generate an incrementing style key'] = function(){  
  var keys;
  var that = this;  
  
  Tyler.Step(
    function(){
      Tyler.KeyStore.get_pkeys(this);      
    },
    function(err,data){
      if (err) throw err;
      keys = data
      Tyler.KeyStore.create_style_key(this);      
    },
    function(err,data){
      if (err) throw err;
      assert.ok(Number(keys.style_id) < Number(data.id));
    }    
  );    
}



// 
// exports['test keystore object has basic keys'] = function(){
//   assert.ok(ks.key_base);
// }


// exports['test keystore object can generate a unique style key'] = function(){
//   assert.ok(ks.key_base);
// }






//generate keys
