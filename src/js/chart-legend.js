import 'chart.js';

const drawLegendChart = () => {
    console.log('legend')
    // Grafico
    let ctx = document.getElementById('legend-chart').getContext('2d');
    
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels:['Human','Animal','Virus','Unknow'],
            datasets:[{
                data: [25,25,25,25],
                backgroundColor: ['#2196f3','#d32f2f','#388e3c','#9e9e9e'],
                borderColor: ['#2196f3','#d32f2f','#388e3c','#9e9e9e']
            }]
        },
        options: {
            responsive:true,
            maintainAspectRatio: false,
            legend:{
                display:false
            },
            tooltips: {
                enabled: false
           }
        }
    });
};

setTimeout(()=>{drawLegendChart()},5000);

export { drawLegendChart }