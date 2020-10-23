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
    if (msg == undefined) {
        msg = 'Running'
    }
    loadingPanel = jsPanel.modal.create({
        id: 'loading-data-panel',
        theme: '#033C73 filled',
        header: false,
        closeOnBackdrop: false, 
        closeOnEscape: false,
        content: `<div style="padding:20px;"><i class="fas fa-spinner fa-spin fa-lg"></i> ${msg}</div>`,
        contentSize: 'auto',
        callback: function(){
            // console.log(this);
        }
    });
};

const mapEnable = () => {
    loadingPanel.close();
}

const messageDialog = (msg, type) => {

    let theme = '#033C73 filled';
    let title = 'Message';
    let logo  = '<i class="far fa-comment-alt fa-lg"></i>';

    if (type == 'error') {
        theme = 'danger filled';
        title = 'Error';
        logo  = '<i class="fas fa-exclamation-triangle fa-lg"></i>';
    } else if (type == 'warning') {
        theme = 'warning filled';
        title = 'Warning';
        logo  = '<i class="fas fa-exclamation-triangle fa-lg"></i>';
    }

    jsPanel.create({
        id: 'msg-panel',
        theme: theme,
        headerTitle: logo+' '+title,
        headerControls: 'closeonly',
        content: `<div style="padding:20px;">${msg}</div>`,
        contentSize: 'auto'
    });
}

export { generateMonthYearRange, mapDisable, mapEnable, messageDialog }