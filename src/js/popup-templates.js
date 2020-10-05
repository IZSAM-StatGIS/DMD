import moment from 'moment';

let otbPopupTemplate = {
    title: function(f) {
        return f.get('ID_OUTBREAK');
    },
    attributes: {
      'DISEASE_DESC': { title: 'Disease' },
      'DESC_SPECIE': { title: 'Specie' },
      'COUNTRY_N': { title: 'Country' },
      'REG_NAME': { title: 'Region' },
      'ADMIN_NAME': { title: 'Admin unit' },
      'DATE_OF_START_OF_THE_EVENT': {
        title: 'Start date', 
        format: function(val,f) {
          return moment(val).format('DD MMM YYYY'); 
        }
      }
    }
}

let dstPopupTemplate = {
    title: function(f) {
        return f.get('COUNTRY_N');
    },
    attributes: {
      
    }
}

export { otbPopupTemplate, dstPopupTemplate };