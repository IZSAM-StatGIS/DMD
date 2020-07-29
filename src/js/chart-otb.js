import { jsPanel } from 'jspanel4/es6module/jspanel.js';
import 'jspanel4/es6module/extensions/modal/jspanel.modal.js';
import 'jspanel4/dist/jspanel.css'

import moment from 'moment';
import 'chart.js';

jsPanel.create({
    id: 'app-title',
    header: true,
    headerLogo: '<span class="fas fa-chart-bar ml-2"></span>',
    headerTitle: 'Outbreaks chart',
    headerControls: {
        close: 'remove',
        smallify: 'remove'
    },
    theme: '#033C73',
    border: '1px solid #033C73',
    borderRadius: 0,
    container: document.querySelector('#map'),
    minimizeTo: 'parent',
    dragit: {
        containment: [10, 10, 10, 10]
    },
    content:'<div style="position:relative; height:95%; width:90%; margin: 0px auto; padding-top:10px;">'+
                '<canvas id="outbreaks-chart"></canvas>'+
            '</div>',
    position: 'left-bottom 10 -10',
    contentSize: '400 200'
});

let outbreaksChart;
const drawOutbreaksChart = (data) => {
    
    let inputData = [];
    data.features.forEach(d => {
        inputData.push(
            {
                "date":  moment(d.properties.DATE_OF_START_OF_THE_EVENT).format('MM-YYYY'),
                "year":  moment(d.properties.DATE_OF_START_OF_THE_EVENT).format('YYYY'),
                "month": moment(d.properties.DATE_OF_START_OF_THE_EVENT).format('MM'),
                "disease": d.properties.DISEASE_DESC
            }
        )
    });

    // console.log(inputData)
    
    // Calcola range completo di MM-YYYY all'interno dell'intervallo di date definito nei filtri
    let startDate  = moment(moment(document.querySelector('#startdate').value,'DD/MM/YYYY').toDate()).format('MM-YYYY');
    let endDate    = moment(moment(document.querySelector('#enddate').value,'DD/MM/YYYY').toDate()).format('MM-YYYY');
    let datesrange = generateMonthRange(startDate, endDate);
    // console.log(datesrange);

    // Costruzione del dataset formattato in maniera ottimale per la generazione del grafico
    let dataset = []
    datesrange.forEach(dt => {
    	var filtered = inputData.filter((e) => {return e.date == dt });
        dataset.push({ "date":dt, "count": filtered.length });
    });

    dataset.sort(function(a, b) {
        var keyA = moment(a.date,'MM-YYYY'),
            keyB = moment(b.date,'MM-YYYY');
        // confronta le date
        if (keyA < keyB) return -1;
        if (keyA > keyB) return 1;
        return 0;
    });

    // console.log(dataset);    

    // Label e valori
    let labels    = dataset.map(d =>  moment(d.date,'MM-YYYY').format('MMM YYYY') );
    let bars_data = dataset.map(d =>  d.count );
    
    // Grafico
	let ctx = document.getElementById('outbreaks-chart').getContext('2d');
    if ( outbreaksChart ) { outbreaksChart.destroy(); }
    
    outbreaksChart = new Chart(ctx, {
		type: 'bar',
		data: {
			labels: labels,
			datasets:[{
				label: 'outbreaks',
				backgroundColor: '#FF0000',
				borderColor: '#CC0000',
				data: bars_data,
				fill: false
            }]
        },
        options: {
            responsive:true,
            maintainAspectRatio: false,
            legend:{
                display: false,
            },
            scales: {
                yAxes:[{
                    gridLines: { display:false},
                    ticks:{
                        fontColor:'#4B515D'
                    }
                }],
                xAxes:[{
                    ticks:{
                        gridLines: { display:false},
                        fontColor:'#4B515D'
                    }
                }]
            }
        }
    })
    

};

// Funzione per generare range di date MM-YYYY
// *******************************************

const generateMonthRange = (start, end) => {

    var dateStart = moment(start, 'MM-YYYY');
    var dateEnd   = moment(end, 'MM-YYYY');
    var arr = [];

    while (dateEnd > dateStart || dateStart.format('M') === dateEnd.format('M')) {
        arr.push(dateStart.format('MM-YYYY'));
        dateStart.add(1,'month');
    }

    return arr;
}


export { drawOutbreaksChart }