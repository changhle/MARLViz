import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ViewService } from '../service/view.service';
import { DataManager } from '../structure/data-manager';
import * as d3 from 'd3';

@Component({
	selector: 'config-view',
	templateUrl: './config-view.component.html',
	styleUrls: ['./config-view.component.scss']
})
export class ConfigViewComponent implements OnInit {
	@ViewChild('rootDiv', {static: true}) rootDivRef: ElementRef<HTMLDivElement>;
    @ViewChild('canvasDiv', {static: true}) canvasDivRef: ElementRef<HTMLDivElement>;
    @ViewChild('svgDiv', { static: true }) svgDivRef: ElementRef<HTMLDivElement>;
    public rootDiv: HTMLDivElement;
    public canvasDiv: HTMLDivElement;
    public svgDiv: HTMLDivElement;
    public canvas: HTMLCanvasElement;
    public ctx: CanvasRenderingContext2D;
	public dm: DataManager;
    public svg;

	public width;
    public height;
	public isInitialized = false;

	constructor(public view: ViewService) {
		this.view.configView = this;
		this.dm = DataManager;
	}

	ngOnInit() {
		this.rootDiv = this.rootDivRef.nativeElement;
        this.canvasDiv = this.canvasDivRef.nativeElement;
        this.svgDiv = this.svgDivRef.nativeElement;

        this.canvas = d3.select(this.canvasDiv).append('canvas').node();
        this.svg = d3.select(this.svgDiv).append('svg');
	}

	initialize() {
        if (this.isInitialized) return;

        this.width = this.canvasDiv.clientWidth;
        this.height = this.canvasDiv.clientHeight;

        // this.chartHeight = this.height - this.chartMargin.top - this.chartMargin.bottom;
        // this.chartWidth = this.width - this.chartMargin.left - this.chartMargin.right;

        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.ctx = this.canvas.getContext('2d');

        this.svg
            .attr('width', this.width)
            .attr('height', this.height);

        // this.chart = this.svg.append('g')
        //     .attr('transform', util.translate(this.chartMargin.left, this.chartMargin.top));

        this.isInitialized = true;
    }

}
