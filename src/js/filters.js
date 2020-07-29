import $ from 'jquery';
import moment from 'moment';
import { Datepicker } from 'vanillajs-datepicker';
import { getOutbreaks, getDistribution } from './data';
import { setTimeWindow, setTimeFilter } from './time';


// Selezione di tutte le malattie all'avvio
$('#disease').selectpicker('selectAll');

// Configurazione datepicker start date
const start_date_input = document.querySelector('#startdate');
start_date_input.value = moment().subtract(1,'years').format('DD/MM/YYYY');
const datepicker_start = new Datepicker(start_date_input, {
    buttonClass: 'btn',
    orientation: 'bottom',
    todayHighlight: true,
    format: 'dd/mm/yyyy'
}); 

// Configurazione datepicker end date
const end_date_input = document.querySelector('#enddate');
end_date_input.value = moment().format('DD/MM/YYYY');
const datepicker_end = new Datepicker(end_date_input, {
    buttonClass: 'btn',
    orientation: 'bottom',
    todayHighlight: true,
    format: 'dd/mm/yyyy'
});

// Costruzione Query
const buildRestQuery = (disease, species, subtype, country, source, startdt, enddt) => {
    if ( disease.length < 1 || startdt == "" || enddt == "" ){ 
        return 'missing values';
    } else if (moment(startdt,'DD/MM/YYYY').isAfter(moment(enddt, 'DD/MM/YYYY'))){
        return 'invalid date range';
    } else {
        // Query di base con i campi obbligatori
        let sql = "DISEASE_DESC IN ('"+disease.join("','")+"') AND DATE_OF_START_OF_THE_EVENT >= DATE '"+startdt+"' AND DATE_OF_START_OF_THE_EVENT <= DATE '"+enddt+"'";
        // Aggiunta dei campi non obbligatori alla query
        if (species.length > 0){ sql += " AND DESC_SPECIE IN ('"+species.join("','")+"')"; }
        if (subtype.length > 0){ sql += " AND DESC_SUBTYPE IN ('"+subtype.join("','")+"')"; }
        if (country.length > 0){ sql += " AND COUNTRY_N IN ('"+country.join("','")+"')"; }
        if (source.length == 1){ 
            if (source[0] == 'OFFICIAL') {
                sql += " AND SOURCE_TYPE = 'OFFICIAL'";
            } else {
                sql += " AND SOURCE_TYPE <> 'OFFICIAL'";
            }
        }
        return sql;
    }
};

// Impostazione filtri
const setFilters = (sliderend) => {
    // L'argomento "sliderend" è opzionale e deve essere passato
    // solo se la funzione di filtro viene lanciata attraverso il time slider
    
    // Parametri query
    // ****************************************************************************
    let disease = $('#disease').val();
    let species = $('#species').val();
    let subtype = $('#subtype').val();
    let country = $('#country').val();
    let source  = $('#source').val();
    let startdt = $('#startdate').val();
    let enddt   = $('#enddate').val();
    if (sliderend) {
        enddt = sliderend
    }
    // Query
    // ****************************************************************************
    let query = buildRestQuery(disease, species, subtype, country, source, startdt, enddt);
    // console.log(query)
    if (query == 'missing values' ){
        alert('Mandatory fields missing');
        return;
    }
    if (query == 'invalid date range'){
        alert('Invalid date range');
        return;
    }
    // Get Outbreaks
    // ****************************************************************************
    getOutbreaks(query);
    // Get Distribution
    // ****************************************************************************
    getDistribution(query);
    // Set time filter and window info panel
    // ****************************************************************************
    if (sliderend === undefined) {
        setTimeFilter();
        setTimeWindow();
    }
}

setFilters();

// Click bottone Set Filters
$('#set-filters-btn').click((e)=>{
    e.preventDefault();
    setFilters();
});

// Click bottone Reset Filters
$('#reset-filters-btn').click((e)=>{
    e.preventDefault();
    // Reset campi form
    $('#disease').selectpicker('selectAll');
    $('#species').selectpicker('deselectAll');
    $('#subtype').selectpicker('deselectAll');
    $('#country').selectpicker('deselectAll');
    $('#source').selectpicker('deselectAll');
    // Reset date
    start_date_input.value = moment().subtract(1,'years').format('DD/MM/YYYY');
    end_date_input.value   = moment().format('DD/MM/YYYY');
    datepicker_start.setDate(start_date_input.value);
    datepicker_end.setDate(end_date_input.value);
    // Set Filters
    setFilters();
    // Reset time filter and window info panel
    // setTimeFilter();
    // setTimeWindow();
});

export { setFilters }
