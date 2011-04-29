var cluster = require('cluster');

cluster('./app/controllers/tyler_new')
  .use(cluster.logger('logs/tiler'))
  .use(cluster.pidfiles('pids/tiler'))
  .use(cluster.debug())
  .use(cluster.stats())
  .set('workers', 2)
//  .use(cluster.cli())
  .listen(global.environment.carto_port);


// var cluster = require('../app/controllers/tyler');
// cluster.listen(3000);