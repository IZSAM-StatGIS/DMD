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
// Tippy
import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css';
// Split GRID
import Split from 'split-grid';

// Application scripts
import { map } from './js/map';
import { outbreaksGrid } from './js/tables';
import './js/chart-otb';
import './js/chart-legend';
import './js/filters';
import './js/time';
import './js/lists';
import './js/layers';
import './js/env-data-analysis';
import './js/env-data-analysis-results';
import './js/env-data-download';

// Tooltips
tippy('[data-tippy-content]');

// Split Grid configuration
Split({
  columnGutters: [{
    track: 1,
    element: document.querySelector('v-gutter'),
  }],
  rowGutters: [{
    track: 3,
    element: document.querySelector('h-gutter')
  }],
  onDragEnd: function(e){
    map.updateSize();
    outbreaksGrid.setHeight( $("bottombar").height() - 42 );
  }
});