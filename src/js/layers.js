import { map, outbreaks, distribution, distributionCharts, chartsZoom, modisLayer, activateModis, deactivateModis } from './map';

// *****************************************************************************
// Accesione e spegnimento Overlay layers
// *****************************************************************************
document.querySelector('input[name=otb-chk]').addEventListener('click', (e) => {
    if (e.target.checked) {
        outbreaks.setVisible(true);
        document.getElementById("otb-opacity-slider").disabled = false;
    } else {
        outbreaks.setVisible(false);
        document.getElementById("otb-opacity-slider").disabled = true;
    }
});

document.querySelector('#otb-opacity-slider').addEventListener('change', (e) => {
    let layer_opacity = e.target.value / 10;
    outbreaks.setOpacity(layer_opacity);
})

document.querySelector('input[name=dst-chk]').addEventListener('click', (e) => {
    if (e.target.checked) {
        distribution.setVisible(true);
        if (map.getView().getZoom() >= chartsZoom){ distributionCharts.setVisible(false); }
        document.getElementById("dst-opacity-slider").disabled = false;
    } else {
        distribution.setVisible(false);
        distributionCharts.setVisible(false);
        document.getElementById("dst-opacity-slider").disabled = true;
    }
});

document.querySelector('#dst-opacity-slider').addEventListener('change', (e) => {
    let layer_opacity = e.target.value / 10;
    distribution.setOpacity(layer_opacity);
});

// *****************************************************************************
// Accesione e spegnimento MODIS layers
// *****************************************************************************
const modisCheckboxes = document.querySelectorAll('input[name=modis-chk]');

modisCheckboxes.forEach(checkbox => {
    checkbox.checked = false;
    checkbox.addEventListener('click', (e) => {
        if (checkbox.checked == true){

            deactivateModis();

            // MODIS selezionato
            let selected_modis = checkbox.value;
            activateModis(selected_modis);
            
            // Deseleziona gli altri MODIS quando uno viene selezionato:
            // Simula il comportamento dei radio button ma aggiunge la possibilità di non selezionare alcun elemento.
            modisCheckboxes.forEach(chk => {
                if (chk.value != selected_modis){
                    chk.checked = false;
                }
            });
            document.getElementById("modis-opacity-slider").disabled = false;
        } else {
            deactivateModis();
            document.getElementById("modis-opacity-slider").disabled = true;
        }
        
    }); 
});

document.querySelector('#modis-opacity-slider').addEventListener('change', (e) => {
    let layer_opacity = e.target.value / 10;
    modisLayer.setOpacity(layer_opacity);
});

