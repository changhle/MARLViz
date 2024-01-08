import { Component, ComponentRef, ElementRef, OnInit, ViewChild } from '@angular/core';
import { LeafletService } from '../service/leaflet.service';
import { ResizeSensor } from 'css-element-queries';
import { WebWorkerService } from '../service/web-worker.service';
import { ViewService } from '../service/view.service';
import { ComponentLoaderService } from '../service/component-loader.service';
import { LeafletControlSwitchComponent } from '../leaflet/leaflet-control-switch/leaflet-control-switch.component';
import { LeafletDummyPanelComponent } from '../leaflet/leaflet-dummy-panel/leaflet-dummy-panel.component';
import { SelectedRegion } from '../structure/selected-region';
import { DataManager } from '../structure/data-manager';
import { Constants as C } from '../constants';
import * as d3 from 'd3';
import * as L from 'leaflet';
import * as util from '../util';
import 'leaflet-draw';
import 'leaflet-polylineoffset';
import '../lib/leaflet-contextmenu/leaflet.contextmenu.js';
import '../lib/L.CanvasLayer/L.CanvasLayer.js';
import '../lib/Leaflet.ActiveLayers/ActiveLayers.js';


@Component({
    selector: 'map-view',
    templateUrl: './map-view.component.html',
    styleUrls: ['./map-view.component.scss']
})
export class MapViewComponent implements OnInit {

    public static stationZoomRadius = [];

    @ViewChild('mapContainerDiv', { static: true }) containerDivRef: ElementRef<HTMLDivElement>;
    public containerDiv: HTMLDivElement;

    public readonly OVERLAY = {
        SOMETHING: 'Something'
    };

    public mapID = "leaflet-rider-map";
    public leafletMap: L.Map;
    public resizeSensor: ResizeSensor;

    public baseLayers = {};
    public overlayLayers = {};

    private canvasLayer: L.CanvasLayer;
    public selectionLayer: L.FeatureGroup;
    private layerControl: L.Control.ActiveLayers;
    public controlSwitchCompRef: ComponentRef<LeafletControlSwitchComponent>;
    public flowConfigPanelRef: ComponentRef<LeafletDummyPanelComponent>;

    public initialBaseLayer = this.leaflet.MAP_TILE.GOOGLE_MAPS;
    public initialLat = 37.561849;
    public initialLng = 126.981013;
    public initialZoomLevel = 13;
    public minimumZoomLevel = 11;
    public maximumZoomLevel = 18;

    public seoulLatMin = 37.421;
    public seoulLatMax = 37.693;
    public seoulLonMin = 126.770;
    public seoulLonMax = 127.187;

    public currZoomLevel;
    public currLat;
    public currLng;

    // Map Rendering
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private canvasBitmap: ImageBitmap;

    public usePseudoSize = false;
    public pseudoCanvasWidth;
    public pseudoCanvasHeight;

    public isInitialized = false;
    public canvasLayerActivated = false;
    public isCanvasRendering = false;
    public isCtrlPressed = false;
    public drawCreated = false;

    constructor(
        public leaflet: LeafletService,
        public ws: WebWorkerService,
        public view: ViewService,
        public cl: ComponentLoaderService) {
            // this.view.mapView = this;
        }
    
    static _Initialize() {
        this.initRadius();
    }

    static initRadius() {
        this.stationZoomRadius[11] = 1;
        this.stationZoomRadius[12] = 2;
        this.stationZoomRadius[13] = 4;
        this.stationZoomRadius[14] = 6;
        this.stationZoomRadius[15] = 7;
        this.stationZoomRadius[16] = 8;
        this.stationZoomRadius[17] = 9;
        this.stationZoomRadius[18] = 10;
    }

    ngOnInit() {
        this.containerDiv = this.containerDivRef.nativeElement;

        this.currZoomLevel = this.initialZoomLevel;
        this.currLat = this.initialLat;
        this.currLng = this.initialLng;
        this.baseLayers = this.leaflet.createBaseTileLayers();

        setTimeout(() => {
            this.initializeMap();
        }, 0);

        this.resizeSensor = new ResizeSensor(this.containerDiv, () => {
            this.leafletMap.invalidateSize();

            this.isCanvasRendering = false;
            this.updateUI();
        });
    }

    initializeMap() {
        let env = this;
        let initialBaseLayer = this.leaflet.MAP_TILE.POSITRON;
        let map = L.map(this.mapID, {
            center: [this.initialLat, this.initialLng],
            minZoom: this.minimumZoomLevel,
            maxZoom: this.maximumZoomLevel,
            zoom: this.initialZoomLevel,
            layers: [this.baseLayers[initialBaseLayer]],
            contextmenu: true
        });

        this.leafletMap = map;
        this.createLayerControl();

        // Cursor Setting
        L.DomUtil.addClass(this.leafletMap.getContainer(), 'crosshair-cursor-enabled');

        // Add Draw Control
        let drawControl = new L.Control.Draw({
            draw: {
                polyline: false,
                circlemarker: false,
                marker: false
            },
            edit: {
                featureGroup: this.selectionLayer
            }
        }).addTo(map);

        this.controlSwitchCompRef = this.cl.getControlSwitchComponent();
        let controlSwtichControl = new L.Control({ position: 'topright'});
        controlSwtichControl.onAdd = function(_map) {
            this._div = env.controlSwitchCompRef.location.nativeElement;
            return this._div;
        };
        controlSwtichControl.addTo(this.leafletMap);

        // Flow Encoding Panel
        let flowConfigPanelRef = this.cl.getDummyPanelComponent();
        let flowConfigControl = new L.Control({ position: 'bottomleft' } as any);
        flowConfigControl.onAdd = function(_map) {
            this._div = flowConfigPanelRef.location.nativeElement;
            this._draggable = new L.Draggable(this._div);
            this._draggable.enable();
            return this._div;
        };
        flowConfigControl.addTo(this.leafletMap);
        flowConfigPanelRef.instance.leafletControl = flowConfigControl;
        flowConfigPanelRef.instance.toggleVisibility(true);
        this.controlSwitchCompRef.instance.switchables.push(flowConfigPanelRef.instance);
        this.flowConfigPanelRef = flowConfigPanelRef;

        this.registerEventHandlers();

        this.isInitialized = true;
    }

