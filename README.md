# Tileserver for CartoDB that combines nodejs, mapnik, and postgis.


## Depends

* NodeJS > 0.2.4
* Mapnik (latest trunk >r2397)
* Npm 
* Cluster  
* Node-mapnik
* Connect

## for Development

* nodeunit

## Installation
  
  Install node:
  
    $ wget http://nodejs.org/dist/node-v0.4.3.tar.gz
    $ tar xvf node-v0.4.3.tar.gz
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
  
  Install cluster via npm:

    $ npm install cluster

  Install connect via npm:

    $ npm install connect

## Configuration

  Edit the postgis settings in 'server/settings.js' to match your system.
  
  Also, fixup the few hardcoded sample queries in 'public/index.html' to match your postgis tables.


## Usage

  
  Start the server by typing:
  
    $ ./run.sh
    
  Or:
  
    $ node app.js
    
  Then visit http://localhost:3000/. Choose a style type and a postgis subquery.


## A note on styles

  Mapnik supports applying arbitrary styles to layers, but for the results 
  to be reasonable you have to apply reasonable styles. For example a PointSymbolizer
  will work against either point geometries or polygon geometries, but a PolygonSymbolizer
  will not render anything if applied to point geometries.


  