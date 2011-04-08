var path = require('path');

module.exports.styles   = path.join(__dirname, '..', 'app', 'styles');
module.exports.bad_tile = path.join(__dirname, '..', 'public', 'images') +  "/404_tile"
module.exports.oneDay   = 86400000;

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
						'host'  : 'xxx',
						"dbname":"xxx",
            "user": "xxx",
            "table": "xxx",
            "geometry_field": "the_geom_webmercator",
            "extent": "-20005048.4188,-9039211.13765,19907487.2779,17096598.5401",
            "srid": 3857,
            "max_size": 1
        }
    }]
}