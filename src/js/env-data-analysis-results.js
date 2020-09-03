import { jsPanel } from 'jspanel4/es6module/jspanel.js';
import 'jspanel4/es6module/extensions/modal/jspanel.modal.js';
import 'jspanel4/dist/jspanel.css'
import Tabulator from 'tabulator-tables';
import 'chart.js';

const envAnalysisGrid = (data) => {
    // console.log(data);
    let envAnalysisGrid = new Tabulator("#env-analysis-grid", {
        height: 205, 
        data: data,
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
    envAnalysisGrid.replaceData(data);
};

let envChart;
const envAnalysisChart = (data) => {

    data.sort(function(a,b){
        return new Date('01/'+b.DATE) - new Date('01/'+a.DATE);
    }).reverse();

    // console.log(data);

    let labels = data.map(o => o.DATE);
    let lstd_values = data.map(o => o.LSTD);
    let lstn_values = data.map(o => o.LSTN);
    let ndvi_values = data.map(o => o.NDVI);
    let vi_values  = data.map(o => o.EVI );
    
    // Grafico
	let ctx = document.getElementById('env-analysis-chart').getContext('2d');
    if ( envChart ) { envChart.destroy(); }

    envChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'LSTD',
                lineTension: 0,
                borderWidth:2,
                borderColor: '#CC0000',
                pointBackgroundColor: '#CC0000',
                pointBorderColor: '#CC0000',
                fill: 'rgba(255,255,255,0.0)',
                yAxisID: 'LST',
                data: lstd_values
            }, {
                label: 'LSTN',
                lineTension: 0,
                borderWidth:2,
                borderColor: '#ff4444',
                pointBackgroundColor: '#ff4444',
                pointBorderColor: '#ff4444',
                fill: 'rgba(255,255,255,0.1)',
                yAxisID: 'LST',
                data: lstn_values
            },{
                label: 'NDVI',
                lineTension: 0,
                borderWidth:2,
                borderColor: '#00C851',
                pointBackgroundColor: '#00C851',
                pointBorderColor: '#00C851',
                fill: 'rgba(255,255,255,0.1)',
                yAxisID: 'VI',
                data: ndvi_values
            },{
                label: 'EVI',
                lineTension: 0,
                borderWidth:2,
                borderColor: '#2BBBAD',
                pointBackgroundColor: '#2BBBAD',
                pointBorderColor: '#2BBBAD',
                fill: 'rgba(255,255,255,0.1)',
                yAxisID: 'VI',
                data: vi_values
            }]
        },
        options: {
            scales: {
                yAxes: [{
                    id: 'LST',
                    type: 'linear',
                    position: 'left',
                    max:60,
                    min:-50,
                    scaleLabel: {
                        display: true,
                        labelString: 'Land Surface Temperature in °C',
                        fontSize: 12,
                    },
                },{
                    id: 'VI',
                    type: 'linear',
                    position: 'right',
                    max: 1,
                    min: 0,
                    scaleLabel: {
                        display: true,
                        labelString: 'Vegetation Index',
                        fontSize: 12,
                    }
                }]
            }
        }
    });

};

const envAnalysisResultsPanel = (data) => {
    jsPanel.create({
        id: 'env-results-panel',
        header: true,
        headerLogo: '<span class="fas fa-chart-line ml-2"></span>',
        headerTitle: 'Environmental Analysis Results',
        headerControls: {
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
        content: `<div class="card-body">
                    <ul class="nav nav-pills">
                        <li class="nav-item"><a class="nav-link active" href="#pill-chart" data-toggle="tab">Chart</a></li>
                        <li class="nav-item"><a class="nav-link" href="#pill-table" data-toggle="tab">Table</a></li>
                    </ul>
                    <div class="tab-content mt-1">
                        <div class="tab-pane fade show active" id="pill-chart" role="tabpanel" aria-labelledby="home-tab">
                            <div style="position:relative; height:95%; width:90%; margin: 0px auto; padding-top:10px;">
                                <canvas id="env-analysis-chart"></canvas>
                            </div>
                        </div>
                        <div class="tab-pane fade" id="pill-table" role="tabpanel">
                            <table id="env-analysis-grid" class="table-striped table-sm table-hover" style="font-size: 12px;"></table>
                        </div>
                    </div>
                </div>`,
        position: 'right-bottom -10 -10',
        contentSize: '550 320',
        callback: () => {
            envAnalysisGrid(data);
            envAnalysisChart(data);
        }
    });
};

export { envAnalysisResultsPanel, envAnalysisGrid, envAnalysisChart }