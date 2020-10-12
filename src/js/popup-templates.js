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
        return 'Disease distribution';
    },
    attributes: {
      'COUNTRY_N': { title: 'Country' },
      'REG_NAME': { 
        title: 'Region', 
        format: function(val, f) { 
          let parsed = nullPopupParser(val);
          return parsed;
        }
      },
      'admin_name': { 
        title: 'Admin unit', 
        format: function(val, f) { 
          let parsed = nullPopupParser(val);
          return parsed;
        }
      },
      'YEAR_REF_START': { title: 'Start Year'},
      'MONTH_REF_START': { title: 'Start Month'},
      'DISEASE_DESC': { title: 'Disease '},
      'DESC_SPECIE': { 
        title: 'Specie', 
        format: function(val, f) { 
          let parsed = nullPopupParser(val);
          return parsed;
        }
      },
      'DESC_SUBTYPE': { 
        title: 'Subtype', 
        format: function(val, f) { 
          let parsed = nullPopupParser(val);
          return parsed;
        }
      }
    }
}

const nullPopupParser = (val) => {
  if (val == null) { return '-'; } else { return val; }
};

const test = (geoid) => {
  console.log(geoid)
}





export { otbPopupTemplate, dstPopupTemplate };