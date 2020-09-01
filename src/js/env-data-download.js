import $ from 'jquery';
import axios from 'axios';
import moment from 'moment';
import Tabulator from 'tabulator-tables';
import { server } from './data';
import { selectedFeatures } from './map';
import { grid_dateFormatter, dateAccessor } from './tables';

const env_grid_info = document.querySelector('#environment-grid-info');

$('#downloadModal').on('shown.bs.modal', function () {
    if (envDataGrid) { envDataGrid.clearData(); }
    env_grid_info.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Retrieving environmental data...';
    $('#env_download_year').empty();
    downloadYearsList();
});

const downloadYearsList = () => {
    // Crea lista degli ultimi 10 anni a partire dall'anno in corso 
    let max = new Date().getFullYear(),
        min = max - 10,
        select = document.getElementById('env_download_year');

    let years = []
    for (var i = min; i<=max; i++) {
        years.push(i);
    }

    years.reverse();

    years.forEach(year =>{
        var opt = document.createElement('option');
        opt.value = year;
        opt.innerHTML = year;
        select.appendChild(opt);
    });

    setTimeout(()=>{ 
        $('#env_download_year').selectpicker('val',max);
        $('#env_download_year').selectpicker('refresh'); 
    },100);

    setTimeout(()=>{
        showPreviewGrid();
    },500);
};

document.querySelector('#env_download_product').addEventListener('change',(e)=>{
    showPreviewGrid();
});

document.querySelector('#env_download_year').addEventListener('change',(e)=>{
    showPreviewGrid();
});

const getModisValues = (product, year) => {

    let selected_outbreaks = [];
    
    selectedFeatures.forEach(feature => {
        let coordinates = feature.getGeometry().clone().transform('EPSG:3857','EPSG:4326');
        selected_outbreaks.push({
            'country': feature.getProperties().COUNTRY_N,
            'region': feature.getProperties().REG_NAME,
            'admin': feature.getProperties().ADMIN_NAME,
            'source': feature.getProperties().DESC_SOURCE,
            'id': feature.getProperties().ID_OUTBREAK,
            'start_date': feature.getProperties().DATE_OF_START_OF_THE_EVENT,
            'confirm_date': feature.getProperties().DATE_OF_1ST_CONFIRMATION,
            'disease': feature.getProperties().DISEASE_DESC,
            'species': feature.getProperties().DESC_SPECIE,
            'subtype': feature.getProperties().DESC_SUBTYPE,
            'cases': feature.getProperties().NUM_CASES_OUTB_SPE,
            'susceptible': feature.getProperties().NUM_SUSCEPTIBLE,
            'deaths': feature.getProperties().NUM_DEATHS,
            'destroyed': feature.getProperties().NUM_DESTROYED,
            'slaughtered': feature.getProperties().NUM_SLAUGHTERED,
            'lng': coordinates.flatCoordinates[0],
            'lat': coordinates.flatCoordinates[1]
        })
    })

    // console.log(selected_outbreaks);
    
    let url = server.image+'/'
  
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
        // console.log(otb);
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
                let modis_year = moment(sample.attributes.Timeref).format('YYYY');
                let modis_month = moment(sample.attributes.Timeref).format('MM');
                let modis_value_norm;
                if (product == 'lstd' || product == 'lstn'){
                    modis_value_norm = (sample.value*0.02)-273.15;
                } else {
                    modis_value_norm = sample.value*0.0001;
                }
                
                let data_obj = {
                    'CNTR': otb.country,
                    'REGION': otb.region,
                    'ADMIN': otb.admin,
                    'LAT': otb.lat.toFixed(5),
                    'LNG': otb.lng.toFixed(5),
                    'SOURCE': otb.source,
                    'ID_OTB': otb.id,
                    'START_DT': otb.start_date,
                    'CONFIRM_DT': otb.confirm_date,
                    'DISEASE': otb.disease,
                    'SPECIES': otb.species,
                    'SUBTYPE': otb.subtype,
                    'CASES': otb.cases,
                    'SUSCEPTIBLE': otb.susceptible,
                    'DEATHS': otb.deaths,
                    'DESTROYED': otb.destroyed,
                    'SLAUGHTERED': otb.slaughtered,
                    'MODIS_IMAGE': modis_name.substring(0, 7)+modis_name.substring(16, 18),
                    'MODIS_YEAR': modis_year,
                    'MODIS_MONTH': modis_month,
                    'MODIS_DAY': modis_name.substring(13, 16),
                    'MODIS_VALUE_NORM': modis_value_norm.toFixed(2)
                };
  
                data_arr.push(data_obj)
               
            }); 
            
        });
    });
    
    return data_arr;
    
};
    
