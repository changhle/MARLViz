import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ViewService } from '../service/view.service';
import { DataManager } from '../structure/data-manager';
import { Constants as C } from '../constants';
import * as d3 from 'd3';
import * as util from '../util';

export class WorkoutMatrixCell {

    public static readonly HEIGHT = 24;
    public static readonly WIDTH = 42;

    public count: number;
    public uID: string;
    public equipID: string;
    public dayStr: string;

    public rID: number;
    public cID: number;

    public hovered = false;

    constructor() {
    }
}

@Component({
    selector: 'workout-matrix-view',
    templateUrl: './workout-matrix-view.component.html',
    styleUrls: ['./workout-matrix-view.component.scss']
})
export class WorkoutMatrixViewComponent implements OnInit {

    @ViewChild('rootDiv', {static: true}) rootDivRef: ElementRef<HTMLDivElement>;
    @ViewChild('canvasDiv', {static: true}) canvasDivRef: ElementRef<HTMLDivElement>;
    @ViewChild('svgDiv', { static: true }) svgDivRef: ElementRef<HTMLDivElement>;
    public rootDiv: HTMLDivElement;
    public canvasDiv: HTMLDivElement;
    public svgDiv: HTMLDivElement;

    public dm: DataManager;
    public canvas: HTMLCanvasElement;
    public ctx: CanvasRenderingContext2D;
    public svg;
    public chart;

    public width;
    public height;
    public chartMargin = {top: 30, right: 20, bottom: 40, left: 60};
    public chartHeight;
    public chartWidth;

    public dayList: string[] = [];
    public equipList: string[];

    public cellList: WorkoutMatrixCell[] = [];
    public maxCount = -1;

    public isInitialized = false;

    constructor(public view: ViewService) {
        this.view.workoutMatrixView = this;
        this.dm = DataManager;
    }

    ngOnInit() {
        this.rootDiv = this.rootDivRef.nativeElement;
        this.canvasDiv = this.canvasDivRef.nativeElement;
        this.svgDiv = this.svgDivRef.nativeElement;

        this.canvas = d3.select(this.canvasDiv).append('canvas').node();
        this.svg = d3.select(this.svgDiv).append('svg');
    }
    
    // 데이터가 다 로딩 된 후 call
    initialize() {
        if (this.isInitialized) return;

        this.chart = this.svg.append('g');

        // this.equipList = DataManager.equipIDList;

        this.isInitialized = true;
    }

    setData(raw) {
        this.dayList = [];
        raw['day_list'].forEach(d => {
            this.dayList.push(d);
        });

        this.width = this.canvasDiv.clientWidth;
        this.height = (WorkoutMatrixCell.HEIGHT + 2) * this.dayList.length + this.chartMargin.top + this.chartMargin.bottom;

        this.chartHeight = this.height - this.chartMargin.top - this.chartMargin.bottom;
        this.chartWidth = this.width - this.chartMargin.left - this.chartMargin.right;

        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.ctx = this.canvas.getContext('2d');

        this.svg
            .attr('width', this.width)
            .attr('height', this.height);

        this.chart .attr('transform', util.translate(this.chartMargin.left, this.chartMargin.top));

        this.cellList = [];
        for (let i = 0 ; i < this.equipList.length; i++) {
            let eID = this.equipList[i];
            for (let j = 0 ; j < this.dayList.length; j++) {
                let dStr = this.dayList[j];
                let cellID = dStr + '-' + eID;
                let cell = new WorkoutMatrixCell();
                cell.uID = cellID;
                cell.equipID = eID;
                cell.dayStr = dStr;
                cell.rID = j;
                cell.cID = i;
                cell.count = raw['day_equip_count'][cellID];
                if (this.maxCount < cell.count) {
                    this.maxCount = cell.count;
                }

                this.cellList.push(cell);
            }
        }
        console.log(this.cellList, this.maxCount);
    }

    reRender() {
        this.chart.selectAll('.w-cell')
        .style("stroke-width", d => {
            if (d.hovered) return 2;
            else return 0;
        });
    }

    updateUI() {
        if (!DataManager.isDataLoaded) return;
        if (!this.isInitialized) return;

        this.chart.selectAll('*').remove();

        let enter = this.chart.selectAll('.w-cell')
        .data(this.cellList)
        .enter();

        let rx = 12;
        let rw = WorkoutMatrixCell.WIDTH + 2;;
        let rww = WorkoutMatrixCell.WIDTH;
        let rh = WorkoutMatrixCell.HEIGHT + 2;
        let rhh = WorkoutMatrixCell.HEIGHT;

        let cs = DataManager.colorScale;

        enter.append('rect')
            .attr('class', 'w-cell')
            .attr("x", d => rx + d.cID * rw )
            .attr("y", d => d.rID * rh )
            .attr("width", rww)
            .attr("height", rhh)
            .style("fill", d => {
                if (d.count == 0) return C.barGrayOutColor;
                else return cs(d.count / this.maxCount);
            })
            .style("stroke-width", d => {
                if (d.hovered) return 2;
                else return 0;
            })
            .style('stroke', C.darkFontColor)
            .on('mouseenter', d => {
                console.log('hit');
                d.hovered = true;
                this.reRender();
            })
            .on('mouseleave', d => {
                d.hovered = false;
                this.reRender();
            })
            .on('click', d => {
                this.view.temporalView.setData(d);
                this.view.temporalView.updateUI();
            });

        enter = this.chart.selectAll('.e-label')
        .data(this.equipList)
        .enter();

        enter.append('text')
            .attr('x', (d, idx) => rx + idx * rw + rw / 2)
            .attr("y", -3)
            .style("font-family", C.fontRobotoCondensed)
            .style("font-size", "0.7rem")
            .style('alignment-baseline', 'bottom')
            .style('text-anchor', 'middle')
            .style("fill", C.darkFontColor)
            .text(d => d);

        enter = this.chart.selectAll('.d-label')
        .data(this.dayList)
        .enter();

        enter.append('text')
            .attr('x', rx - 8)
            .attr("y", (d, idx) => idx * rh + rh / 2 + 1)
            .style("font-family", C.fontRobotoCondensed)
            .style("font-size", "0.7rem")
            .style('alignment-baseline', 'center')
            .style('text-anchor', 'end')
            .style("fill", C.darkFontColor)
            .text(d => d);
    }
}
