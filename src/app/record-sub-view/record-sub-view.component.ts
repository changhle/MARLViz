import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ViewService } from '../service/view.service';
import { DataManager } from '../structure/data-manager';
import { Constants as C } from '../constants';
import * as d3 from 'd3';
import * as util from '../util';

@Component({
    selector: 'record-sub-view',
    templateUrl: './record-sub-view.component.html',
    styleUrls: ['./record-sub-view.component.scss']
})
export class RecordSubViewComponent implements OnInit {

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
    public chartMargin = {top: 10, right: 20, bottom: 40, left: 50};
    public chartHeight;
    public chartWidth;

    public chart1;
    public chart2;

    public defaultCircleRad = 5;
    public highlightCircleRad = 8;

    public isInitialized = false;

    constructor(public view: ViewService) {
        this.view.recordSubView = this;
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

        this.width = this.canvasDiv.clientWidth;
        this.height = this.canvasDiv.clientHeight;

        this.chartHeight = this.height - this.chartMargin.top - this.chartMargin.bottom;
        this.chartWidth = this.width - this.chartMargin.left - this.chartMargin.right;

        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.ctx = this.canvas.getContext('2d');

        this.svg
            .attr('width', this.width)
            .attr('height', this.height);

        this.chart = this.svg.append('g')
            .attr('transform', util.translate(this.chartMargin.left, this.chartMargin.top));

        this.isInitialized = true;
    }

    updateCharts() {
        this.chart2.selectAll('.data_point')
        .style('stroke-width', function(d) {
            if (d.hovered === true) {
                return '3px';
            }
            else return '0px';
        })
        .attr('r', d => {
            if (d.hovered === true) {
                return this.highlightCircleRad;
            }
            else return this.defaultCircleRad;
        });
    }

