var mercator  = require('mapnik/sphericalmercator')
  , Pool = require('./mapnik/map_pool')
  , Step = require('./step');

// should have layer and stylesheet objects in options.
function Tile(opts) {
  this.bbox = mercator.xyz_to_envelope(parseInt(opts.x), parseInt(opts.y), parseInt(opts.z), false);    
  this.options = opts  
}

Tile.prototype.render = function(callback) {

  var that = this;
  var resource;
   
  Step(
    function() {
        Pool.acquire(that.options, this);
    },
    function(err, res) {
        if (err) throw err;
        resource = res;
        resource.mapnik.render(that.bbox, 'png', this);
    },
    function(err, data) {
      if (err) console.log("Tile render error" + err);
      Pool.release(that.options, resource);
      callback(data);
    }
  );  
}  


        
module.exports = Tile;