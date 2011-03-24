var cluster = require('cluster');

cluster('./server/app')
  .use(cluster.logger('logs'))
  .use(cluster.pidfiles('pids'))
//  .use(cluster.reload(['server','test','app.js']))
  .use(cluster.debug())
  .use(cluster.stats())
  .use(cluster.cli())
  .use(cluster.repl(8888))
  .listen(3000);
