import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ViewService } from '../service/view.service';
import { DataManager } from '../structure/data-manager';
import { FitRecord } from '../structure/fit-record';
import { RectPosition } from '../structure/rect-position';
import { Constants as C } from '../constants';
import * as d3 from 'd3';
import * as util from '../util';

export class FitLineChart {

    public static readonly AREA_HEIGHT = 160;

    public position: RectPosition = new RectPosition(-1, -1, -1, -1);
    public ctx: CanvasRenderingContext2D;
    public svg;

    public xScale;

    constructor(public record: FitRecord) {
    }

    setCanvas(ctx) {
        this.ctx = ctx;
    }

    setSVG(svg) {
        this.svg = svg.append('g');
    }

    clear() {
        this.svg.selectAll('*');
        this.svg.remove();
    }

    setPosition(x: number, y: number, width: number, height: number) {
        this.position.x = x;
        this.position.y = y;
        this.position.width = width;
        this.position.height = height;

        if (this.svg) {
            this.svg.attr('transform', util.translate(x, y));
        }
    }

    setXScale(scale) {
        this.xScale = scale;
    }

    draw() {
        console.log(this.record);
        let svg = this.svg;

        let x = this.position.x;
        let width = this.position.width;
        let height = this.position.height;

        // svg.append('rect')
        //     .attr('class', 'row-background')
        //     .attr('x', 0)
        //     .attr('y', 0)
        //     .attr('width', width)
        //     .attr('height', height)
        //     .attr('fill', 'red');

        let logs = this.record.logs;
        let dat = [];
        let dat2 = [];
        let maxVal = -10000000;
        let maxCount = -1;
        let noX1 = -1;
        let noX2 = -1;
        let noRangeList = [];
        for (let j = 0; j < logs.length; j++) {
            let log = logs[j];
            let v = log[1];
            if (maxVal < v) maxVal = v;
            
            let d  = {
                idx: j,
                val: v
            };
            dat.push(d);

            v = log[2];
            if (maxCount < v) maxCount = v;
            let d2 = {
                idx: j,
                val: v
            };
            dat2.push(d2);

            v = log[0];
            if (v !== '77') {
                if (noX1 === -1) {
                    noX1 = j;
                }
                noX2 = j;
            } else {
                if (noX1 !== -1) {
                    noRangeList.push([noX1, noX2]);
                    noX1 = -1;
                }
            }
        }
        console.log(logs, noRangeList);

        // let xScale = d3.scaleLinear().domain([0, logs.length - 1]).range([0, width]);
        let xScale = this.xScale;
        let yScale = d3.scaleLinear().domain([0, maxVal]).range([height, 0]);
        let y2Scale = d3.scaleLinear().domain([0, maxCount]).range([height, 0]);

        for (let i = 0 ; i < noRangeList.length; i++) {
            let noRange = noRangeList[i];
            let x1 = xScale(noRange[0]);
            let x2 = xScale(noRange[1]);
            svg.append('rect')
                .style("fill", C.rowSelectColor)
                .style("stroke", C.rowSelectColor)
                .style("stroke-width", 1)
                .attr('x', x1)
                .attr('y', 0)
                .attr('width', x2 - x1)
                .attr('height', height);
        } 

        svg.append('g')
        .attr('transform', util.translate(0, 0))
        .append("path")
            .datum(dat)
            .attr("fill", "none")
            .attr("stroke", "steelblue")
            .attr("stroke-width", 1.5)
            .attr("d", d3.line()
                .x((d: any) => xScale(d.idx))
                .y((d: any) => yScale(d.val))
            );

        svg.append('g')
        .attr('transform', util.translate(0, 0))
        .append("path")
            .datum(dat2)
            .attr("fill", "none")
            .attr("stroke", "red")
            .attr("stroke-width", 1.5)
            .attr("d", d3.line()
                .x((d: any) => xScale(d.idx))
                .y((d: any) => y2Scale(d.val))
            );
    
        svg.append('g')
            .attr('transform', util.translate(0, height))
            .call(d3.axisBottom(xScale))
    }
}

@Component({
    selector: 'temporal-view',
    templateUrl: './temporal-view.component.html',
    styleUrls: ['./temporal-view.component.scss']
})
export class TemporalViewComponent implements OnInit {

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

    public width;
    public height;

    public targetRecordList: FitRecord[] = [];
    public lineChartList: FitLineChart[] = [];

    public isInitialized = false;

    constructor(public view: ViewService) {
        this.view.temporalView = this;
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
        this.isInitialized = true;
    }

    setData(raw) {
        console.log(raw);
        this.clearCharts();
        
        let user = DataManager.targetUserList[0];
        this.targetRecordList = user.timeEquipRecordDict[raw.uID];
        console.log(this.targetRecordList);

        this.width = this.canvasDiv.clientWidth;
        this.height = FitLineChart.AREA_HEIGHT * this.targetRecordList.length;

        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.ctx = this.canvas.getContext('2d');

        this.svg
            .attr('width', this.width)
            .attr('height', this.height);

        let chartWidth = this.width - 20;
        for (let i = 0 ; i < this.targetRecordList.length; i++) {
            let rec = this.targetRecordList[i];
            let chart = new FitLineChart(rec);
            chart.setSVG(this.svg);
            chart.setCanvas(this.ctx);
            chart.setPosition(10, i * FitLineChart.AREA_HEIGHT + 8, chartWidth, FitLineChart.AREA_HEIGHT - 16);
            this.lineChartList.push(chart);
        }

        let maxVal = -1000000;
        this.targetRecordList.forEach(rec => {
            let logs = rec.logs;
            let v = logs.length;
            if (v > maxVal) maxVal = v;
        });
        let xScale = d3.scaleLinear().domain([0, maxVal - 1]).range([0, chartWidth]);
        this.lineChartList.forEach(chart => chart.setXScale(xScale));
    }

    drawCharts() {
        for (let i = 0 ; i < this.lineChartList.length; i++) {
            let chart = this.lineChartList[i];
            chart.draw();
        }
    }

    clearCharts() {
        this.lineChartList.forEach(chart => {
            chart.clear();
        });
        this.lineChartList = [];
    }

    updateUI() {
        if (!DataManager.isDataLoaded) return;
        if (this.targetRecordList.length < 1) return;

        this.drawCharts();
    }

}
