import $ from 'jquery';
import axios from 'axios';
import moment from 'moment';
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
            'lng': coordinates.flatCoordinates[0],
            'lat': coordinates.flatCoordinates[1]
        });
    });
    // console.log(selected_outbreaks);
    selected_outbreaks.forEach(otb => {
        var opt = document.createElement('option');
        opt.value = [otb.lng,otb.lat];
        opt.innerHTML = otb.id;
        select.appendChild(opt);
    });
    setTimeout(()=>{ 
        if (selected_outbreaks.length > 0){
            document.querySelector('#otb-selector').disabled = false;
            document.querySelector('#run-analysis-btn').disabled = false;
            document.querySelector('#clear-analysis-btn').disabled = false;
        } else {
            document.querySelector('#otb-selector').disabled = true;
            document.querySelector('#run-analysis-btn').disabled = true;
            document.querySelector('#clear-analysis-btn').disabled = true;
        }
        $('#otb-selector').selectpicker('refresh'); 
    },100);
};

$('#run-analysis-btn').click((e)=>{
    let selection = $('#otb-selector').val();
    let sel_lng = selection.split(',')[0];
    let sel_lat = selection.split(',')[0];
    let sel_otb = $('#otb-selector option:selected').text();

    console.log(`${sel_lng}, ${sel_lat}, ${sel_otb}`);

    $('#env-analysis-res-container').show();
});

$('#clear-analysis-btn').click((e)=>{
    $('#env-analysis-res-container').hide();
});

export { populateSelectedOtbList };