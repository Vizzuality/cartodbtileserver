module.exports.environment  = 'development';
module.exports.db_base_name = 'cartodb_dev_user_<%= user_id %>_db';
module.exports.db_user      = 'postgres';
module.exports.db_host      = 'localhost';
module.exports.redis_host   = '127.0.0.1';
module.exports.redis_port   = 6379;
module.exports.carto_port   = 8080;