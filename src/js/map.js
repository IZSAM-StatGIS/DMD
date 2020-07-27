import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import { fromLonLat, getTransform } from 'ol/proj';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import GeoJSON from 'ol/format/GeoJSON';
import VectorImageLayer from 'ol/layer/VectorImage';
import VectorSource from 'ol/source/Vector';
import { Fill, Stroke, Style, Text, Image, Circle } from 'ol/style';

import { server } from './data';

// Mappa
var map = new Map({
  layers: [
    new TileLayer({
      source: new OSM()
    })
  ],
  target: 'map',
  view: new View({
    center: fromLonLat([14.162352, 42.1457401]),
    zoom: 4
  })
});

// Outbreaks layer
const otbStyle = new Style({
  image: new Circle({
      radius: 6,
      fill: new Fill({color:'#FF0000'}),
      stroke: new Stroke({color:'#CC0000', width: 1})
  })
})

const outbreaks = new VectorImageLayer({
  source: new VectorSource({
      format: new GeoJSON()
  }),
  style: otbStyle
});
map.addLayer(outbreaks);
outbreaks.set('name','Outbreaks');
outbreaks.setZIndex(server.layers.vector.outbreaks.zidx);

export { map, outbreaks };