import 'nouislider/distribute/nouislider.min.css';
import noUiSlider from 'nouislider'
import moment from 'moment';
import { generateMonthYearRange } from './utils';
import { setFilters } from './filters';
import { activateModis, updateModis } from './map';

// Time Filter Info Panel
const setTimePanel = () => {
    let start = moment(document.querySelector('#startdate').value, 'DD/MM/YYYY').toDate();
    let end   = moment(document.querySelector('#enddate').value, 'DD/MM/YYYY').toDate();
    document.querySelector('#timefilter-info').innerHTML = `${ moment(start).format('MMMM YYYY')} - ${moment(end).format('MMMM YYYY') }`;
    document.querySelector('#timewindow-info').innerHTML = `${ moment(start).format('MMMM YYYY')} - ${moment(end).format('MMMM YYYY') }`;
    createSlider();
};

// Creazione slider
let slider = document.querySelector('#slider');

const createSlider = () => {

    if (slider.noUiSlider) {
        slider.noUiSlider.destroy();
    };

    // Calcula range slider
    let sliderstart  = moment(moment(document.querySelector('#startdate').value,'DD/MM/YYYY').toDate()).format('MM-YYYY');
    let sliderend    = moment(moment(document.querySelector('#enddate').value,'DD/MM/YYYY').toDate()).format('MM-YYYY');
    let sliderrange  = generateMonthYearRange(sliderstart, sliderend);
    // console.log(sliderrange);

    let rangers = {}
    rangers['min'] = moment(sliderstart,'MM-YYYY').valueOf();
    for (var i = 0; i < sliderrange.length; ++i) {
        var percent = Math.ceil((100/sliderrange.length) * i)
        if ( i < sliderrange.length-1 && i > 0) { 
            rangers[percent+'%'] = moment( sliderrange[i],'MM-YYYY' ).valueOf();
        }
    }
    rangers['max'] = moment(sliderend,'MM-YYYY').valueOf();

    // Slider
    noUiSlider.create(slider, {
        start: moment(sliderend,'MM-YYYY').valueOf(),
        step: sliderrange.length,
        snap: true,
        range: rangers,
        pips: {
            mode: 'range', 
            filter: function (value, type) {
                if (type === 0) {
                    return -1;
                } else {
                    let mesi_per_pips = []
                    if (sliderrange.length <= 10){
                        mesi_per_pips = ['01','02','03','04','05','06','07','08','09','10','11','12'];
                    } else if (sliderrange.length >= 11 && sliderrange.length <= 24){
                        mesi_per_pips = ['01','03','05','07','09','11'];
                    } else if (sliderrange.length >= 25 && sliderrange.length <= 36) {
                        mesi_per_pips = ['06','12'];
                    } else {
                        mesi_per_pips = ['01'];
                    }
                    // Crea pip con label per i mesi specificati nell'array variabile in base al range
                    if (mesi_per_pips.includes(moment(value).format('MM'))){
                        return 1;
                    }
                }
            },
            format:{
                to: function(value){
                    return moment(value).format('MMM YY')
                }
            },
            density: -1
        }
    });

    // Slider Set event
    slider.noUiSlider.on('set', function (values, handle){
        // console.log(values)
        let start = moment(document.querySelector('#startdate').value, 'DD/MM/YYYY').toDate();
        let end = parseInt(values);
        document.querySelector('#timewindow-info').innerHTML = `${ moment(start).format('MMMM YYYY')} - ${moment(end).format('MMMM YYYY') }`;
        // Lancia il filtro passando il parametro opzionale
        let endsliderdate = moment(parseInt(values)).endOf('month').format('DD/MM/YYYY');
        setFilters( endsliderdate );
        // Aggiorna intervallo Modis
        updateModis();
    });
    
}

// Timeline Panel
/*
const timelineBtn = document.querySelector("#timeline-btn");
const timelinePanel = document.querySelector("#timeline-panel");
timelineBtn.addEventListener('click',(e)=>{
    // e.preventDefault()
    if (timelinePanel.style.visibility == 'hidden'){
        timelinePanel.style.visibility = 'visible'
    } else {
        timelinePanel.style.visibility = 'hidden'
    }    
});*/

export { setTimePanel }
