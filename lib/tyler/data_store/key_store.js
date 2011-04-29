// Keystore singleton

var RedisPool = require('./redis_pool')
  , Step = require('./../step')
  , _ = require('underscore');


var KeyStore = function(){
  
  me = {};
  me.redis_pool = RedisPool;  
  me.key_base = {
    pkey: "node:pkey", // hash of all incrementing keys used in tyler
    style: "node:style:<%= style_id %>", // hash of data and type (carto/xml)
    user_styles: "node:user:<%= user_id %>:styles", // set of all the style keys belonging to a user
    style_users: "node:style:<%= style_id %>:users", // set of all the user keys belonging to a style
    layer_style: "node:user:<%= user_id %>:layer:<%= layer_id %>:style", // style key. Represents the default style per user/layer combo
    geom_type: "rails:" + global.settings.db_base_name + ":<%= layer_id %>"
  };
    
  me.initialize = function(){
    that = this;
    this.database = 'pkey'

    // initialise primary key store if empty
    this.redis_pool.acquire(this.database, function(client){
      client.HSETNX(that.key_base.pkey, "style_id", 0)
      return that.redis_pool.release(that.database, client);
    });    
  };

  // interpolate style key
  me.style_key = function(style_id){
    return this.interpolate_key('style', {style_id: style_id});
  }

  // interpolate style users key
  me.style_users_key = function(style_id){ 
    return this.interpolate_key('style_users', {style_id: style_id});
  }

  // interpolate user styles key
  me.user_styles_key = function(user_id){ 
    return this.interpolate_key('user_styles', {user_id: user_id});
  }

  // interpolate user layer style key
  me.user_layer_style_key = function(user_id, layer_id){ 
    return this.interpolate_key('layer_style', {user_id: user_id, layer_id: layer_id});
  }

  me.geom_type_key = function(user_id, layer_id){ 
    return this.interpolate_key('geom_type', {user_id: user_id, layer_id: layer_id});
  }

  
  me.interpolate_key = function(key, values){
    return  _.template(this.key_base[key], values); 
  }

  // returns primary keystore 
  me.get_pkeys = function(callback){
    that = this;
    this.redis_pool.acquire(this.database, function(client){
      client.HGETALL(that.key_base.pkey, function(err,data){      
        if (err) throw err;
        return callback(err, data);      
      });
      that.redis_pool.release(that.database, client);    
    });  
  };

  // returns all keys in primary keystore 
  me.get_pkeys_keys = function(callback){
    that = this;  
    this.redis_pool.acquire(this.database, function(client){
      client.HKEYS(that.key_base.pkey, function(err,data){      
        if (err) throw err;                  
        return callback(err, data);                    
      });
      that.redis_pool.release(that.database, client);        
    });  
  };
  
  // returns a style key and increments primary key store
  me.create_style_key = function(callback){
    var that = this;  
    var client;

    Step(  
      function (){
        that.redis_pool.acquire(this.database, this);      
      },
      function (data){
        client = data;
        client.HINCRBY(that.key_base.pkey, "style_id", 1, this);
      },
      function (err, data){
        if (err) throw err;
        that.redis_pool.release(that.database, client);  
        obj = {key: that.style_key(data),
               id: data}
        return callback(err, obj);      
      }
    );  
  }  


  me.initialize();
  
  return me;

}(); //execute function to return the object we built.

module.exports = KeyStore;