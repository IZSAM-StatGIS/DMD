import moment from 'moment';

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

export { generateMonthYearRange }