// assets/controllers/mymap_controller.js

import { Controller } from '@hotwired/stimulus';
import { Mode } from './Mode.js';

export default class extends Controller {
    connect() {
        this.element.addEventListener('ux:map:pre-connect', this._onPreConnect);
        this.element.addEventListener('ux:map:connect', this._onConnect);
        this.element.addEventListener('ux:map:marker:before-create', this._onMarkerBeforeCreate);
        this.element.addEventListener('ux:map:marker:after-create', this._onMarkerAfterCreate);
        this.element.addEventListener('ux:map:info-window:before-create', this._onInfoWindowBeforeCreate);
        this.element.addEventListener('ux:map:info-window:after-create', this._onInfoWindowAfterCreate);
    }

    disconnect() {
        // You should always remove listeners when the controller is disconnected to avoid side effects
        this.element.removeEventListener('ux:map:pre-connect', this._onPreConnect);
        this.element.removeEventListener('ux:map:connect', this._onConnect);
        this.element.removeEventListener('ux:map:marker:before-create', this._onMarkerBeforeCreate);
        this.element.removeEventListener('ux:map:marker:after-create', this._onMarkerAfterCreate);
        this.element.removeEventListener('ux:map:info-window:before-create', this._onInfoWindowBeforeCreate);
        this.element.removeEventListener('ux:map:info-window:after-create', this._onInfoWindowAfterCreate);
    }

    _onPreConnect(event) {
        // The map is not created yet
        // You can use this event to configure the map before it is created
        console.log(event.detail.options);
    }

