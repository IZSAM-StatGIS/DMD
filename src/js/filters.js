import $ from 'jquery';
import moment from 'moment';
import { Datepicker } from 'vanillajs-datepicker';
import { setTimeWindow } from './time';

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
const buildRestQuery = (disease, species, subtype, country, startdt, enddt) => {
    let sql = "DISEASE_DESC IN ('"+disease.join("','")+"') AND DATE_OF_START_OF_THE_EVENT >= DATE '"+startdt+"' AND DATE_OF_START_OF_THE_EVENT <= DATE '"+enddt+"'";
    return sql;
};

// Impostazione filtri
const setFilters = () => {
    // Parametri form
    let disease = $('#disease').val();
    let species = $('#species').val();
    let subtype = $('#subtype').val();
    let country = $('#country').val();
    let startdt = $('#startdate').val();
    let enddt   = $('#enddate').val();

    // Query
    let query = buildRestQuery(disease, species, subtype, country, startdt, enddt);
    console.log(query)

    // Set time window
    setTimeWindow()
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
    // Reset date
    start_date_input.value = moment().subtract(1,'years').format('DD/MM/YYYY');
    end_date_input.value   = moment().format('DD/MM/YYYY');
    // Reset time window
    setTimeWindow();
})