const showPreviewGrid = () => {

    env_grid_info.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Retrieving environmental data...';
    
    document.querySelector('#env_download_product').disabled = true;
    document.querySelector('#env_download_year').disabled = true;
    document.querySelector('#download-env-data-btn').disabled = true;
    $('#env_download_product,#env_download_year').selectpicker('refresh');

    let prod = document.querySelector('#env_download_product').value;
    let year = document.querySelector('#env_download_year').value;

    let data = getModisValues(prod, year);

    setTimeout(()=>{
        // Crea tabella di preview da scaricare
        createEnvDataGrid(data);
        env_grid_info.innerHTML = '<i class="fas fa-check text-success"></i> Environmental data for selected outbreaks [<strong>'+envDataGrid.getData().length+ '</strong> rows]';
        document.querySelector('#env_download_product').disabled = false;
        document.querySelector('#env_download_year').disabled = false;
        document.querySelector('#download-env-data-btn').disabled = false;
        $('#env_download_product,#env_download_year').selectpicker('refresh');
    }, 10000);
};

let envDataGrid;
const createEnvDataGrid = (tableData) => {
    
    // console.log(tableData);
    envDataGrid = new Tabulator("#environment-grid", {
        height: 250, 
        data: tableData, //assign data to table
        placeholder: "No Data Available",
        layout: "fitColumns", //fit columns to width of table (optional)
        columns:[ //Define Table Columns
            {title:"Country", field:"CNTR", visible: false, download:true},
            {title:"Region", field:"REGION", visible: false, download:true},
            {title:"Admin unit", field:"ADMIN", visible: false, download:true},
            {title:"Lat", field:"LAT", visible: false, download:true},
            {title:"Lng", field:"LNG", visible: false, download:true},
            {title:"Source", field:"SOURCE", visible: false, download:true},
            {title:"Outbreak", field:"ID_OTB", sorter: "string"},
            {title:"Start date", field:"START_DT", formatter: grid_dateFormatter, accessorParams:{}, accessor:dateAccessor, visible: false, download:true },
            {title:"Confirm date", field:"CONFIRM_DT", formatter: grid_dateFormatter, accessorParams:{}, accessor:dateAccessor, visible: false, download:true },
            {title:"Disease", field:"DISEASE", visible: false, download:true},
            {title:"Species", field:"SPECIES", visible: false, download:true},
            {title:"Subtype", field:"SUBTYPE", visible: false, download:true},
            {title:"Cases", field:"CASES", visible: false, download:true},
            {title:"Susceptible", field:"SUSCEPTIBLE", visible: false, download:true},
            {title:"Deaths", field:"DEATHS", visible: false, download:true},
            {title:"Destroyed", field:"DESTROYED", visible: false, download:true},
            {title:"Slaughtered", field:"SLAUGHTERED", visible: false, download:true},
            {title:"MODIS Name", field:"MODIS_IMAGE"},
            {title:"MODIS Year", field:"MODIS_YEAR", visible: false, download:true},
            {title:"MODIS Month", field:"MODIS_MONTH", sorter: "number"},
            {title:"MODIS Day", field:"MODIS_DAY"},
            {title:"MODIS Value", field:"MODIS_VALUE_NORM"}
        ],
        initialSort:[
            {column:"MODIS_MONTH", dir:"asc"},
            {column:"ID_OTB", dir:"desc"}
        ]
    });

    envDataGrid.replaceData(tableData);

};

document.querySelector('#download-env-data-btn').addEventListener('click',(e)=>{
    envDataGrid.download("csv", "environmental_data.csv", {delimiter: ","});
});





  