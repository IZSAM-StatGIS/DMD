import axios from 'axios';
import lodash from 'lodash';
import GeoJSON from 'ol/format/GeoJSON';
import {fromLonLat, transform} from 'ol/proj';
// import Map from 'ol/Map';
// import View from 'ol/View';
import { map, outbreaks, distribution, distributionCharts } from './map';
import { drawOutbreaksChart } from './chart-otb';
import { populateOutbreaksGrid, populateDistributionGrid } from './tables'
// import { unique } from 'jquery';

// Services
const server = {
    url:    "https://webgis.izs.it/arcgis/rest/services/NetMed/NETMED/MapServer",
    image:  "https://webgis.izs.it/arcgis/rest/services/Modis",
    layers: {
        vector: {
            outbreaks:           { id:"0", zidx:"18" },
            distribution_aggreg: { id:"1", zidx:"17" },
            distribution:        { id:"2", zidx:"16" },
            admin_level_3:       { id:"3", zidx:"15" },
            admin_level_2:       { id:"4", zidx:"14" },
            admin_level_1:       { id:"5", zidx:"13" },
            admin_level_0:       { id:"6", zidx:"12" }
        },
        modis: {
            lstd: { id: "MOD11C3_0_LSTD" },
            lstn: { id: "MOD11C3_5_LSTN" },
            ndvi: { id: "MOD13C2_0_NDVI" },
            evi:  { id: "MOD13C2_1_EVI"  }
        }
    },
    tables:{
        // Nessuna tabella prevista    
    }
}

// Focolai
const getOutbreaks = (sql) => {
    // console.log('query otb', sql)
    axios.get(server.url+"/"+server.layers.vector.outbreaks.id+"/query",{ 
        params:{
            // token: server.token,
            where: sql,
            outFields: "*",
            orderByFields: "DATE_OF_START_OF_THE_EVENT",
            geometryPrecision: "3",
            outSR: "3857",
            f: "geojson"
        } 
    }).then(function(response){
        // Popola il layer degli outbreak
        populateOutbreaks(response.data);
        // Popola la grid degli outbreak
        populateOutbreaksGrid(response.data);
        // Mostra grafico
        drawOutbreaksChart(response.data);
    });
};

const populateOutbreaks = (data) => {
    outbreaks.getSource().clear();
    var featureCollection = new GeoJSON().readFeatures(data);
    outbreaks.getSource().addFeatures(featureCollection);
};

// Distribuzione
const getDistribution = (sql) => {
    // console.log('query distrib', sql);
    axios.get(server.url+"/"+server.layers.vector.distribution.id+"/query",{ 
        params:{
            // token: server.token,
            where: sql,
            outFields: "GEO_ID, FLAG_DISEASE, LATITUDE, LONGITUDE, COUNTRY_N, REG_NAME, admin_name",
            // orderByFields: "DATE_OF_START_OF_THE_EVENT",
            geometryPrecision: "3",
            outSR: "3857",
            f: "geojson"
        } 
    }).then(function(response){
        createUniquePolygons(response.data.features);
        summarizeDistribution(response.data.features);
    });
};

const summarizeDistribution = (distribution_data) => {

    distributionCharts.getSource().clear();

    let data = [];
    distribution_data.forEach(feature => {
      let geoid = feature.properties.GEO_ID;
      let flag  = feature.properties.FLAG_DISEASE;
      let lat   = feature.properties.LATITUDE;
      let lng   = feature.properties.LONGITUDE;
      data.push( { "geoid" : geoid, "flag": flag, "lng": lng.toFixed(3), "lat": lat.toFixed(3) } );
    });

    let grouped_data = [];
    grouped_data = lodash.groupBy(data,"geoid");
    let centroids = [];
    let unique_geoids = [];
    lodash.forEach(grouped_data,function(item, key){

      let num_u  = lodash.filter(item, function(el) { return el.flag == "U"; }).length;
      let num_c  = lodash.filter(item, function(el) { return el.flag == "C"; }).length;
      let num_v  = lodash.filter(item, function(el) { return el.flag == "V"; }).length;
      let num_un = lodash.filter(item, function(el) { return el.flag == null; }).length;
      let num_tot = num_u + num_c + num_v + num_un;

      let feature = {
        "type":"Feature",
        "geometry":{
          "type": "Point", 
          "coordinates": new transform([ 
            parseFloat(item[0].lng), 
            parseFloat(item[0].lat) 
          ],'EPSG:4326','EPSG:3857')
        },
        "properties":{
          "geoid": key, 
          "human": num_u,
          "animals": num_c,
          "viral": num_v,
          "unknown": num_un,
          "tot": num_tot
        }
      };
      centroids.push(feature);
    });

    // Popola il layer dei centroidi di distribuzione
    let collection = {"type": "FeatureCollection", "features": centroids};
    var featureCollection = new GeoJSON().readFeatures(collection);
    distributionCharts.getSource().addFeatures(featureCollection);
};

const createUniquePolygons = (distribution_data) => {
    distributionCharts.getSource().clear();
    // Cerca i poligoni con GEO_ID uguale e ne lascia solo uno
    let unique_polygons = lodash.uniqBy(distribution_data, 'properties.GEO_ID');
    // console.log(unique_polygons);
    // Popola il layer dei della distribuzione
    let collection = {"type": "FeatureCollection", "features": unique_polygons};
    let featureCollection = new GeoJSON().readFeatures(collection);
    distribution.getSource().addFeatures(featureCollection);
};

const getDistributionDetails = (geoid) => {
    axios.get(server.url+"/"+server.layers.vector.distribution.id+"/query",{ 
        params:{
            where: "GEO_ID = '"+geoid+"'",
            outFields: "*",
            // orderByFields: "DATE_OF_START_OF_THE_EVENT",
            returnGeometry: false,
            f: "json"
        } 
    }).then(function(response){
        console.log(response.data.features);
    });
};


export { server, getOutbreaks, populateOutbreaks, getDistribution, getDistributionDetails }