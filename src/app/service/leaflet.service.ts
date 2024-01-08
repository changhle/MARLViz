import { Injectable } from '@angular/core';
import * as L from 'leaflet';

@Injectable({
    providedIn: 'root'
})
export class LeafletService {

    public readonly mapTileServer = 'http://localhost:8665';

    // public readonly MAP_TILE = {
    //     KLOKANTECH_BASIC: 'Klokantech Basic',
    //     OSM_BRIGHT: 'OSM Bright',
    //     POSITRON: 'Positron',
    //     DARK_MATTER: 'Dark Matter',
    //     OPEN_STREET_MAP: 'OpenStreetMap',
    //     GOOGLE_MAPS: 'Google Maps',
    //     GOOGLE_SATELLITE: 'Google Satellite'
    // };

    public readonly MAP_TILE = {
        BASIC: 'Basic',
        BRIGHT: 'Bright',
        POSITRON: 'Positron',
        STREETS: 'Streets',
        OPEN_STREET_MAP: 'OpenStreetMap',
        GOOGLE_MAPS: 'Google Maps',
        GOOGLE_SATELLITE: 'Google Satellite'
    };

    constructor() { }

    createBaseTileLayers() {
        let baseLayers = {};
        let tileLayer = L.tileLayer(this.mapTileServer + '/api/maps/basic/{z}/{x}/{y}.png',
        {attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'});
        baseLayers[this.MAP_TILE.BASIC] = tileLayer;

        tileLayer = L.tileLayer(this.mapTileServer + '/api/maps/bright/{z}/{x}/{y}.png',
            {attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'});
        baseLayers[this.MAP_TILE.BRIGHT] = tileLayer;

        tileLayer = L.tileLayer(this.mapTileServer + '/api/maps/positron/{z}/{x}/{y}.png',
            {attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'});
        baseLayers[this.MAP_TILE.POSITRON] = tileLayer;

        tileLayer = L.tileLayer(this.mapTileServer + '/api/maps/streets/{z}/{x}/{y}.png',
            {attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'});
        baseLayers[this.MAP_TILE.STREETS] = tileLayer;

        tileLayer = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
            {attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'});
        baseLayers[this.MAP_TILE.OPEN_STREET_MAP] = tileLayer;

        tileLayer = L.tileLayer('https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
            {attribution: 'Google'});
        baseLayers[this.MAP_TILE.GOOGLE_MAPS] = tileLayer;

        tileLayer = L.tileLayer('http://www.google.cn/maps/vt?lyrs=s@189&gl=cn&x={x}&y={y}&z={z}',
            {attribution: 'Google'});
        baseLayers[this.MAP_TILE.GOOGLE_SATELLITE] = tileLayer;

        return baseLayers;
    }
}
