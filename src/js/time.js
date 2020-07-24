import moment from 'moment';

const time_win_info = document.querySelector('#timewindow-info');

const setTimeWindow = () => {
    let start = moment(document.querySelector('#startdate').value, 'DD/MM/YYYY').toDate();
    let end   = moment(document.querySelector('#enddate').value, 'DD/MM/YYYY').toDate();
    time_win_info.innerHTML = `${ moment(start).format('MMMM YYYY')} - ${moment(end).format('MMMM YYYY') }`;
};

export { setTimeWindow }
