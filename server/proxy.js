// var cluster = require('cluster');
// 
// cluster('./app/controllers/proxy')
//   .use(cluster.logger('logs/proxy'))
//   .use(cluster.pidfiles('pids/proxy'))
//   .use(cluster.debug())
//   .use(cluster.stats())
//   .use(cluster.cli())
  
var cluster = require(__dirname  + '/../app/controllers/proxy');  
cluster.listen(3000);
