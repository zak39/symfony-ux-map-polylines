import { Mode } from "./Mode.js";

export class Map
{
    constructor(map, L) {
        this.L = L
        this.map = map
        this.mode = new Mode();
    }

    getMap() {
        return this.map
    }

    addControl(control) {
        this.map.addControl(control);
    }

    addMarker(latlng) {
        if (this.mode.getMode() !== 'marker') {
            return;
        }
        let marker = this.L.marker(latlng).addTo(this.map).bindPopup('Nouveau Marker').openPopup();
        console.log('Il faut enregistrer le marker');
        this.allElements.push(marker);

        marker.on('click', function(evt) {
            if (this.mode.getMode() === 'delete') {
              this.map.removeLayer(marker);
              console.log('Il faut supprimer le motif');
            }
          });
    }

    addPolyline(polyline) {

    }
}