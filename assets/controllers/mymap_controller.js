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
            }
          })
        })

        polylines.forEach(function (polyline) {
          console.log('Voici le polyline : ', polyline)
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
            /*
            markerBtn.classList.remove('active');
            polylineBtn.classList.remove('active');
            deleteBtn.classList.remove('active');
            */
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

        function addEventControlButton(btn, shapename) {
          btn.onclick = function() {
            toggleMode(shapename, btn);
          }
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
              const container = L.DomUtil.create('div', 'leaflet-bar my-toolbar');
        
              // const markerBtn = L.DomUtil.create('button', 'btn-control', container);
              // marker
              const markerBtn = createControlButton(container, '<i class="fas fa-map-marker-alt"></i>');
              addEventControlButton(markerBtn, 'marker');
              
              // work with Symfony UX Icons
              //markerBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="currentColor" fill-rule="evenodd" d="M5.575 13.729C4.501 15.033 5.43 17 7.12 17h9.762c1.69 0 2.618-1.967 1.544-3.271l-4.881-5.927a2 2 0 0 0-3.088 0l-4.88 5.927Z" clip-rule="evenodd"/></svg>';  // Icône Marker
              // markerBtn.innerHTML = '<i class="fas fa-map-marker-alt"></i>';  // Icône Marker
        
              /*
              const polylineBtn = L.DomUtil.create('button', 'btn-control', container);
              polylineBtn.innerHTML = '<i class="fas fa-draw-polygon"></i>';  // Icône Polyline
              */
              // polyline
              const polylineBtn = createControlButton(container, '<i class="fas fa-draw-polygon"></i>');
              addEventControlButton(polylineBtn, 'polyline');
        
              /*
              const deleteBtn = L.DomUtil.create('button', 'btn-control', container);
              deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';  // Icône Supprimer
              */
              // trash
              const deleteBtn = createControlButton(container, '<i class="fas fa-trash"></i>');
              addEventControlButton(deleteBtn, 'delete');
        
              L.DomEvent.disableClickPropagation(container);
        
              /*
              markerBtn.onclick = function() {
                toggleMode('marker', markerBtn);
              };
        
              polylineBtn.onclick = function() {
                toggleMode('polyline', polylineBtn);
              };
        
              deleteBtn.onclick = function() {
                toggleMode('delete', deleteBtn);
              };
              */
        
              return container;
            }
          });

          map.addControl(new Toolbar());

          map.on('click', function(e) {
            // Création d'un élément.

            // Si c'est le marker
            if (state.getMode() === 'marker') {
              createMarker(e.latlng);

              /*
              let marker = L.marker(e.latlng).addTo(map).bindPopup('Nouveau Marker').openPopup();
              console.log('Il faut enregistrer le marker');
              // On ajout l'élément dans une liste
              // allElements.push(marker);
        
              // Supprimer l'élément marker
              marker.on('click', function(evt) {
                if (state.getMode() === 'delete') {
                  map.removeLayer(marker);
                  console.log('Il faut supprimer le motif');

                  fetch('http://localhost:8000/remove-marker/1', {
                    method: 'DELETE',
                    mode: 'cors'
                  })
                    .then((res) => {
                        console.log('response fetch', res)
                    })
                    .catch((reason) => {
                        console.error('reason', reason)
                    })
                }
              });
              */

            // Sinon si c'est le polyline
            } else if (state.getMode() === 'polyline') { 
              // On enregistre l'élément actuel dans la liste "polylinePoints" (ex: [ [1.2323, 23.2323], [1.2525, 23.5055] ] )
              polylinePoints.push(e.latlng);

              if (currentPolyline) {
                currentPolyline.setLatLngs(polylinePoints);
                console.log('Il faut enregistrer le polyline');
              } else {
                // currentPolyline = L.polyline(polylinePoints, {color: 'blue'}).addTo(map);
                const polyline = currentPolyline = L.polyline(polylinePoints, {color: 'blue'}).addTo(map);
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
        
                
                // Popup avec color picker
                /*
                if (state.getMode() !== 'delete') {
                    const popupContent = `
                      <div class="popup-content">
                        <label for="colorPicker">Choisir une couleur :</label><br>
                        <input type="color" id="colorPicker" value="#0000ff"><br>
                        <button id="applyColorBtn" class="popup-btn">Appliquer</button>
                      </div>
                    `;
                    currentPolyline.bindPopup(popupContent);
            
                    currentPolyline.on('popupopen', function() {
                      const colorPicker = document.getElementById('colorPicker');
                      const applyBtn = document.getElementById('applyColorBtn');
            
                      applyBtn.onclick = function() {
                        const selectedColor = colorPicker.value;
                        currentPolyline.setStyle({color: selectedColor});
                        currentPolyline.closePopup();
                      };
                    });
                }
                */
        
                // Supprimer l'élément polyline
                // Gestion suppression polyline
                /*
                currentPolyline.on('click', function(evt) {
                  if (state.getMode() === 'delete') {
                    map.removeLayer(currentPolyline);
                    console.log('Il faut supprimer le motif');
                    clearPolyline();
                  }
                });
                */
              }
        
            }
          });

        /*
        map.pm.addControls({
            position: 'topleft',
            drawCircleMarker: false,
            rotateMode: false,
        })
        */

        /*
        const popup = L.popup({
            className: 'my-popup'
        });
        */

        /*
        function onMapClick(e) {
            const lat = e.latlng.lat
            const lng = e.latlng.lng

            popup
            .setLatLng(e.latlng)

            .setContent("Voici les coordonées à copier: " + lat + ", " + lng + "</br></br>")
            .openOn(map);

            const btn = document.createElement('button')
            btn.appendChild(document.createTextNode('Copier le point'))
            btn.addEventListener("click", function (e) {
                copyClipBoard(lat, lng)
                btn.innerText = 'Point prêt à être collé 👍'
            });

            popup._contentNode.appendChild(btn)
    
        }

        map.on('click', onMapClick);
        */

        /*
        function copyClipBoard(lat, lng) {
            console.log('click click');
            const coordinate = lat + ', ' + lng
            navigator.clipboard.writeText(coordinate);
        }
        */
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