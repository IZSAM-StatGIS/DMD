import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import { fromLonLat, getTransform } from 'ol/proj';
import {DragBox, Select} from 'ol/interaction';
import {OSM, ImageArcGISRest, TileArcGISRest} from 'ol/source';
import XYZ from 'ol/source/XYZ';
import GeoJSON from 'ol/format/GeoJSON';
import VectorImageLayer from 'ol/layer/VectorImage';
import VectorSource from 'ol/source/Vector';
import { Group as LayerGroup, Tile as TileLayer, Image as ImageLayer } from 'ol/layer';
import { Fill, Stroke, Style, Text, Image, Circle } from 'ol/style';
import moment from 'moment';
import { server } from './data';
import { outbreaksGrid } from './tables';
import { populateSelectedOtbList } from './env-data-analysis';

// *********************************************************
// Mappa
// *********************************************************
var map = new Map({
  target: 'map',
  view: new View({
    center: fromLonLat([14.162352, 42.1457401]),
    zoom: 4
  })
});

// *********************************************************
// Basemap
// *********************************************************
let baselayer = new TileLayer({
  source: new OSM()
});
map.addLayer(baselayer);
baselayer.setZIndex(10);

// *********************************************************
// Outbreaks layer
// *********************************************************
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
outbreaks.setOpacity(0.8);
outbreaks.setZIndex(server.layers.vector.outbreaks.zidx);

// *********************************************************
// Distribution layer
// *********************************************************
const dstStyle = new Style({
  image: new Circle({
      radius: 6,
      fill: new Fill({color:'#FF0000'}),
      stroke: new Stroke({color:'#CC0000', width: 1})
  })
})

const distribution = new VectorImageLayer({
  source: new VectorSource({
      format: new GeoJSON()
  }),
  style: dstStyle
});
map.addLayer(distribution);
distribution.set('name','Distribution');
distribution.setOpacity(0.8);
distribution.setZIndex(server.layers.vector.distribution_aggreg.zidx);

// *******************************************
// MODIS Layer
// *******************************************
let modisSource, modisLayer;
const activateModis = (selected_modis) => {

  let image_url;

  if (selected_modis == 'lstd') {
    image_url = server.image+"/"+server.layers.modis.lstd.id+"/ImageServer"
  } else if (selected_modis == 'lstn') {
    image_url = server.image+"/"+server.layers.modis.lstn.id+"/ImageServer"
  } else if (selected_modis == 'ndvi'){
    image_url = server.image+"/"+server.layers.modis.ndvi.id+"/ImageServer"
  } else {
    image_url = server.image+"/"+server.layers.modis.evi.id+"/ImageServer"
  }

  let modisdateStr = document.querySelector("#timewindow-info").textContent.split(' - ')[1];
  let modisstart   = moment('01 '+modisdateStr,'DD MMMM YYYY').valueOf();
  let modisend     = moment('01 '+modisdateStr,'DD MMMM YYYY').add(1,'month').valueOf();
  let modisinterval= modisstart.toString()+","+modisend.toString();

  console.log(modisinterval);

  modisSource = new ImageArcGISRest({
    ratio: 1,
    params: {
      // TIME: "1420066800000,1422745200000",
      TIME: modisinterval
    },
    url: image_url
    
  });
  
  modisLayer = new ImageLayer({
    source: modisSource
  });
  modisLayer.set('name','MODIS');
  modisLayer.setZIndex(11);
  let modisOpacity = document.querySelector('#modis-opacity-slider').value / 10
  modisLayer.setOpacity(modisOpacity);
  
  
  modisSource.on('imageloadstart', function() {
    document.getElementById('modis-loading').innerHTML = ' <i class="fas fa-spinner fa-spin"></i> Loading...'
  });
  
  modisSource.on('imageloadend', function() {
    document.getElementById('modis-loading').innerHTML = ''
  });
  
  map.addLayer(modisLayer);

}

const updateModis = () => {
  let modisdateStr = document.querySelector("#timewindow-info").textContent.split(' - ')[1];
  let modisstart   = moment('01 '+modisdateStr,'DD MMMM YYYY').valueOf();
  let modisend     = moment('01 '+modisdateStr,'DD MMMM YYYY').add(1,'month').valueOf();
  let modisinterval= modisstart.toString()+","+modisend.toString();
  let activeLayers = map.getLayers();
  activeLayers.forEach(layer => {
    if (layer.get('name') == 'MODIS') {
      // console.log(layer.get('name'))
      modisLayer.getSource().updateParams({TIME:modisinterval});
    } else {
      // console.log('Nessun MODIS sulla mappa')
    }
  })
  
};

