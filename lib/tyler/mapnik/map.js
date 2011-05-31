var mapnik = require('mapnik')
  , mercator  = require('mapnik/lib/sphericalmercator')
  , carto = require('carto')
  , Step = require('../step')
  , _ = require('underscore');

var Map = function(options){  
  
  // Set default args
  options = _.extend({width: 256, height: 256, buffer: 10, layers: [], style_sheets: []}, options);
  _.extend(this, options);

  this.initialized = false;      
  this.mapnik   = null;
  this.map_base = { //globals go here
    "srs": "+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +no_defs",
    "Stylesheet": [], "Layer": []};        
};

Map.prototype.initialize = function(callback){
  if (this.initialized) return true;
  
  this.mapnik = new mapnik.Map( this.width, this.height, mercator.srs );
  var that = this;
  try{
    Step(
      function(){
        that.compile(this);
      },
      function(err, data){
        if (err) { throw err }    
        console.log(data);  
        that.mapnik.from_string(data, './');  //TODO - see if we can make this concurrent
        that.mapnik.buffer_size(that.buffer);       
        return true;
      },
      function(err, data){
        if (err) { throw err }      
        that.initialized = true; 
        callback(null, that);
      }
    );    
  } catch(err) {
    throw err;
  }
}

Map.prototype.compile = function(callback){
  if (_.isEmpty(this.style_sheets)) throw "Map must have at least 1 stylesheet set"  
  if (_.isEmpty(this.layers)) throw "Map must have at least 1 map layer set"
    
  // bring all map pieces together
  this.map_base.Stylesheet = this.style_sheets;
  this.map_base.Layer = this.layers;
  
  // RENDER CARTO MML TO XML - can tidy this up later
   try {
     new carto.Renderer().render(this.map_base, function(err, output) {
         if (err) {
             if (Array.isArray(err)) {
                 err.forEach(function(e) {
                     carto.writeError(e)
                 });
             }
             throw "unable to render supplied string. Must be valid mml."
         } else {
           callback(null, output)
         }
     });
   } catch(e) {
     console.log('Carto is required to render .mml files.')
     throw "unable to render supplied string. Must be valid mml."
   }
}

Map.prototype.destroy = function() {
  if (!this.mapnik) return;
  this.mapnik.clear();
  this.initialized = false;
  delete this.mapnik;
};


// Map.prototype.render = function(tile, callback) {
//   
//   Format.select(tile.format)(tile, this.mapnik, callback);
// };

module.exports = Map;
