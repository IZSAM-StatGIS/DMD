import axios from 'axios';
import $ from 'jquery';
import { server } from './data';

// Species
const getSpecies = () => {
    
    let disease = $('#disease').val();

    axios.get(server.url+"/"+server.layers.vector.outbreaks.id+"/query",{ 
        params:{
            where: "DISEASE_DESC IN ('"+disease.join("','")+"')",
            outFields: "DESC_SPECIE",
            returnGeometry: false,
            returnDistinctValues: true,
            orderByFields: "DESC_SPECIE",
            f: "json"
        } 
    }).then(function(response){
        // Popola lista specie
        let data = response.data.features;
        $('#species').empty();
        data.forEach((e)=>{
            let desc_specie = e.attributes.DESC_SPECIE;
            $('#species').append($('<option></option>').val(desc_specie).html(desc_specie));
        })
        $('#species').selectpicker('refresh');
    });
};

getSpecies();

// Subtypes
const getSubtypes = () => {

    let disease = $('#disease').val();

    axios.get(server.url+"/"+server.layers.vector.outbreaks.id+"/query",{ 
        params:{
            where: "DISEASE_DESC IN ('"+disease.join("','")+"')",
            outFields: "DESC_SUBTYPE",
            returnGeometry: false,
            returnDistinctValues: true,
            orderByFields: "DESC_SUBTYPE",
            f: "json"
        } 
    }).then(function(response){
        // Popola lista subtypes
        let data = response.data.features;
        $('#subtype').empty();
        data.forEach((e)=>{
            let desc_subtype = e.attributes.DESC_SUBTYPE;
            if (desc_subtype != null) {
                $('#subtype').append($('<option></option>').val(desc_subtype).html(desc_subtype));
            }
        })
        $('#subtype').selectpicker('refresh');
    });
};

getSubtypes();

$('#disease').on('change', function (e) {
    getSpecies();
    getSubtypes();
});

// Subtypes
const getCountries = () => {
    axios.get(server.url+"/"+server.layers.vector.outbreaks.id+"/query",{ 
        params:{
            where: "1=1",
            outFields: "COUNTRY_N",
            returnGeometry: false,
            returnDistinctValues: true,
            orderByFields: "COUNTRY_N",
            f: "json"
        } 
    }).then(function(response){
        // Popola lista subtypes
        let data = response.data.features;
        $('#country').empty();
        data.forEach((e)=>{
            let country = e.attributes.COUNTRY_N;
            $('#country').append($('<option></option>').val(country).html(country));
        })
        $('#country').selectpicker('refresh');
    });
};

getCountries();