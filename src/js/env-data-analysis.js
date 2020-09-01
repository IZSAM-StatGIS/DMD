import $, { data } from 'jquery';
import axios from 'axios';
import moment from 'moment';
import lodash from 'lodash';
import Tabulator from 'tabulator-tables';
import { server } from './data';
import { selectedFeatures } from './map';

$('#env-analysis-res-container').hide();

const populateSelectedOtbList = () => {
    $('#otb-selector').empty()
    let select = document.querySelector('#otb-selector');
    let selected_outbreaks = [];
    selectedFeatures.forEach(feature => {
        let coordinates = feature.getGeometry().clone().transform('EPSG:3857','EPSG:4326');
        selected_outbreaks.push({
            'id': feature.getProperties().ID_OUTBREAK,
            'start_date': moment(feature.getProperties().DATE_OF_START_OF_THE_EVENT).format('MM/YYYY'),
            'lng': coordinates.flatCoordinates[0],
            'lat': coordinates.flatCoordinates[1]
        });
    });
    // console.log(selected_outbreaks);
    selected_outbreaks.forEach(otb => {
        var opt = document.createElement('option');
        opt.value = [otb.lng,otb.lat,otb.start_date];
        opt.innerHTML = otb.id;
        select.appendChild(opt);
    });
    setTimeout(()=>{ 
        if (selected_outbreaks.length > 0){
            document.querySelector('#otb-selector').disabled = false;
            document.querySelector('#analysis-type').disabled = false;
            document.querySelector('#run-analysis-btn').disabled = false;
            document.querySelector('#clear-analysis-btn').disabled = false;
        } else {
            document.querySelector('#otb-selector').disabled = true;
            document.querySelector('#analysis-type').disabled = true;
            document.querySelector('#run-analysis-btn').disabled = true;
            document.querySelector('#clear-analysis-btn').disabled = true;
        }
        $('#otb-selector, #analysis-type').selectpicker('refresh'); 
    },100);
};

$('#run-analysis-btn').click((e)=>{
    let selection = $('#otb-selector').val();
    let sel_lng  = selection.split(',')[0];
    let sel_lat  = selection.split(',')[1];
    let sel_date = selection.split(',')[2];
    let sel_otb = $('#otb-selector option:selected').text();

    // console.log(`${sel_lng}, ${sel_lat}, ${sel_otb}, ${sel_date}`);

    let analysis = $('#analysis-type').val();
    let analysis_end_month;
    if (analysis == 'otb-start') {
        analysis_end_month = sel_date;
    } else {
        analysis_end_month = moment($('#enddate').val(),'DD/MM/YYYY').format('MM/YYYY');
    }
    let analysis_start_month = moment(moment(analysis_end_month,'MM/YYYY').subtract(5,'months').valueOf()).format('MM/YYYY');

    // console.log(`Analysis starts at: ${analysis_start_month}, Analisys ends at: ${analysis_end_month}`);

    let urls = [
        server.image+'/MOD11C3_0_LSTD/ImageServer',
        server.image+'/MOD11C3_5_LSTN/ImageServer',
        server.image+'/MOD13C2_0_NDVI/ImageServer',
        server.image+'/MOD13C2_1_EVI/ImageServer'
    ];

    let data_arr = [];
    urls.forEach(url => {
        axios.get(url+'/getSamples',{
            params: {
                geometry: '{"x":' + sel_lng + ',"y":' + sel_lat + '}',
                geometryType: 'esriGeometryPoint',
                spatialReference: '{"wkid":4326}',
                mosaicRule: {
                    mosaicMethod: "esriMosaicAttributes",
                    where: "Timeref >= DATE '01/"+analysis_start_month+"' AND Timeref <= DATE '01/"+analysis_end_month+"'",
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
                modis_name = modis_name.substring(19,modis_name.length)
                let modis_date = moment(sample.attributes.Timeref).format('MM/YYYY');
                let modis_value_norm;
                if (modis_name.includes('LSTD') || modis_name.includes('LSTN')){
                    modis_value_norm = (sample.value*0.02)-273.15;
                } else {
                    modis_value_norm = sample.value*0.0001;
                }
                let data_obj = {
                    'MODIS':modis_name,
                    'DATE':modis_date,
                    'VALUE':modis_value_norm.toFixed(2)
                };
                data_arr.push(data_obj);
            })

        });
    });

    setTimeout(()=>{
        $('#env-analysis-res-container').show();   
        showAnalysisGrid(data_arr); 
    },250)

});

const showAnalysisGrid = (data) => {
    let tableData = [];
    let grouped = lodash.groupBy(data,'DATE');
    lodash.forEach(grouped,(item, key) => {
        let obj = { 
            DATE: key, 
            LSTD: item.filter(o => o.MODIS == 'LSTD')[0].VALUE,
            LSTN: item.filter(o => o.MODIS == 'LSTN')[0].VALUE,
            NDVI: item.filter(o => o.MODIS == 'NDVI')[0].VALUE,
            EVI:  item.filter(o => o.MODIS == 'EVI' )[0].VALUE
        }
        tableData.push(obj);
    })
    // console.log(tableData);
    let envAnalysisGrid = new Tabulator("#env-analysis-grid", {
        height: 205, 
        data: tableData,
        placeholder: "No Data Available",
        layout: "fitColumns",
        columns:[ 
            {title:"Date", field:"DATE"},
            {title:"LSTD", field:"LSTD"},
            {title:"LSTN", field:"LSTN"},
            {title:"NDVI", field:"NDVI"},
            {title:"EVI",  field:"EVI"},
        ],
        initialSort:[
            {column:"DATE", dir:"asc"}
        ]
    });

    envAnalysisGrid.replaceData(tableData);

};

$('#clear-analysis-btn').click((e)=>{
    $('#env-analysis-res-container').hide();
});

export { populateSelectedOtbList };