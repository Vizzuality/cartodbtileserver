var path = require('path');
module.exports.styles = path.join(__dirname, '..', '..', 'app', 'styles');

// GENERAL APP CONSTANTS
module.exports.environment  = 'development';
module.exports.db_base_name = 'cartodb_dev_user_{user_id}_db';
module.exports.oneDay       = 86400000;

// PORTS 
module.exports.carto_port   = 3000;

// MAPNIK OPTIONS
module.exports.postgis = {
    'user'            : 'publicuser',
    'host'            : '127.0.0.1',
    'type'            : 'postgis',
    'geometry_field'  : 'the_geom',
    'srid'            : 3785,
    'extent'          : '-20005048.4188,-9039211.13765,19907487.2779,17096598.5401',    
    'max_size'        : 1    
};


// CARTO OPTIONS
module.exports.carto = {
    "srs": "+proj=mercs +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +no_defs",
    "Stylesheet": [{
			"id":"default.mss",
			"data":""
		}],
    "Layer": [{
        "id": "tile",
        "name": "xxx",
        "srs": "+proj=mercs +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +no_defs",
        "Datasource": {
            "type": "postgis",
						'host'  : '127.0.0.1',
						"dbname":"xxx",
            "user": "postgres",
            "table": "xxx",
            "geometry_field": "the_geom",
            "extent": "-20005048.4188,-9039211.13765,19907487.2779,17096598.5401",
            "srid": 3785,
            "max_size": 1
        }
    }]
}