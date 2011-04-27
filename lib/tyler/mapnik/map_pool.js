var crypto = require('crypto')
  , Pool = require('generic-pool').Pool
  , Map = require('./map')
  , Layer = require('./layer')
  , StyleSheet = require('./style_sheet');

// Wrapper around node-pool. Generate a pool of 10 resources per type/id
// requested.

module.exports = {
    // Create a string ID from a datasource.
    makeId: function(options) {
      if (typeof options === 'string') return options;
      var key = options.user_id + ":" + options.layer_id + ":" +  options.sql
      return crypto
          .createHash('md5')
          .update(key)
          .digest('hex');
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
        idleTimeoutMillis: 6000,//60000,　//100 in dev
        reapIntervalMillis: 1000, //1000, //10 in dev

//        idleTimeoutMillis: 10000,
        log: false
    });
  }
}

