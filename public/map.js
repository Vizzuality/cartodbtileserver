var po = org.polymaps;

var map = po.map()
    .container(document.getElementById('map').appendChild(po.svg('svg')))
    .center({lat: 0, lon: 0})
    .zoom(1)
    .zoomRange([1, 20])
    .add(po.drag())
    .add(po.interact())
    .add(po.dblclick())
    .add(po.hash());

// mapquest's mapnik tiles
map.add(po.image()
    // .url(po.url('http://otile{S}.mqcdn.com/tiles/1.0.0/osm/'
    // + '{Z}/{X}/{Y}.png')
    .url(po.url('http://{S}.tile.cloudmade.com/BC9A493B41014CAABB98F0471D759707/1/256/{Z}/{X}/{Y}.png')
    .hosts(['a', 'b', 'c'])));


var tile_url = '/tiles/{X}/{Y}/{Z}';

// local tile server
var layer = po.image()
              .url(po.url(tile_url + '/1/madrid_bars/point'));

map.add(layer);


var setVal = function(value)
{
    document.getElementById('q').value = value;
    update_tiles();
}

var update_tiles = function() {
  var style = 'point';
  var sql = document.getElementById('q').value;
  if (!sql)
      sql = 'madrid_bars';
  if (document.forms[0][0].checked)
     style = 'point';
  if (document.forms[0][1].checked)
     style = 'polygon';
  if (document.forms[0][2].checked)
     style = 'line';
  layer.url(po.url(tile_url + '/1/' + escape(sql) + '/' + style))
     .reload();
  console.log(sql);
};
