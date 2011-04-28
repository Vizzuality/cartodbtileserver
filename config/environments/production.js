module.exports.environment  = 'production';
module.exports.db_base_name = 'cartodb_user_<%= user_id %>_db';
module.exports.db_user      = 'postgres';
module.exports.db_host      = '10.211.14.63';
module.exports.redis_host   = '10.211.14.63';
module.exports.redis_port   = 6379;
module.exports.carto_port   = 8080;