const deactivateModis = () => {
  map.removeLayer(modisLayer);
};

// *********************************************************
// Selezione feature dal layer degli outbreaks
// *********************************************************

// Selezione 
//    Per attivare anche la selezione col click sul punto (una feature alla volta) lasciare la selezione attiva in modo predefinito 
//    rimuovendo select.setActive(false) e select.setActive(true)
//    N.B. E' comunque possibile selezionare un singolo outbreak utilizzando il dragbox su un solo elemento

const select = new Select();
map.addInteraction(select);
let selectedFeatures = select.getFeatures();
select.setActive(false);

// Selezione dragbox (feature multiple)
const dragBox = new DragBox();
map.addInteraction(dragBox);
dragBox.setActive(false);

document.querySelector('#select-btn').addEventListener('click',(e)=>{
  document.documentElement.style.cursor = "crosshair";
  dragBox.setActive(true);
});

document.querySelector('#deselect-btn').addEventListener('click',(e)=>{
  selectedFeatures.clear();
  outbreaksGrid.deselectRow();
});

dragBox.on('boxstart', () => {
  selectedFeatures.clear();
  outbreaksGrid.deselectRow();
  select.setActive(true);
});

dragBox.on('boxend',() => {

  let extent = dragBox.getGeometry().getExtent();
  outbreaks.getSource().forEachFeatureIntersectingExtent(extent, function (feature) {
    selectedFeatures.push(feature);
  });

  dragBox.setActive(false);
  select.setActive(false);

  document.documentElement.style.cursor = "default";

});

selectedFeatures.on(['add', 'remove'], function () {
  let id_outbreaks = selectedFeatures.getArray().map(function (feature) {
    return feature.get('ID_OUTBREAK');
  });

  if (id_outbreaks.length > 0) {
    // console.log(id_outbreaks.join(', '));
    id_outbreaks.forEach(otb => {
      outbreaksGrid.selectRow(outbreaksGrid.getRows().filter(row => row.getData().ID_OUTBREAK == otb));
    });
    document.querySelector('#otb-grid-download-selected').classList.remove('disabled');
    document.querySelector('#otb-grid-download-selected-env').classList.remove('disabled');
  } else {
    // console.log('No outbreaks selected');
    outbreaksGrid.deselectRow();
    outbreaksGrid.clearFilter();
    document.querySelector('#otb-grid-download-selected').classList.add('disabled');
    document.querySelector('#otb-grid-download-selected-env').classList.add('disabled');
  }
  document.querySelector('#otb-grid-selected-count').innerHTML = outbreaksGrid.getSelectedData().length;

  populateSelectedOtbList();
  
});

// *********************************************************
// On pointer move
// *********************************************************
map.on('pointermove', function(e) {
	if (e.dragging) return;
    var pixel = e.map.getEventPixel(e.originalEvent);
    var hit = e.map.forEachFeatureAtPixel(pixel, function (feature, layer) {
    	if (layer){
    		return layer.get('name') === 'Outbreaks' || layer.get('name') === 'Distribution';
    	}
    });
    e.map.getTargetElement().style.cursor = hit ? 'pointer' : '';
});


// *********************************************************
// Basemap selector
// *********************************************************
document.querySelector("#basemap-selector").addEventListener('change', (e) => {
  var basemaps = document.querySelector("#basemap-selector");
  var selected_basemap = basemaps.options[basemaps.selectedIndex].value;
  // console.log(selected_basemap);
  if (baselayer){ 
  map.removeLayer(baselayer); 
  }
  
  if (selected_basemap == "topo" ){
      baselayer = new TileLayer({
          source: new XYZ ({
              attributions: 'Tiles &copy; <a href="https://services.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer">Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community</a>',
              url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}'
          })
      });
  } else if (selected_basemap == "osm"){
      baselayer = new TileLayer({
        source: new OSM()
      });
  } else if (selected_basemap == "sat"){
      let labels = new TileLayer({
        source: new XYZ({
            url: 'https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}'
        })
      });
    let imagery = new TileLayer({
      source: new XYZ({
        attributions: 'Tiles &copy; <a href="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer">Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community</a>',
        url: 'http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
      })
    });
    baselayer = new LayerGroup({layers: [imagery,labels]});
  }

  map.addLayer(baselayer);

});

export { map, outbreaks, distribution, modisLayer, selectedFeatures, activateModis, updateModis, deactivateModis };

