var path = require('path');

module.exports.styles = path.join(__dirname,'styles');

module.exports.postgis = {
    'dbname' : 'cartodb_dev_user_1_db',
    'host'   : '127.0.0.1',
    'extent' : '-20005048.4188,-9039211.13765,19907487.2779,17096598.5401',
    'geometry_field' : 'the_geom',
    'srid' : 3785,
    'user' : 'publicuser',
    'max_size' : 1,
    'type' : 'postgis'
};


