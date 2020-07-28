import axios from 'axios';
import GeoJSON from 'ol/format/GeoJSON';
import Map from 'ol/Map';
import View from 'ol/View';
import { map, outbreaks } from './map';
import { drawOutbreaksChart } from './chart-otb';
import { populateOutbreaksGrid, populateDistributionGrid } from './tables'

// Services
const server = {
    url:    "https://webgis.izs.it/arcgis/rest/services/NetMed/NETMED/MapServer",
    image:  "https://webgis.izs.it/arcgis/rest/services/Modis",
    layers: {
        vector: {
            outbreaks:           { id:"0", zidx:"16" },
            distribution_aggreg: { id:"1", zidx:"15" },
            distribution:        { id:"2", zidx:"14" },
            admin_level_3:       { id:"3", zidx:"13" },
            admin_level_2:       { id:"4", zidx:"12" },
            admin_level_1:       { id:"5", zidx:"11" },
            admin_level_0:       { id:"6", zidx:"10" }
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
    // console.log(sql)
    axios.get(server.url+"/"+server.layers.vector.outbreaks.id+"/query",{ 
        params:{
            token: server.token,
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

};

export { server, getOutbreaks, populateOutbreaks, getDistribution }