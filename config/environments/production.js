module.exports.environment  = 'production';
module.exports.db_base_name = 'cartodb_user_{user_id}_db';
module.exports.carto_port   = 8080;

// MAPNIK OPTIONS
module.exports.postgis = {
    'user'            : 'postgres',
    'host'            : '10.211.14.63'
};