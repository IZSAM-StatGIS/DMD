import $ from 'jquery';
import moment from 'moment';
import Tabulator from 'tabulator-tables';

let outbreaksGrid;
const populateOutbreaksGrid = (data) => {

    let tabledata = data.features.map(e => e.properties);
    let tableheight = $("bottombar").height() - 42;

    outbreaksGrid = new Tabulator("#outbreaks-grid", {
        height: tableheight, // set height of table (in CSS or here), this enables the Virtual DOM and improves render speed dramatically (can be any valid css height value)
        data: tabledata, //assign data to table
        placeholder: "No Data Available",
        layout: "fitColumns", //fit columns to width of table (optional)
        columns:[ //Define Table Columns
            {title:"Country", field:"COUNTRY_N"},
            {title:"Region", field:"REG_NAME"},
            {title:"Admin unit", field:"ADMIN_NAME"},
            {title:"Source", field:"DESC_SOURCE"},
            {title:"Outbreak", field:"ID_OUTBREAK"},
            {title:"Start date", field:"DATE_OF_START_OF_THE_EVENT", formatter: grid_dateFormatter, accessorParams:{}, accessor:dateAccessor },
            {title:"Confirm date", field:"DATE_OF_1ST_CONFIRMATION", formatter: grid_dateFormatter, accessorParams:{}, accessor:dateAccessor },
            {title:"Disease", field:"DISEASE_DESC"},
            {title:"Species", field:"DESC_SPECIE"},
            {title:"Subtype", field:"DESC_SUBTYPE"},
            {title:"Cases", field:"NUM_CASES_OUTB_SPE"},
            {title:"Susceptible", field:"NUM_SUSCEPTIBLE"},
            {title:"Deaths", field:"NUM_DEATHS"},
            {title:"Destroyed", field:"NUM_DESTROYED"},
            {title:"Slaughtered", field:"NUM_SLAUGHTERED"}
        ],
        initialSort:[
            {column:"DATE_OF_START_OF_THE_EVENT", dir:"desc"}
        ],
        footerElement:  "<div style='display:flex;align-items:center;justify-content:space-between;' id='otb-grid-footer'>"+
                            "<div><span id='otb-grid-count'></span>&nbsp;Outbreaks found</div>"+
                            "<a href='#' id='otb-grid-download'><i class='fas fa-download'></i> Download as CSV</a>"+
                        "</div>",
        rowClick: function(e, row){ 
            alert("Row " + row.getData().ID_OUTBREAK + " Clicked!!!!");
        },
    });

    outbreaksGrid.replaceData(tabledata);

    $('#otb-grid-count').html(outbreaksGrid.getData().length);

    $('#otb-grid-download').click((e)=>{
        outbreaksGrid.download("csv", "outbreaks.csv", {delimiter: ","});
    });

};

let distributionGrid;
const populateDistributionGrid = (data) => {

    let tabledata = data.features.map(e => e.properties);
    let tableheight = $("bottombar").height() - 42;

    outbreaksGrid = new Tabulator("#distribution-grid", {

    });

};

const grid_dateFormatter = (cell, formatterParams, onRendered) => {
    // cell - the cell component
    // formatterParams - parameters set for the column
    // onRendered - function to call when the formatter has been rendered
	if ( moment( cell.getValue() ).isValid()) {
		return moment( cell.getValue() ).format("DD MMM YYYY");
	} else {
		return '-';
	}
}

var dateAccessor = function(value, data, type, params, column){
	//value - original value of the cell
	//data - the data for the row
	//type - the type of access occurring  (data|download|clipboard)
	//params - the accessorParams object passed from the column definition
    //column - column component for the column this accessor is bound to
    if ( moment( value ).isValid()) {
		return moment( value ).format("DD/MM/YYYY");
	} else {
		return '-';
	}
}


export { populateOutbreaksGrid, populateDistributionGrid, outbreaksGrid };