#!/usr/bin/env node

/*
* HighTile loader
* ===============
*
* node app [environment] [server]
*
* environments: [development, production] 
* servers: [hightile]
*
*/
var _ = require('underscore');

// sanity check arguments
var ENV = process.argv[2]
var APP = process.argv[3]
if ((ENV != 'development' && ENV != 'production') || (APP != 'hightile' )){
  console.error("\nnode app [environment] [server]");
  console.error("environments: [development, production], servers: [hightile]\n");
  process.exit(1);
}

// set Node.js app settings and boot
global.settings     = require(__dirname + '/config/settings')
global.environment  = require(__dirname + '/config/environments/' + ENV)
_.extend(global.settings, global.environment)
 
require('./server/' + APP);





