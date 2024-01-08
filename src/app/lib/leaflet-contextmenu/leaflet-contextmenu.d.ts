import * as L from 'leaflet';

declare module 'leaflet' {
    export interface ContextMenuEvent {
        latlng: L.LatLng;
        containerPoint: L.Point;
        layerPoint: L.Point;
    }

    type ContextMenuItemCallBack = (e?: ContextMenuEvent) => void;

    export interface ContextMenuItem {
        text: string;
        callback: ContextMenuItemCallBack;
        icon?: string;
        disabled?: boolean;
    }

    export interface MapOptions {
        contextmenu?: boolean;
        contextmenuWidth?: number;
        contextmenuItems?: (ContextMenuItem | string)[];
    }

    export class ContextMenu {
        setItems(items: (ContextMenuItem | string)[]);
        setWidth(width: number);
    }
}