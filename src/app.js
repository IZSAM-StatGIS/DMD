import './scss/main.scss';
import '@fortawesome/fontawesome-free/js/all';
// Bootstrap
import $ from 'jquery';
import 'popper.js';
import 'bootstrap';
// Bootstrap select
import 'bootstrap-select';
$.fn.selectpicker.Constructor.BootstrapVersion = '4';
import 'bootstrap-select/dist/css/bootstrap-select.min.css';
// Tabulator CSS
import 'tabulator-tables/dist/css/bootstrap/tabulator_bootstrap4.min.css';
// Split GRID
import Split from 'split-grid';

// Application scripts
import { map } from './js/map';
import { outbreaksGrid } from './js/tables';
import './js/chart-otb';
import './js/filters';
import './js/time';
import './js/lists';
import './js/layers';

// Split Grid configuration
Split({
  columnGutters: [{
    track: 1,
    element: document.querySelector('v-gutter'),
  }],
  rowGutters: [{
    track: 2,
    element: document.querySelector('h-gutter')
  }],
  onDragEnd: function(e){
    map.updateSize();
    outbreaksGrid.setHeight( $("bottombar").height() - 42 );
  }
});