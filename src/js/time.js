import 'nouislider/distribute/nouislider.min.css';
import noUiSlider from 'nouislider'
import moment from 'moment';
import { generateMonthYearRange } from './utils';
import { setFilters } from './filters';

const time_flt_info = document.querySelector('#timefilter-info');
const time_win_info = document.querySelector('#timewindow-info');

const setTimeFilter = () => {
    let start = moment(document.querySelector('#startdate').value, 'DD/MM/YYYY').toDate();
    let end   = moment(document.querySelector('#enddate').value, 'DD/MM/YYYY').toDate();
    time_flt_info.innerHTML = `${ moment(start).format('MMMM YYYY')} - ${moment(end).format('MMMM YYYY') }`;

    createSlider();
};

const setTimeWindow = () => {
    let start = moment(document.querySelector('#startdate').value, 'DD/MM/YYYY').toDate();
    let end   = moment(document.querySelector('#enddate').value, 'DD/MM/YYYY').toDate();
    time_win_info.innerHTML = `${ moment(start).format('MMMM YYYY')} - ${moment(end).format('MMMM YYYY') }`;
};

var slider = document.querySelector('#slider');

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

    // Crea slider
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
                }
            },
            format:{
                to: function(value){
                    return moment(value).format('MM/YYYY')
                }
            },
            density:4
        }
    });

    // On Update
    slider.noUiSlider.on('set', function (values, handle){
        // console.log(values)
        
        let start = moment(document.querySelector('#startdate').value, 'DD/MM/YYYY').toDate();
        time_win_info.innerHTML = `${ moment(start).format('MMMM YYYY')} - ${moment(parseInt(values)).format('MMMM YYYY') }`;

        // Filter data in dashboard
        let endsliderdate = moment(parseInt(values)).endOf('month').format('DD/MM/YYYY');
        setFilters( endsliderdate );
    });
    
}



export { setTimeWindow, setTimeFilter }
