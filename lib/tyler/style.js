var Style = function(){
  var Step = require('./step')
    ,  _    = require('underscore')
    ,  KeyStore = require('./data_store/key_store')
    ,  RedisPool = require('./data_store/redis_pool')
    ,  me = {
      database: "styles",
      defaults: {
        point: "{\n\tmarker-fill: #FF6600;\n\tmarker-opacity: 1;\n\tmarker-width: 8;\n\tmarker-line-color: white;\n\tmarker-line-width: 3;\n\tmarker-line-opacity: 0.9;\n\tmarker-placement: point;\n\tmarker-type: ellipse;\n\tmarker-allow-overlap: true;\n}"
      , polygon: "{\n\tpolygon-fill: #FF6600;\n\tpolygon-opacity: 0.7;\n}"  
      }      
    };
  
  me.create = function(user_id, map_style, callback){
    var that = this;
    var client;
    var multi;
    var style_key;
    
    Step(
      function(){
        KeyStore.create_style_key(this);
      },
      function(err, data){
        if (err) throw err;
        style_key = data;        
        RedisPool.acquire(that.database, this);
      },
      function(data){                          
        client = data;                
        multi = client.multi();
        multi.SET(style_key.key, map_style, this);
        multi.SADD(KeyStore.user_styles_key(user_id), style_key.id);
        multi.SADD(KeyStore.style_users_key(style_key.id), user_id);
        multi.exec(this);
      },
      function(err, data){
        if (err) throw err;        
        RedisPool.release(that.database, client);
        return callback(style_key);
      }
    );
  }
  
  me.list = function(user_id, callback){
    var that = this;
    var client;
    var style_key;
    
    Step(
      function(){
        return KeyStore.user_styles_key(user_id)
      },
      function(err, data){
        style_key = data;
        if (err) throw err;        
        RedisPool.acquire(that.database, this);
      },
      function(data){
        client = data;
        client.SMEMBERS(style_key, this);
      },
      function(err, data){
        if (err) throw err;        
        RedisPool.release(that.database,client);
        callback(data);
      }
    );
  }
  
  me.find = function(style_id, callback){
    var that = this;
    var client;
    
    Step(
      function(){
        RedisPool.acquire(that.database,this);
      },
      function(data){
        client = data;
        client.GET(KeyStore.style_key(style_id), this);
      },
      function(err, data){
        if (err) throw err;
        RedisPool.release(that.database,client);
        callback(data);
      }
    );
  }

  me.update = function(style_id, map_style, callback){
    var that = this;
    var client;
    
    Step(
      function(){
        RedisPool.acquire(that.database,this);
      },
      function(data){
        client = data;
        client.SET(KeyStore.style_key(style_id), map_style, this);
      },
      function(err, data){
        if (err) throw err;
        RedisPool.release(that.database, client);
        callback(style_id);
      }
    );
  }
  
  me.delete = function(style_id, callback){
    var that = this;
    var client;
    var users;
    
     Step(
      function(){
        RedisPool.acquire(that.database, this);
      },
      function(data){
        client = data;
        client.SMEMBERS(KeyStore.style_users_key(style_id), this);
      },
      function(err, data){
        if (err) throw err;
        users = data;
        var group = this.group();
        
        data.forEach(function(user_id) {
          client.SREM(KeyStore.user_styles_key(user_id), style_id, group());    
        });        
      },
      function(err, data){
        if (err) throw err;
        multi = client.multi();
        multi.DEL(KeyStore.style_users_key(style_id));
        multi.DEL(KeyStore.style_key(style_id));        
        multi.exec(this);        
      },
      function(err, data){
        if (err) throw err;
        RedisPool.release(that.database, client);
        callback(style_id);        
      }
    );    
  }

  me.set_default = function(user_id, layer_id, style_id, callback){
    var that = this;
    var client;

    Step(
      function(){
        RedisPool.acquire(that.database, this);
      },
      function(data){
        client = data;
        client.SET(KeyStore.user_layer_style_key(user_id, layer_id), style_id, this);
      },
      function(err, data){
        if (err) throw err;
        RedisPool.release(that.database, client);
        callback(style_id);
      }
    );
  }

  //returns combined id/data hash
  me.get_default = function(user_id, layer_id, callback){
    var that = this;
    var client;
    var id;
    var data;
    
    Step(
      function(){
        RedisPool.acquire(that.database, this);
      },
      function(data){
        client = data;
        client.GET(KeyStore.user_layer_style_key(user_id, layer_id), this); // get set style
      },
      function(err, data){
        if (err) throw err;
        id = data;
        that.find(id, this);
      },
      function(data){              
        if (_.isNull(data)){
          client.HGET(KeyStore.geom_type_key(user_id, layer_id), 'the_geom_type', this); //get default based on geom type
        } else {
          RedisPool.release(that.database, client); // if set style exists
          var obj = {id:id, data:data};
          callback(obj);          
        }
      },
      function(err, data){
        if (err) throw err;
        var obj
        if (data === 'polygon' || data === 'multipolygon'){
          obj = {id: null, data: "#" + layer_id + that.defaults.polygon};
        } else {
          obj = {id: null, data: "#" + layer_id + that.defaults.point};
        } 
        
        RedisPool.release(that.database, client);
        callback(obj);             
      }
    );
  }

  
  return me;  
}();

module.exports = Style;
