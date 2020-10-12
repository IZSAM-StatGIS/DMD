import moment from 'moment';
import { jsPanel } from 'jspanel4/es6module/jspanel.js';
import 'jspanel4/es6module/extensions/modal/jspanel.modal.js';
import 'jspanel4/dist/jspanel.css'

// Funzione per generare range di date MM-YYYY
// *******************************************

const generateMonthYearRange = (start, end) => {

    var dateStart = moment(start, 'MM-YYYY');
    var dateEnd   = moment(end, 'MM-YYYY');
    var arr = [];

    while (dateEnd > dateStart || dateStart.format('M') === dateEnd.format('M')) {
        arr.push(dateStart.format('MM-YYYY'));
        dateStart.add(1,'month');
    }

    return arr;
}

let loadingPanel;
const mapDisable = (msg) => {
    if (msg == 'undefined') {
        msg = 'Wait...'
    }
    loadingPanel = jsPanel.modal.create({
        id: 'loading-data-panel',
        theme: '#033C73 filled',
        header: false,
        closeOnBackdrop: false, 
        closeOnEscape: false,
        content: `<div style="padding:10px;"><i class="fas fa-spinner fa-spin"></i> ${msg}</div>`,
        contentSize: 'auto',
        callback: function(){
            
        }
    });
};

const mapEnable = () => {
    loadingPanel.close();
}

export { generateMonthYearRange, mapDisable, mapEnable }