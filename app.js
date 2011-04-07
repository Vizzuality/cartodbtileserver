/*
* HighTile loader
* ===============
*
* node app [environment] [server]
*
* environments: [development, production] 
* servers: [proxy, tiler]
*
*/

// sanity check arguments
var ENV = process.argv[2]
var APP = process.argv[3]
if ((ENV != 'development' && ENV != 'production') || (APP != 'proxy' && APP != 'tiler')){
  console.error("\nnode app [environment] [server]");
  console.error("environments: [development, production], servers: [proxy, tiler]\n");
  process.exit(1);
}

// set Node.js app settings and boot
global.settings = require(__dirname + '/config/environments/' + ENV)
require('./server/' + APP);





