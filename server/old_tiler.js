var cluster = require('cluster');

cluster('./app/controllers/old_tiler')
  .use(cluster.logger('logs/tiler'))
  .use(cluster.pidfiles('pids/tiler'))
  .use(cluster.debug())
  .use(cluster.stats())
  .use(cluster.cli())
  .listen(3000);
