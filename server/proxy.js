var cluster = require('cluster');

cluster('./app/controllers/proxy')
  .use(cluster.logger('logs/proxy'))
  .use(cluster.pidfiles('pids/proxy'))
  .use(cluster.debug())
  .use(cluster.stats())
  .use(cluster.cli())
  .listen(3000);