    updateUI() {
    //     if (!DataManager.isDataLoaded) return;
    //     if (!this.isInitialized) return;

    //     let env = this;

    //     DataManager.studentList.forEach(function(d) {
    //         d.hovered = false;
    //     });
        
    //     let chartAreaWidth = 550;
    //     let svgWidth = chartAreaWidth * 2;
    //     let svgHeight = 550;
        
    //     let margin = {top: 20, right: 20, bottom: 40, left: 40};
        
    //     let width = chartAreaWidth - margin.left - margin.right;
    //     let height = svgHeight - margin.top - margin.bottom;
        
    //     let svg = d3.select('#plot2')
    //     .append('svg')
    //     .attr('width', svgWidth)
    //     .attr('height', svgHeight);
        
    //     let x = d3.scaleLinear()
    //     .domain([
    //         d3.min(DataManager.studentList, d => d.exercise) - 0.1*d3.max(DataManager.studentList, d => d.exercise),
    //         d3.max(DataManager.studentList, d => d.exercise) * 1.1
    //     ])
    //     .range([0, width]);
    //     let y = d3.scaleLinear()
    //     .domain([
    //         d3.min(DataManager.studentList, d => d.status) - 0.1*d3.max(DataManager.studentList, d => d.status),
    //         d3.max(DataManager.studentList, d => d.status) * 1.1
    //     ])
    //     .range([height, 0]);
        
    //     let color = d3.scaleOrdinal()
    //     .domain(['A', 'B', 'C', 'D'])
    //     .range([d3.schemeCategory10[0], d3.schemeCategory10[1], d3.schemeCategory10[2], d3.schemeCategory10[3]]);
            
    //     this.chart2 = svg.append('g')
    //     .attr('transform', 'translate(' + (margin.left + 10) + ', ' + margin.top +')');
        
    //     let x2 = d3.scaleLinear()
    //     .domain([
    //         d3.min(DataManager.studentList, d => d.study) - 0.1*d3.max(DataManager.studentList, d => d.study),
    //         d3.max(DataManager.studentList, d => d.study) * 1.1
    //     ])
    //     .range([0, width]);
    //     let y2 = d3.scaleLinear()
    //     .domain([
    //         d3.min(DataManager.studentList, d => d.hobby) - 0.1 * d3.max(DataManager.studentList, d => d.hobby),
    //         d3.max(DataManager.studentList, d => d.hobby) * 1.1
    //     ])
    //     .range([height, 0]);

    //     this.chart2
    //     .selectAll('circle')
    //     .data(DataManager.studentList)
    //     .enter()
    //     .append('circle')
    //         .classed('data_point', true)
    //         .attr('r', this.defaultCircleRad)
    //         .attr('cx', d => x2(d.study))
    //         .attr('cy', d => y2(d.hobby))
    //         .style('fill', d => color(d.class))
    //         .style('stroke', 'black')
    //         .style('stroke-width', '0px');
        
    //     let xAxis2 = d3.axisBottom(x2);
    //     let yAxis2 = d3.axisLeft(y2);
        
    //     this.chart2
    //     .append('g')
    //         .attr('class', 'x axis')
    //         .attr('transform', 'translate(0, ' + height + ')')
    //         .call(xAxis2)
    //         .append('text')
    //             .attr('x', width / 2)
    //             .attr('y', 35)
    //             .style('text-anchor', 'middle')
    //             .style('fill', 'black')
    //             .style('font-size', '15px')
    //             .text('study');
        
    //     this.chart2
    //     .append('g')
    //         .attr('class', 'y axis')
    //         .call(yAxis2)
    //         .append('text')
    //             .attr('transform', 'rotate(-90)')
    //             .attr('x', height / -2)
    //             .attr('y', -25)
    //             .style('text-anchor', 'middle')
    //             .style('fill', 'black')
    //             .style('font-size', '15px')
    //             .text('hobby');
        
    //     let selectedItems2 = [];
        
    //     let legend2 = this.chart2
    //     .selectAll(".legend2")
    //     .data(color.domain())
    //     .enter()
    //     .append("g")
    //         .attr("class", "legend2")
    //         .attr("transform", (d, i) => { 
    //             return "translate(0, " + i * 20 + ")"; 
    //         })
    //         .on('click', function(color_name) {
    //             let index = selectedItems2.indexOf(color_name);
                
    //             if (index > -1) {
    //                 selectedItems2.splice(index, 1);
    //             } else {
    //                 selectedItems2.push(color_name);
    //             }
                
    //             let selected = d3.select(this).classed('selected');
    //             d3.select(this).classed('selected', !selected);
                
    //             let selected_legend2 = env.chart2.selectAll('.legend2')
                
    //             if (selectedItems2.length === 0) {
    //                 selected_legend2.style('opacity', 1);
    //             } else {
    //                 selected_legend2.style('opacity', d => selectedItems2.includes(d) ? 1 : 0.1);
    //             }
                
    //             let circles = env.chart2.selectAll('.data_point');
                
    //             if (selectedItems2.length === 0) {
    //                 circles.style('opacity', 1).attr('r', 5);
    //             } else {
    //                 circles
    //                 .style('opacity', d => selectedItems2.includes(d.class) ? 1 : 0.1)
    //                 .attr('r', d => selectedItems2.includes(d.class) ? 5 : 3.5);
    //             }
    //         });
        
    //     legend2.append("rect")
    //         .attr("x", width - 18)
    //         .attr("width", 18)
    //         .attr("height", 18)
    //         .style('stroke', 'black')
    //         .style('stroke-width', '0px')
    //         .style("fill", color) 
    //         .on('mouseover', function(color_name) { 
    //             d3.select(this).style('stroke-width', '2px');
    //         })
    //         .on('mouseout', function(color_name) { 
    //             d3.select(this).style('stroke-width', '0px');
    //         });
        
    //     legend2.append("text")
    //         .attr("x", width - 30)
    //         .attr("y", 15)
    //         .style("text-anchor", "middle")
    //         .text(function(d) { return d; });
    }
}