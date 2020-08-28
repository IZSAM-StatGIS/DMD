import axios from 'axios';
import moment from 'moment';
import { selectedFeatures } from './map';

const getModisValues = (product, year) => {

    let selected_outbreaks = [];
    
    selectedFeatures.forEach(feature => {
        let coordinates = feature.getGeometry().clone().transform('EPSG:3857','EPSG:4326');
        selected_outbreaks.push({
            'id': feature.getProperties().ID_OUTBREAK,
            'country': feature.getProperties().COUNTRY_N,
            'species': feature.getProperties().DESC_SPECIE,
            'lng': coordinates.flatCoordinates[0],
            'lat': coordinates.flatCoordinates[1]
        })
    })

    // console.log(selected_outbreaks);
    
    let url = "https://webgis.izs.it/arcgis/rest/services/Modis/";
  
    if (product == 'lstd') {
      url += "MOD11C3_0_LSTD/ImageServer";
    } else if (product == 'lstn') {
      url += "MOD11C3_5_LSTN/ImageServer";
    } else if (product == 'ndvi') {
      url += "MOD13C2_0_NDVI/ImageServer";
    } else {
      url += "MOD13C2_1_EVI/ImageServer";
    }
    
    let data_arr = [];

    
    selected_outbreaks.forEach(otb => {
          
        axios.get(url + '/getSamples', {
            params: {
                geometry: '{"x":' + otb.lng + ',"y":' + otb.lat + '}',
                geometryType: 'esriGeometryPoint',
                spatialReference: '{"wkid":3857}',
                mosaicRule: {
                    mosaicMethod: "esriMosaicAttributes",
                    where: "Timeref >= DATE '01/01/" + year + "' AND Timeref <= DATE '01/12/" + year + "'",
                    sortField: "Timeref"
                },
                outFields: 'Name, Timeref',
                returnFirstValueOnly: 'false',
                f: 'json'
            }
        }).then(response => {
              
            let samples = response.data.samples;
            
            samples.forEach(sample => {
                let modis_name = sample.attributes.Name;
                let modis_time = moment(sample.attributes.Timeref).format('MM/YYYY');
                let modis_value = (sample.value*0.02)-273.15;
  
                let data_obj = {
                    'ID_OTB':otb.id,
                    'CNTR':otb.country,
                    'SPECIES':otb.species,
                    'MODIS_IMAGE':modis_name,
                    'MODIS_TIME':modis_time,
                    'MODIS_VALUE':modis_value.toFixed(2)
                };
  
                data_arr.push(data_obj)
               
            }); 
            
        });
    });
    
    return data_arr;
    
};
    
document.querySelector('#download-env-data-btn').addEventListener('click',(e)=>{
    let dt = getModisValues('lstd', '2020');
  
    setTimeout(function(){
        // Create table con i dati
        console.log(dt)
    },1500);
})


  