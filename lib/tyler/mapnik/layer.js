var _ = require('underscore');
var Base64 = {

// private property
_keyStr : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",

// public method for encoding
encode : function (input) {
    var output = "";
    var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
    var i = 0;

    input = Base64._utf8_encode(input);

    while (i < input.length) {

        chr1 = input.charCodeAt(i++);
        chr2 = input.charCodeAt(i++);
        chr3 = input.charCodeAt(i++);

        enc1 = chr1 >> 2;
        enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
        enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
        enc4 = chr3 & 63;

        if (isNaN(chr2)) {
            enc3 = enc4 = 64;
        } else if (isNaN(chr3)) {
            enc4 = 64;
        }

        output = output +
        this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) +
        this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);

    }

    return output;
},

// public method for decoding
decode : function (input) {
    var output = "";
    var chr1, chr2, chr3;
    var enc1, enc2, enc3, enc4;
    var i = 0;

    input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

    while (i < input.length) {

        enc1 = this._keyStr.indexOf(input.charAt(i++));
        enc2 = this._keyStr.indexOf(input.charAt(i++));
        enc3 = this._keyStr.indexOf(input.charAt(i++));
        enc4 = this._keyStr.indexOf(input.charAt(i++));

        chr1 = (enc1 << 2) | (enc2 >> 4);
        chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
        chr3 = ((enc3 & 3) << 6) | enc4;

        output = output + String.fromCharCode(chr1);

        if (enc3 != 64) {
            output = output + String.fromCharCode(chr2);
        }
        if (enc4 != 64) {
            output = output + String.fromCharCode(chr3);
        }

    }

    output = Base64._utf8_decode(output);

    return output;

},

// private method for UTF-8 encoding
_utf8_encode : function (string) {
    string = string.replace(/\r\n/g,"\n");
    var utftext = "";

    for (var n = 0; n < string.length; n++) {

        var c = string.charCodeAt(n);

        if (c < 128) {
            utftext += String.fromCharCode(c);
        }
        else if((c > 127) && (c < 2048)) {
            utftext += String.fromCharCode((c >> 6) | 192);
            utftext += String.fromCharCode((c & 63) | 128);
        }
        else {
            utftext += String.fromCharCode((c >> 12) | 224);
            utftext += String.fromCharCode(((c >> 6) & 63) | 128);
            utftext += String.fromCharCode((c & 63) | 128);
        }

    }

    return utftext;
},

// private method for UTF-8 decoding
_utf8_decode : function (utftext) {
    var string = "";
    var i = 0;
    var c = c1 = c2 = 0;

    while ( i < utftext.length ) {

        c = utftext.charCodeAt(i);

        if (c < 128) {
            string += String.fromCharCode(c);
            i++;
        }
        else if((c > 191) && (c < 224)) {
            c2 = utftext.charCodeAt(i+1);
            string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
            i += 2;
        }
        else {
            c2 = utftext.charCodeAt(i+1);
            c3 = utftext.charCodeAt(i+2);
            string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
            i += 3;
        }

    }

    return string;
}

}

// TODO refactor to throw on creation rather than on compile

var Layer = function(options){
  this.options = options
  this.srs = "+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +no_defs"  
  this.Datasource = { //globals go here
    type: "postgis",
  	host  : global.settings.db_host,
  	dbname: global.settings.db_base_name,
    user: global.settings.db_user,
    table: null,
    geometry_field: "the_geom_webmercator",
    extent: "-20005048.4188,-9039211.13765,19907487.2779,17096598.5401",
    srid: 3857,
    max_size: 1
  }
  
  this.initialize();
};

Layer.prototype.initialize = function(){
  if (_.isEmpty(this.options)) throw "layer must be built with user_id and layer_id in options options object";
  if (_.isNull(this.options.layer_id)) throw "layer id must not be null";
  if (_.isNull(this.options.user_id)) throw "user id must not be null";
  
  // Set Layer object up
  this.Datasource.dbname = _.template(this.Datasource.dbname, {user_id: this.options.user_id});
  
  if (!_.isUndefined(this.options.sql)){
    this.Datasource.table  = this.clean_sql(this.options.sql);  
  } else {
    this.Datasource.table  = this.options.layer_id;    
  }
  
  this.id = this.options.layer_id;
  this.name = this.options.layer_id;
  
  return;
};


Layer.prototype.clean_sql = function(sql){
  // sql = unescape(sql) 
  // sql = sql.replace(/\'/g,"&#39;"); 
  // sql = sql.replace(/\"/g,"&quot;");
  // sql = sql.replace(/</g,"&lt;");
  // sql = sql.replace(/>/g,"&gt;");
  // return sql
  return '<![CDATA[' + Base64.decode(sql) + ']]>'
}


Layer.prototype.compile = function(){
  var that = this;
  if (_.isNull(this.id)) throw "layer id must not be null";
  if (_.isNull(this.name)) throw "layer name must not be null";
  if (_.isNull(this.srs)) throw "layer srs must not be null";
  if (_.isEmpty(this.Datasource)) throw "layer datasource object must not be empty";
  
  var keys = ['type', 'host', 'dbname', 'user', 'table', 'geometry_field', 'extent', 'srid', 'max_size'];  
  var missing_keys = _.select(keys, function(value){ return !_.include(_.keys(that.Datasource), value); }); 
    
  if (missing_keys.length > 0){
    throw "datasource object must have all fields completed: " + missing_keys.join(", ")
  }
  
  return this;
}


module.exports = Layer;
