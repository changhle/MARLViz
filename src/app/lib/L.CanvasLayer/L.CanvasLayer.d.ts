import * as L from 'leaflet';

declare module 'leaflet' {

    class CanvasLayer extends L.Layer {
        initialize(autoFit?: boolean, options?: L.LayerOptions): void;
        delegate(delegator: any): CanvasLayer;
        fitCanvasToContainer(): void;
        onAdd(map: L.Map): this;
        onRemove(map: L.Map): this;
        // getEvents(): L.LeafletEventHandlerFnMap;
        addTo(map: L.Map): this;
        LatLonToMercator(latlon: L.LatLng): { x: number, y: number };
        getViewInfo(): ViewInfo;
        drawLayer(): void;
    }

    export interface ViewInfo {
        layer: CanvasLayer,
        canvas: HTMLCanvasElement
        bounds: L.LatLngBounds,
        size: L.Point,
        zoom: number,
        center: { x: number, y: number },
        corner: { x: number, y: number }
    }

    function canvasLayer(
        autoFit?: boolean,
        option?: L.LayerOptions
    ): CanvasLayer;
}