import * as L from 'leaflet';

declare module 'leaflet' {

    export namespace Control {
        class ActiveLayers extends L.Control.Layers {
            initialize(baseLayers, overlays, options): void;
            getActiveBaseLayer(): ActiveLayersObject;
            getActiveOverlayLayers(): {[leaflet_id: number]: ActiveLayersObject};
            onAdd(map: L.Map): HTMLDivElement;
            onActivenessChanged(): void;
        }

        interface ActiveLayersObject {
            layer: L.Layer,
            name: string,
            overlay: boolean
        }
    }

    export namespace control {
        function activeLayers(
            baseLayers?: L.Control.LayersObject,
            overlays?: L.Control.LayersObject,
            options?: L.Control.LayersOptions): Control.ActiveLayers;
    }
}