Tyler. A simple nodejs postgis maptile server
==============================================

Depends
--------

* NodeJS > 0.4.4
* Mapnik (latest trunk >r2397)
* Node-mapnik
* Npm 
* Cluster > 0.5.3 
* Connect > 1.1.5
* Underscore.js > 1.1.5
* node-redis > 0.1.2

for Development
----------------

* expresso

Installation
------------- 	
  
Install node:

  $ wget http://nodejs.org/dist/node-v0.4.4.tar.gz
  $ tar xvf node-v0.4.4.tar.gz
  $ ./configure
  $ make
  $ make install

Install node-mapnik:

  $ git clone git://github.com/mapnik/node-mapnik.git
  $ cd node-mapnik
  $ ./configure
  $ make
  $ make install
  
Install npm (node package manager)

  $ curl http://npmjs.org/install.sh | sh

Install deps via npm:

  $ npm install cluster connect node-redis underscore

Configuration
--------------

Edit the postgis settings in 'config/environments/[environment].js' to match your system.
Also, fixup the few hardcoded sample queries in 'public/index.html' to match your postgis tables.


Usage
-----
  
Start the server by typing:
  
  $ node app.js development tyler_new
  
Then visit http://localhost:3000/. Choose a style type and a postgis table.


Todo
----

* Documentation
* Benchmarking framework
* pngnq to compress png24 to png8. Should test for filesizes being correct or not - child_process
* node 0.6 mesh network - distribute rendering?
* tile pipelineing over websockets to remove the http request cycle
* Authentication
 
