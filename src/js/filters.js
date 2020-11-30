import $ from 'jquery';
import moment from 'moment';
import { Datepicker } from 'vanillajs-datepicker';
import { getOutbreaks, getDistribution } from './data';
import { setTimePanel } from './time';
import { updateModis, setFullExtent } from './map';
import { messageDialog } from './utils';


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
    } else if(moment(enddt, 'DD/MM/YYYY').diff(moment(startdt, 'DD/MM/YYYY'), 'days') > 1096){
        return 'too large time interval';
    } /* else if (disease.includes('BT') && moment(enddt, 'DD/MM/YYYY').diff(moment(startdt, 'DD/MM/YYYY'), 'days') > 366){
        return 'too large time interval for BT';
    }*/ else {
        // Estrazione sezioni data per la query sulla distribuzione
        // let start_my    = '01/'+moment(startdt, 'DD/MM/YYYY').format('MM/YYYY');
        // let end_my      = '01/'+moment(enddt, 'DD/MM/YYYY').format('MM/YYYY');
        // Query di base con i campi obbligatori
        let otb_sql = "DISEASE_DESC IN ('"+disease.join("','")+"') AND DATE_OF_START_OF_THE_EVENT >= DATE '"+startdt+"' AND DATE_OF_START_OF_THE_EVENT <= DATE '"+enddt+"'";
        let dst_sql = "DISEASE_DESC IN ('"+disease.join("','")+"') AND START_DATE >= DATE '"+startdt+"' AND END_DATE <= DATE '"+enddt+"'";
        // Aggiunta dei campi non obbligatori alla query
        if (species.length > 0){ 
            otb_sql += " AND DESC_SPECIE IN ('"+species.join("','")+"')"; 
            dst_sql += " AND DESC_SPECIE IN ('"+species.join("','")+"')"; 
        }
        if (subtype.length > 0){ 
            otb_sql += " AND DESC_SUBTYPE IN ('"+subtype.join("','")+"')"; 
            dst_sql += " AND DESC_SUBTYPE IN ('"+subtype.join("','")+"')"; 
        }
        if (country.length > 0){ 
            otb_sql += " AND COUNTRY_N IN ('"+country.join("','")+"')"; 
            dst_sql += " AND COUNTRY_N IN ('"+country.join("','")+"')"; 
        }
        if (source.length == 1){ 
            if (source[0] == 'OFFICIAL') {
                otb_sql += " AND SOURCE_TYPE = 'OFFICIAL'";
                dst_sql += " AND SOURCE_TYPE = 'OFFICIAL'";
            } else {
                otb_sql += " AND SOURCE_TYPE <> 'OFFICIAL'";
                dst_sql += " AND SOURCE_TYPE <> 'OFFICIAL'";
            }
        }
        // return sql object con query per outbreak e distribuzione;
        return { otb: otb_sql, dst: dst_sql };
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
        messageDialog('This request could not be sent: <strong>Required fields not filled</strong>','error');
        return;
    }
    if (query == 'invalid date range'){
        messageDialog('This request could not be sent: <strong>Invalid date range</strong>','error');
        return;
    }
    if (query == 'too large time interval'){
        messageDialog('This request could not be sent: <strong>Date range greater than 3 years</strong>','error');
        return;
    }
    /* if (query == 'too large time interval for BT'){
        messageDialog('This request could not be sent: <strong>Date range greater than one year is not permitted for Bluetongue</strong>','error');
        return;
    } */
    // Get Outbreaks
    // ****************************************************************************
    getOutbreaks(query.otb);
    // Get Distribution
    // ****************************************************************************
    getDistribution(query.dst);
    // Set time filter and window info panel
    // ****************************************************************************
    if (sliderend === undefined) {
        setTimePanel();
    }
    // Aggiorna modis se presente
    // ****************************************************************************
    updateModis();
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

    setFullExtent();
});

export { setFilters }