    private registerEventHandlers() {
        this.leafletMap
        .on(L.Draw.Event.CREATED, (e: L.DrawEvents.Created) => {
            let type = e.layerType;
            let layer = e.layer;

            this.selectionLayer.addLayer(layer);
            let region = new SelectedRegion(type, this.leafletMap);
            region.setLayer(layer);
            this.selectionLayer.removeLayer(layer);

            this.drawCreated = true;
        })
        .on('keydown', (e: L.LeafletKeyboardEvent) => {
            this.isCtrlPressed = e.originalEvent.ctrlKey;
        })
        .on('keyup', (e: L.LeafletKeyboardEvent) => {
            this.isCtrlPressed = false;
        })
        .on('click', (e: L.LeafletMouseEvent) => {
            // let lat = e.latlng['lat'];
            // let lon = e.latlng['lng'];
            // console.log('click', lat, lon);

            if (this.drawCreated) {
                this.drawCreated = false;
                return;
            }
        })
        .on('mousemove', (e: L.LeafletMouseEvent) => {
            this.currLat = e.latlng.lat.toFixed(6);
            this.currLng = e.latlng.lng.toFixed(6);
            let mx = e.containerPoint.x;
            let my = e.containerPoint.y;

            // if (this.ctx) {
            //     this.drawBitmap();
            // }
        })
        .on('zoom', e => {
            this.currZoomLevel = this.leafletMap.getZoom();
        })
        .on('drag', e => {
            L.DomUtil.removeClass(this.leafletMap.getContainer(), 'crosshair-cursor-enabled');
        })
        .on('dragend', e => {
            L.DomUtil.addClass(this.leafletMap.getContainer(), 'crosshair-cursor-enabled');
        });
    }

    private createLayerControl() {
        // Flow Map Layer
        this.canvasLayer = L.canvasLayer(false).delegate(this);
        this.canvasLayer.addTo(this.leafletMap);
        this.selectionLayer = new L.FeatureGroup();
        this.selectionLayer.addTo(this.leafletMap);
        this.overlayLayers[this.OVERLAY.SOMETHING] = this.canvasLayer;
        this.canvasLayerActivated = true;

        // Add Layer Control
        this.layerControl = L.control.activeLayers(this.baseLayers, this.overlayLayers).addTo(this.leafletMap);
        this.layerControl.onActivenessChanged = this.onLayerActivenessChanged.bind(this);
    }

    private onLayerActivenessChanged() {
        this.canvasLayerActivated = this.isOverlayActive(this.OVERLAY.SOMETHING);
    }

    private isOverlayActive(name: string) {
        return this.overlayLayers[name]._isActiveLayer;
    }

    onDrawLayer = (info: L.ViewInfo) => {
        this.updateUI(info);
    }

    initPanels() {
        this.flowConfigPanelRef.instance.initLayout();
    }

    drawBitmap() {
        let info = this.canvasLayer.getViewInfo();
        let ctx = this.ctx;
        ctx.clearRect(0, 0, info.canvas.width, info.canvas.height);
        ctx.drawImage(this.canvasBitmap, 0, 0);
    }

    updateUI(info?: L.ViewInfo) {
        if (this.isCanvasRendering) return;

        if (!info) {
            info = this.canvasLayer.getViewInfo();
        }

        let map = this.leafletMap;
        this.canvas = info.canvas;
        this.ctx = this.canvas.getContext('2d');
        let ctx = this.ctx;

        this.isCanvasRendering = true;

        // TODO

        let offCanvasWidth = info.canvas.width;
        let offCanvasHeight = info.canvas.height;
        if (this.usePseudoSize) {
            offCanvasWidth = this.pseudoCanvasWidth;
            offCanvasHeight = this.pseudoCanvasHeight;
            this.usePseudoSize = false;
        }
        if (!offCanvasWidth || !offCanvasHeight) {
            offCanvasWidth = 100;
            offCanvasHeight = 100;
        }
        let offCanvas = new OffscreenCanvas(offCanvasWidth, offCanvasHeight);

        const promise = this.ws.run(
            this.renderCanvas,
            {
                canvas: offCanvas,
                zoom: info.zoom
            },
            [offCanvas]
        );

        promise.then((response) => {
            let bitmapImage = response as ImageBitmap;
            this.canvasBitmap = bitmapImage;

            ctx.clearRect(0, 0, info.canvas.width, info.canvas.height);
            ctx.drawImage(this.canvasBitmap, 0, 0);
            this.canvasLayer.fitCanvasToContainer();

            this.isCanvasRendering = false;
        });
    }

    private renderCanvas(data) {
        let canvas = data.canvas;
        let zoom = data.zoom;

        let ctx: CanvasRenderingContext2D = canvas.getContext('2d');

        // TODO


        return canvas.transferToImageBitmap();
    }

}
MapViewComponent._Initialize();
