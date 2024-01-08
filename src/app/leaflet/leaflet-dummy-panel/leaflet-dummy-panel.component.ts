import { Component, ElementRef, HostBinding, OnInit, ViewChild } from '@angular/core';
import { ViewService } from 'src/app/service/view.service';
import { DataManager } from 'src/app/structure/data-manager';
import { LeafletControlComponent } from '../leaflet-control-component';
import * as d3 from 'd3';
import * as util from '../../util';

@Component({
    selector: 'leaflet-dummy-panel',
    templateUrl: './leaflet-dummy-panel.component.html',
    styleUrls: ['./leaflet-dummy-panel.component.scss']
})
export class LeafletDummyPanelComponent extends LeafletControlComponent implements OnInit {

    @HostBinding('style.margin-left.px') left = 10;
    @HostBinding('style.margin-bottom.px') bottom = 20;
    public padding = 2;

    @ViewChild('canvasDiv', {static: false}) canvasDivRef: ElementRef<HTMLDivElement>;
    @ViewChild('svgDiv', {static: false}) svgDivRef: ElementRef<HTMLDivElement>;
    public canvasDiv: HTMLDivElement;
    public svgDiv: HTMLDivElement;

    public label = 'Dummy Panel';

    public dm: DataManager;

    public isInitialized = false;

    constructor(public view: ViewService) { 
        super();
        this.dm = DataManager;
    }

    ngOnInit() {
    }

    initLayout() {
        if (this.isInitialized) return;

        this.isInitialized = true;
    }

    onPointerMoved(e: MouseEvent) {
        e.stopPropagation();
    }
}
