import { Component, OnInit, HostListener } from '@angular/core';
import { LeafletControlComponent } from '../leaflet-control-component';

@Component({
    selector: 'leaflet-control-switch',
    templateUrl: './leaflet-control-switch.component.html',
    styleUrls: ['./leaflet-control-switch.component.scss']
})
export class LeafletControlSwitchComponent implements OnInit {

    public switchables: LeafletControlComponent[] = [];

    constructor() {
    }

    @HostListener('dblclick', ['$event'])
    onHostDblClick(event: MouseEvent) {
        event.stopPropagation();
    }

    ngOnInit() {
    }

    onControlSwitchClick(event: MouseEvent, comp: LeafletControlComponent) {
        event.stopPropagation();
        comp.toggleVisibility(!comp.isSelected);
    }
}
