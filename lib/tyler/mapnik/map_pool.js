var crypto = require('crypto')
  , Pool = require('generic-pool').Pool
  , Map = require('./map')
  , Layer = require('./layer')
  , Step = require('./../step')
  , _ = require('underscore')
  , StyleSheet = require('./style_sheet');

// Wrapper around node-pool. Generate a pool of 10 resources per type/id
// requested.

module.exports = {
    // Create a string ID from a datasource.
    makeId: function(options) {
      if (typeof options === 'string') return options;      
      return options.user_id + ":" + options.layer_id + ":" +  options.sql      
    },
    // Acquire resource.
    //
    // - `type` {String} resource type, either `map` or `mbtiles`
    // - `datasource` {String} datasource to be passed to constructor
    // - `options` {Object} options to be passed to constructor
    // - `callback` {Function} callback to call once acquired. Takes the form
    //   `callback(err, resource)`
    acquire: function(options, callback) {
        var id = this.makeId(options);
        if (!this.pools[id]) {
          this.pools[id] = this.makePool(id, options);
        }
        this.pools[id].acquire(function(resource) {
            callback(null, resource);
        });
    },
    // Release resource.
    //
    // - `type` {String} resource type, either `map` or `mbtiles`
    // - `datasource` {String} datasource of resource to be released
    // - `resource` {Object} resource object to release
    release: function(options, resource) {
        var id = this.makeId(options);
        this.pools[id] && this.pools[id].release(resource);
    },
    
    // Reset all mappools that match the general key
    // 
    // - `options` {Array} identifiers used to build up the key of the map pool to reset.
    //                    just needs layer_id and user_id
    reset: function(options, callback){
      var id = this.makeId(options);
      var key_base = options.user_id + ":" + options.layer_id + ".*"
      var reggers = new RegExp(key_base)
      var that = this;      
            
      Step(
        function(){
          console.log(_.keys(that.pools));
          return _.select(_.keys(that.pools), function(key){ return reggers.test(key); });        
        },
        function(err, matches){          
          var group = this.group();
          _.each(matches, function(style_key) {
            that.pools[style_key].destroyAllNow(group());
          });                  
        },
        function(err, data){
          if (err) throw err;
          callback();
        }
      );            
    },
        
    // Cache of pools by id.
    pools: {},
    // Factory for pool objects.
    makePool: function(id, options) {
      return Pool({
        name: id,
        create: function(callback) {                    
          var map         = new Map();
          var layer       = new Layer(options);  
          var style_sheet = new StyleSheet(options) 
          style_sheet.compile(function(style){
            map.style_sheets.push(style);
            map.layers.push(layer.compile());      
            map.initialize(function(err, result){
              if (err) throw err;
              callback(result);
            });        
          });
        },
        destroy: function(resource) {
            resource.destroy();
        },
        max: 20,
        idleTimeoutMillis: 10000,//60000,　//100 in dev
        reapIntervalMillis: 1000, //1000, //10 in dev
        log: false
    });
  }
}

