export class Polyline {
    constructor() {
        this.polylinePoints = [];
        this.currentPolyline = null;
        this.color = 'blue';
    }

    getPolylinePoints() {
        return this.polylinePoints;
    }

    addPoints(latlng) {
        this.polylinePoints.push(latlng);
    }

    clearPolyline() {
        this.polylinePoints = [];
        this.currentPolyline = null;
    }

    setCurrentPolyline(points) {
        this.currentPolyline.setLatLngs(points);
    }

    getCurrentPolyline() {
        return this.currentPolyline;
    }
}