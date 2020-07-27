import $ from 'jquery';
require( 'datatables.net-bs4' )();
require( 'datatables.net-select-bs4' )();
import moment from 'moment';

const populateOutbreaksGrid = (data) => {
    // Dati
	var dataSet = [];
	$.each(data.features,function(i, feature){
      	dataSet.push([
            feature.properties.COUNTRY_N,
            feature.properties.REG_NAME,
            feature.properties.ADMIN_NAME,
            feature.properties.DESC_SOURCE,
            feature.properties.ID_OUTBREAK,
            moment(feature.properties.DATE_OF_START_OF_THE_EVENT).format('DD/MM/YYYY'),
            moment(feature.properties.DATE_OF_1ST_CONFIRMATION).format('DD/MM/YYYY'),
            feature.properties.DISEASE_DESC,
            feature.properties.DESC_SPECIE,
            feature.properties.DESC_SUBTYPE,
            feature.properties.NUM_CASES_OUTB_SPE,
            feature.properties.NUM_SUSCEPTIBLE,
            feature.properties.NUM_DEATHS,
            feature.properties.NUM_DESTROYED,
            feature.properties.NUM_SLAUGHTERED
      	]);
    });
	// Grid
    $('#outbreaks-grid').DataTable({
        destroy: true,
		data: dataSet,
		scrollY: '160px',
		scrollX: true,
        scrollCollapse: true,
		searching: false,
		paging: false,
		info: false,
		select: {
			style:'single',
			className: 'bg-info text-white'
		},
		columns: [
            { title: "Country", sortable: true },
            { title: "Region", sortable: true },
            { title: "Admin unit", sortable: true },
            { title: "Source", sortable: true },
            { title: "ID Outbreak", sortable: true },
            { title: "Start date", sortable: true, type:'date-eu', targets: 0 },
            { title: "Conf. date", sortable: false, type:'date-eu', targets: 0 },
            { title: "Disease", sortable: true, visible: true },
            { title: "Species", sortable: true, visible: true },
            { title: "Subtype", sortable: true, visible: true },
            { title: "N. Cases", sortable: true, visible: true },
            { title: "N. Susc.", sortable: true, visible: true },
            { title: "N. Deaths", sortable: true, visible: true },
            { title: "N. Destr.", sortable: true, visible: true },
            { title: "N. Slaug.", sortable: true, visible: true }
		],
        order: [[ 5, "desc" ]],
        initComplete: function() {
            console.log('init complete');
            $('#outbreaks').DataTable().columns.adjust().draw();
        },
    }).on('draw',function(){
        	
	}).on( 'select', function ( e, dt, type, indexes ) {
		
	}).on(' deselect', function( e, dt, type, indexes ){
	});

};

const populateDistributionGrid = (data) => {

};

const adjustTable = (table) => {
	// Altezza e larghezza pannello 
    let h = $("bottombar").height();
    let w = $("bottombar").width();
	// Regola altezza e larghezza tabella
    $('#'+table+'-grid').closest('.dataTables_scrollBody').css('max-height', h - 120);
    $('#'+table+'-grid').closest('.dataTables_scrollBody').css('max-width',  w - 10);

    $('.dataTables_scrollBody').css('overflow-wrap','break-word')

	// Riorganizza Tabella
    var tableObj = $('#'+table+'-grid').DataTable();
    tableObj.columns.adjust();
    console.log(tableObj)
    console.log('adjust done')
};

export { populateOutbreaksGrid, populateDistributionGrid, adjustTable };

// ******************************************************
// ADATTA DIMENSIONI TABELLA
// ******************************************************



// ******************************************************
// RENDERERS
// ******************************************************
var date_GridRenderer = function ( value, type, row ) {
	var date = new Date(value);
	if (isNaN(date) === true) {
		return "-";
	} else {
		return moment(value).format("DD MMM YYYY");
	}
};



// Plugin date-eu sort

$.extend( $.fn.dataTableExt.oSort, {
	"date-eu-pre": function ( date ) {
		date = date.replace(" ", "");
		if ( ! date ) { return 0; }
		var year;
		var eu_date = date.split(/[\.\-\/]/);
		/*year (optional)*/
		if ( eu_date[2] ) {
			year = eu_date[2];
		}
		else {
			year = 0;
		}
		/*month*/
		var month = eu_date[1];
		if ( month.length == 1 ) {
			month = 0+month;
		}
		/*day*/
		var day = eu_date[0];
		if ( day.length == 1 ) {
			day = 0+day;
		}
		return (year + month + day) * 1;
	},
	"date-eu-asc": function ( a, b ) {
		return ((a < b) ? -1 : ((a > b) ? 1 : 0));
	},
	"date-eu-desc": function ( a, b ) {
		return ((a < b) ? 1 : ((a > b) ? -1 : 0));
	}
});