    _onConnect(event) {
        // The map, markers and infoWindows are created
        // The instances depend on the renderer you are using
        console.log('ici pour event detail map', event.detail.map);
        console.log(event.detail.markers);
        console.log(event.detail.infoWindows);
        const map = event.detail.map

        // Get all shape from backend
        const markers = event.detail.markers
        const polylines = event.detail.polylines

        console.log('Voici les markers: ', markers)
        
        // let currentMode = null;
        const state = new Mode();
        
        let polylinePoints = [];
        let currentPolyline = null;
        // Généré par IA, peut être utile, à voir ?
        let allElements = []; // Stocke tous les Markers et Polylines
      
        function clearPolyline() {
          polylinePoints = [];
          currentPolyline = null;
        }

        markers.forEach(function (marker) {
          console.log('Voici le marker : ', marker)
          marker.on('click', function(evt) {
            if (state.getMode() === 'delete') {
              console.log('Il faut supprimer le motif');
              map.removeLayer(marker)
              console.log('marker a supprimer', marker)
              console.log('marker.options.id a supprimer', marker.options.id)
              fetch(`http://localhost:8000/remove-marker/${marker.options.id}`, {
                method: 'DELETE',
                headers: {
                  'content-type': 'application/json'
                }
              })
            }
          })
        })

        polylines.forEach(function (polyline) {
          console.log('Voici le polyline : ', polyline)
          polyline.setStyle({
            weight: 8
          });
          polyline.on('click', function(evt) {
            if (state.getMode() === 'delete') {
              console.log('Il faut supprimer le motif');
              map.removeLayer(polyline)
            }
          })
        })

        // Fonction pour activer / désactiver un bouton (toggle)
        function toggleMode(mode, button) {
          if (state.getMode() === mode) {
            state.initMode()
            button.classList.remove('active');
          } else {
            state.setMode(mode);
            const buttons = document.querySelectorAll('.btn-control');
            console.debug('buttons', buttons)
            console.debug('typeof buttons', typeof buttons)
            buttons.forEach((button) => button.classList.remove('active'))
            button.classList.add('active');
          }
  
          // Si on sort du mode polyline, on annule la polyline temporaire
          if (state.getMode() !== 'polyline') {
            clearPolyline();
          }
        }

        function createControlButton(container, html) {
          const btn = L.DomUtil.create('button', 'btn-control', container);
          btn.innerHTML = html;
          return btn;
        }

        function createMarker(points, messagePopup = 'Nouveau marker') {
          const marker = L.marker(points).addTo(map).bindPopup(messagePopup).openPopup();
          marker.on('click', function (e) {
            if (state.getMode() === 'delete') {
              map.removeLayer(marker);
              console.log('Il faut supprimer le motif');
            }
          })
        }
        
        const Toolbar = L.Control.extend({
            options: { position: 'topleft' },
        
            onAdd: function (map) {
              console.log('Ici le onAdd et sa carte', map)
              const container = L.DomUtil.create('div', 'leaflet-bar my-toolbar');

              // marker
              const markerBtn = createControlButton(container, '<i class="fas fa-map-marker-alt"></i>');

              // polyline
              const polylineBtn = createControlButton(container, '<i data-action="click->polyline#hello" class="fas fa-draw-polygon"></i>');

              // trash
              const deleteBtn = createControlButton(container, '<i class="fas fa-trash"></i>');
        
              L.DomEvent.disableClickPropagation(container);
        
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

          map.addControl(new Toolbar());

          map.on('click', function(e) {
            // Création d'un élément.
            console.log('Click sur la carte')
            // Si c'est le marker
            if (state.getMode() === 'marker') {
              console.log('créer un marker')
              const lat = e.latlng.lat
              const lng = e.latlng.lng
              const position = [lat, lng]
              fetch(`http://localhost:8000/create-marker`, {
                method: 'POST',
                headers: {
                  'content-type': 'application/json',
                },
                body: JSON.stringify({
                  title: 'test',
                  position,
                  infos: 'ceci est un test'
                })
              })
              createMarker(e.latlng);
            // Sinon si c'est le polyline
            } else if (state.getMode() === 'polyline') { 
              // On enregistre l'élément actuel dans la liste "polylinePoints" (ex: [ [1.2323, 23.2323], [1.2525, 23.5055] ] )
              polylinePoints.push(e.latlng);

              if (currentPolyline) {
                currentPolyline.setLatLngs(polylinePoints);
                console.log('Il faut enregistrer le polyline');
              } else {
                const polyline = currentPolyline = L.polyline(polylinePoints, {color: 'blue', weight: 5}).addTo(map);
                console.debug('la polyline créé', polyline)
                allElements.push(currentPolyline);

                const popupContent = `
                      <div class="popup-content">
                        <label for="colorPicker">Choisir une couleur :</label><br>
                        <input type="color" id="colorPicker" value="#0000ff"><br>
                        <button id="applyColorBtn" class="popup-btn">Appliquer</button>
                      </div>
                    `;
                
                polyline.on('click', function(e) {
                  console.log('tu as clické !')
                  console.log('e', e)
                })

                polyline.bindPopup(popupContent)

                polyline.on('popupopen', function() {
                  const colorPicker = document.getElementById('colorPicker');
                  const applyBtn = document.getElementById('applyColorBtn');
        
                  applyBtn.onclick = function() {
                    console.debug('apply color currentPolyline', currentPolyline)
                    const selectedColor = colorPicker.value;
                    polyline.setStyle({color: selectedColor});
                    polyline.closePopup();
                  };
                })

                polyline.on('click', function(evt) {
                  if (state.getMode() === 'delete') {
                    map.removeLayer(polyline);
                    console.log('Il faut supprimer le motif');
                    clearPolyline();
                  }
                });
              }
            }
          });
    }

    _onMarkerBeforeCreate(event) {
        // The marker is not created yet
        // You can use this event to configure the marker before it is created
        console.log(event.detail.definition);
    }

    _onMarkerAfterCreate(event) {
        // The marker is created
        // The instance depends on the renderer you are using
        console.log(event.detail.marker);
        const btnDel = document.querySelector('.btn-remove')
        if (btnDel !== null) {
            console.debug('TEEEEEEEEEEEEEEEST')
            btnDel.addEventListener('click', function() {
                alert('Test')
                console.log('A supprimer')
            })
        }
    }

    _onInfoWindowBeforeCreate(event) {
        // The infoWindow is not created yet
        // You can use this event to configure the infoWindow before it is created
        console.log(event.detail.definition);
        // The associated marker instance is also available
        console.log(event.detail.marker);
    }

    _onInfoWindowAfterCreate(event) {
        // The infoWindow is created
        // The instance depends on the renderer you are using
        console.log(event.detail.infoWindow);
        // The associated marker instance is also available
        console.log(event.detail.marker);
    }
}