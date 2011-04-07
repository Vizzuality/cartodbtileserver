module.exports.environment  = 'development';
module.exports.db_base_name = 'cartodb_dev_user_{user_id}_db';
module.exports.carto_port   = 3000;

// MAPNIK OPTIONS
module.exports.postgis = {
    'user'            : 'publicuser',
    'host'            : '127.0.0.1'
};
