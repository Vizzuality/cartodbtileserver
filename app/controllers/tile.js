

function Tile(opts) {
  
  // CALCULATE BBOX FOR RENDER STEP
  this.bbox = mercator.xyz_to_envelope(parseInt(opts.x), parseInt(opts.y), parseInt(opts.z), false);
  this.map = new mapnik.Map(256, 256, mercator.srs);
  this.map.buffer_size(50);              
//  this.type = options.type || 'map';


    
}

Tile.prototype.render = function(callback) {
  
}  
        
module.exports = Tile;