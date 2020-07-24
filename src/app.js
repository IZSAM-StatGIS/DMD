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
// Split GRID
import Split from 'split-grid';

// Application scripts
import { map } from './js/map';
import './js/filters';
import './js/time';

// Split Grid configuration
Split({
  columnGutters: [{
    track: 1,
    element: document.querySelector('v-gutter'),
  }],
  rowGutters: [{
    track: 2,
    element: document.querySelector('h-gutter'),
  }],
  onDragEnd: function(e){
    map.updateSize();
  }
});

// export default (window.$ = window.jQuery = jquery,window.moment = moment);