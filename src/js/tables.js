import $ from 'jquery';
import moment from 'moment';
import Tabulator from 'tabulator-tables';

import { outbreaks, selectedFeatures } from './map';
import tippy from 'tippy.js';

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
                            "<div><span id='otb-grid-count'></span>&nbsp;Outbreaks found, <span id='otb-grid-selected-count'>0</span> selected</div>"+
                            "<div class='btn-group dropup'>"+
                                "<button class='btn btn-sm btn-outline-dark' id='otb-grid-show-all'><i class='fas fa-align-justify fa-lg'></i> All</button>"+
                                "<button class='btn btn-sm btn-outline-dark' id='otb-grid-show-selected'><i class='fas fa-grip-lines fa-lg'></i> Selected</button>"+
                                "<button class='btn btn-sm btn-outline-dark dropdown-toggle' data-toggle='dropdown'><i class='fas fa-file-csv fa-lg'></i> Download</button>"+
                                "<div class='dropdown-menu'>"+
                                    "<button class='dropdown-item' href='#' id='otb-grid-download'>Oubreaks data</button>"+
                                    "<div class='dropdown-divider' href='#'>Oubreaks data</div>"+
                                    "<button class='dropdown-item disabled' href='#' id='otb-grid-download-selected'>Selected outbreaks data</button>"+
                                    "<button class='dropdown-item disabled' data-toggle='modal' data-target='#downloadModal' id='otb-grid-download-selected-env'>Environmental data for selected outbreaks</button>"+
                                "</div>"+
                            "</div>"+
                        "</div>", 
        rowClick: function(e, row){ 
            row.toggleSelect();
        },
        rowSelected: function(row){
            // Seleziona feature corrispondenti sulla mappa
            outbreaks.getSource().getFeatures().forEach(feature => {
                if (feature.get('ID_OUTBREAK') == row.getData().ID_OUTBREAK){
                    selectedFeatures.push(feature);
                }
            });
            $('#otb-grid-selected-count').html(outbreaksGrid.getSelectedData().length);
            if (outbreaksGrid.getSelectedData().length > 0) {
                $('#otb-grid-download-selected').removeClass('disabled');
                $('#otb-grid-download-selected-env').removeClass('disabled');
            }
        },
        rowDeselected: function(row){
            // Deseleziona feature corrispondenti sulla mappa
            selectedFeatures.getArray().map(feature => {
                if (feature.get('ID_OUTBREAK') == row.getData().ID_OUTBREAK){
                    selectedFeatures.remove(feature)
                }
            });
            $('#otb-grid-selected-count').html(outbreaksGrid.getSelectedData().length);
            if (outbreaksGrid.getSelectedData().length > 0) {
                $('#otb-grid-download-selected').removeClass('disabled');
                $('#otb-grid-download-selected-env').removeClass('disabled');
            } else {
                $('#otb-grid-download-selected').addClass('disabled');
                $('#otb-grid-download-selected-env').addClass('disabled');
            }
        }
    });

    outbreaksGrid.replaceData(tabledata);

    $('#otb-grid-count').html(outbreaksGrid.getData().length);

    $('#otb-grid-download').click((e)=>{
        outbreaksGrid.download("csv", "outbreaks.csv", {delimiter: ","});
    });

    $('#otb-grid-download-selected').click((e)=>{
        outbreaksGrid.download("csv", "outbreaks.csv", {delimiter: ","}, "selected");
    });

    $('#otb-grid-show-selected').click((e)=>{
        let selectedRows = outbreaksGrid.getSelectedData();
        if (selectedRows.length > 0) {
            let filter_values_arr = selectedRows.map(row => row.ID_OUTBREAK)
            outbreaksGrid.setFilter([
                {field:"ID_OUTBREAK", type:"in", value:filter_values_arr}
            ]);
        }
    });
    tippy('#otb-grid-show-selected', {content:'Display selected records only'})

    
    $('#otb-grid-show-all').click((e)=>{
        outbreaksGrid.clearFilter();
    });
    tippy('#otb-grid-show-all', {content:'Display all records'})
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
};

var dateAccessor = function(value, data, type, params, column){
	// value - original value of the cell
	// data - the data for the row
	// type - the type of access occurring  (data|download|clipboard)
	// params - the accessorParams object passed from the column definition
    // column - column component for the column this accessor is bound to
    if ( moment( value ).isValid()) {
		return moment( value ).format("DD/MM/YYYY");
	} else {
		return '-';
	}
};

export { populateOutbreaksGrid, populateDistributionGrid, outbreaksGrid, grid_dateFormatter, dateAccessor };