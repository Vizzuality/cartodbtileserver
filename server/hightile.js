var cluster = require('cluster');

cluster('./app/controllers/hightile')
  .use(cluster.logger('logs/tiler'))
  .use(cluster.pidfiles('pids/tiler'))
  .use(cluster.debug())
  .use(cluster.stats())
//  .use(cluster.cli())
  .listen(global.environment.carto_port);


// var cluster = require('../app/controllers/hightile');
// cluster.listen(3000);