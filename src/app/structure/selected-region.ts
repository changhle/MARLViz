import * as L from 'leaflet';
import * as I from 'intersects';

export class SelectedRegion {

    public layer: L.Circle | L.Polygon | L.Rectangle;

    // circle
    public cll: L.LatLng;
    public r: number;

    // rectangle
    public bounds: L.LatLngBounds;

    // polygon
    public latlngs: L.LatLng[];
    public points: number[];

    constructor(public type: string, private map: L.Map) {
    }

    setLayer(layer: any) {
        this.layer = layer;
        if (this.type === 'circle') {   
            this.cll = layer._latlng;
            this.r = layer._mRadius;
        } else if (this.type === 'rectangle') {
            this.bounds = layer._bounds;
        } else if (this.type === 'polygon') {
            this.latlngs = layer._latlngs[0];
            this.points = [];
            this.latlngs.forEach(ll => {
                this.points.push(ll.lat);
                this.points.push(ll.lng);
            });
        }
    }

    containPoint(latlng: L.LatLng | [number, number]) {
        let ll = L.latLng(latlng);
        if (this.type === 'circle') {
            let distance = this.map.distance(this.cll, ll);
            return distance <= this.r;
        } else if (this.type === 'rectangle') {
            return this.bounds.contains(ll);
        } else if (this.type === 'polygon') {
            return I.polygonPoint(this.points, ll.lat, ll.lng, 0.0001);
        } else {
            return false;
        }
    }

    containLine(
        latlng1: L.LatLng | [number, number],
        latlng2: L.LatLng | [number, number]) {
            if (this.containPoint(latlng1) && this.containPoint(latlng2)) {
                return true;
            } else {
                return false;
            }
    }
}
