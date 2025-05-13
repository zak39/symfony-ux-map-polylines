import { Mode } from "./Mode.js";
import { Polyline } from "./Polyline.js";

export function CreateToolbar(Leaflet) {
    const state = new Mode();

    const Toolbar = Leaflet.Control.extend({
        options: { position: 'topleft' },
    
        onAdd: function (map) {
          const container = Leaflet.DomUtil.create('div', 'leaflet-bar my-toolbar');
    
          const markerBtn = Leaflet.DomUtil.create('button', '', container);
          
          // work with Symfony UX Icons
          //markerBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="currentColor" fill-rule="evenodd" d="M5.575 13.729C4.501 15.033 5.43 17 7.12 17h9.762c1.69 0 2.618-1.967 1.544-3.271l-4.881-5.927a2 2 0 0 0-3.088 0l-4.88 5.927Z" clip-rule="evenodd"/></svg>';  // Icône Marker
          markerBtn.innerHTML = '<i class="fas fa-map-marker-alt"></i>';  // Icône Marker
    
          const polylineBtn = Leaflet.DomUtil.create('button', '', container);
          polylineBtn.innerHTML = '<i class="fas fa-draw-polygon"></i>';  // Icône Polyline
    
          const deleteBtn = Leaflet.DomUtil.create('button', '', container);
          deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';  // Icône Supprimer
    
          Leaflet.DomEvent.disableClickPropagation(container);
    
          // Fonction pour activer / désactiver un bouton (toggle)
          function toggleMode(mode, button) {
            if (state.getMode() === mode) {
              state.initMode()
              button.classList.remove('active');
            } else {
              state.setMode(mode);
              markerBtn.classList.remove('active');
              polylineBtn.classList.remove('active');
              deleteBtn.classList.remove('active');
              button.classList.add('active');
            }
    
            // Si on sort du mode polyline, on annule la polyline temporaire
            if (state.getMode() !== 'polyline') {
              // clearPolyline();
              const polyline = new Polyline();
            }
          }
    
          markerBtn.onclick = function() {
            toggleMode('marker', markerBtn);
          };
    
          polylineBtn.onclick = function() {
            toggleMode('polyline', polylineBtn);
          };
    
          deleteBtn.onclick = function() {
            toggleMode('delete', deleteBtn);
          };
    
          return container;
        }
    });

    return Toolbar;
}