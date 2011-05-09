var _ = require('underscore');
var Style = require('../style');
var RedisPool = require('../data_store/redis_pool');
var KeyStore = require('../data_store/key_store');
var Step = require('step');

var StyleSheet = function(options){
  
  this.id = options.layer_id;
  this.user_id = options.user_id;  
  this.database = 'tables_metadata'
  try{
    if (_.isUndefined(options.style_id)){
      this.style_id = null;    
    } else {
      this.style_id = options.style_id
    }
    
  } catch (err) {

  }
  
  this.options = options;    
};


//Stylesheet is built according to:
// if options have a style_id, use that.
// if that fails and options have a userid/layerid, use that
// if that fails, use the defaults based on the geometry type of the layer
StyleSheet.prototype.compile = function(callback){
  var that = this;

  Style.find(this.style_id, function(data){
    
    if (_.isNull(data)){
      Style.get_default(that.user_id, that.id, function(style){
        that.data = style.data;
        callback(that)
      })
    } else {
      that.data = data;
      callback(that);
    }
  });
}
module.exports = StyleSheet;
