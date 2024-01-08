import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ViewService } from '../service/view.service';
import { DataManager } from '../structure/data-manager';
import { Constants as C } from '../constants';
import * as d3 from 'd3';
import * as util from '../util';

@Component({
    selector: 'record-list-view',
    templateUrl: './record-list-view.component.html',
    styleUrls: ['./record-list-view.component.scss']
})
export class RecordListViewComponent implements OnInit {

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
        this.view.recordListView = this;
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
        // console.log('hit update ', chart1, chart2);
        this.chart1.selectAll('.data_point')
        .style('stroke-width', function(d) {
            if (d.hovered === true) return '3px';
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
        if (!DataManager.isDataLoaded) return;
        if (!this.isInitialized) return;

        let env = this;

        DataManager.snakeList.forEach(function(d) {
            d.hovered = false;
        });
        
        let chartAreaWidth = 1000;
        let svgWidth = chartAreaWidth;
        let svgHeight = 550;
        
        let margin = {top: 20, right: 20, bottom: 40, left: 40};
        
        let width = chartAreaWidth - margin.left - margin.right;
        // let width = chartAreaWidth - margin.left - margin.right;
        let height = svgHeight - margin.top - margin.bottom;
        
        let svg = d3.select('#plot1')
        .append('svg')
        .attr('width', svgWidth)
        .attr('height', svgHeight);
        
        this.chart1 = svg.append('g')
        .attr('transform', 'translate(' + (margin.left + 10) + ', ' + margin.top +')');
        
        let xs = d3.scaleLinear()
        .domain([
            d3.min(DataManager.snakeList, d => d.index),
            d3.max(DataManager.snakeList, d => d.index)
            // d3.min(DataManager.snakeList, d => d.blue_action) - 0.1*d3.max(DataManager.snakeList, d => d.blue_action),
            // d3.max(DataManager.snakeList, d => d.blue_action) * 1.1
        ])
        .range([0, width]);
        let ys = d3.scaleLinear()
        .domain([
            d3.min(DataManager.snakeList, d => d.blue_action),
            d3.max(DataManager.snakeList, d => d.blue_action)
        ])
        .range([height, 0]);
        
        let color = d3.scaleOrdinal()
            .domain(['Blue', 'Green', 'White'])
            .range([d3.schemeCategory10[0], d3.schemeCategory10[2], d3.schemeCategory10[7]]);
        // 라인 제너레이터 생성
        const lineGenerator = d3.line()
            .x(d => xs((d as any).index))
            .y(d => ys((d as any).blue_action));

        // 경로 요소 추가
        this.chart1.append("path")
        .datum(DataManager.snakeList)
        .attr("d", lineGenerator)
        .classed("line_path", true)
        .style("fill", "none")
        .style("stroke", "black")
        .style("stroke-width", "1px");

        // this.chart1
        // .selectAll('circle')
        // .data(DataManager.snakeList)
        // .enter()
        // .append('circle')
        // .classed('data_point', true)
        // .attr('r', this.defaultCircleRad)
        // .attr('cx', d => x(d.index))
        // .attr('cy', d => y(d.blue_action))
        // // .attr('cx', d => x(d.index))
        // // .attr('cy', d => y(d.green_action))
        // // .style('fill', d => color(d.blue_action))
        // // .style('fill', d => color(d.green_action))
        // // .style('fill', d => color(d.white_action))
        // .style('stroke', 'black')
        // .style('stroke-width', '0px')
        // .on('mouseover', d => { 
        //     d.hovered = true;
        //     this.updateCharts();
        //     this.view.recordSubView.updateCharts();
        // })
        // .on('mouseout', d => { 
        //     d.hovered = false;
        //     this.updateCharts();
        //     this.view.recordSubView.updateCharts();
        // });
        
        let xAxis = d3.axisBottom(xs);
        let yAxis = d3.axisLeft(ys);
        
        this.chart1
        .append('g')
            .attr('class', 'x axis')
            .attr('transform', 'translate(0, ' + height + ')')
            .call(xAxis)
            .append('text')
            .attr('x', width / 2)
            .attr('y', 35)
            .style('text-align', 'center')
            .style('text-anchor', 'middle')
            .style('fill', 'black')
            .style('font-size', '15px')
            .text('step');
        
        this.chart1
        .append('g')
            .attr('class', 'y axis')
            .call(yAxis)
            .append('text')
                .attr('transform', 'rotate(-90)')
                .attr('x', height / -2)
                .attr('y', -25)
                .style('text-align', 'center')
                .style('text-anchor', 'middle')
                .style('fill', 'black')
                .style('font-size', '15px')
                .text('action');
            
        let selectedItems = [];
        
        let legend = this.chart1.selectAll(".legend")
        .data(color.domain())
        .enter()
        .append("g")
            .attr("class", "legend")
            .attr("transform", (d, i) => { 
                return "translate(0, " + i * 20 + ")"; 
            })
            .on('click', function(color_name) {
                let index = selectedItems.indexOf(color_name);
                
                if (index > -1) {
                    selectedItems.splice(index, 1);
                } else {
                    selectedItems.push(color_name);
                }
                
                let selected = d3.select(this).classed('selected');
                d3.select(this).classed('selected', !selected);
                
                env.chart1.selectAll('.legend')
                .style('opacity', d => selectedItems.includes(d) ? 1 : 0.1);
                
                let selected_legend = env.chart1.selectAll('.legend')
                
                if (selectedItems.length === 0) {
                    selected_legend.style('opacity', 1);
                } else {
                    selected_legend.style('opacity', d => selectedItems.includes(d) ? 1 : 0.1);
                }
                
                let circles = env.chart1.selectAll('.data_point');
                
                if (selectedItems.length === 0) {
                    circles.style('opacity', 1).attr('r', env.defaultCircleRad);
                } else {
                    circles
                    .style('opacity', d => selectedItems.includes(d.class) ? 1 : 0.1)
                    .attr('r', d => selectedItems.includes(d.class) ? 5 : 3.5);
                }
            });
                
        legend.append("rect")
            .attr("x", width - 18)
            .attr("width", 18)
            .attr("height", 18)
            .style('stroke', 'black')
            .style('stroke-width', '0px')
            .style("fill", color) 
            .on('mouseover', function(color_name) { 
                d3.select(this).style('stroke-width', '2px');
            })
            .on('mouseout', function(color_name) { 
                d3.select(this).style('stroke-width', '0px');
            });
            
        legend.append("text")
            .attr("x", width - 30)
            .attr("y", 15)
            .style("text-anchor", "middle")
            .text(function(d) { return d; });
    }
}