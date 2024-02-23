import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { DataManager } from '../structure/data-manager';
import { ViewService } from '../service/view.service';
import * as d3 from 'd3';
import * as util from '../util';
import { ConfigViewComponent } from '../config-view/config-view.component';

@Component({
	selector: 'summary-view',
	templateUrl: './summary-view.component.html',
	styleUrls: ['./summary-view.component.scss']
})
export class SummaryViewComponent implements OnInit {
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
	public plot;

    public width;
    public height;

	public isInitialized = false;

	constructor(public view: ViewService) {
		this.view.summaryView = this;
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

        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.ctx = this.canvas.getContext('2d');

        this.svg
            .attr('width', this.width)
            .attr('height', this.height);

        // this.plot = this.svg.append('g')
        //     .attr('transform', util.translate(this.margin.left, this.margin.top));

        this.isInitialized = true;
    }

	updateUI() {
		if (!DataManager.isDataLoaded) return;
        if (!this.isInitialized) return;

		// const data = DataManager.gameList;
		const allAgents = [];
		DataManager.gameList.forEach(game => {
			game.agentList.forEach(agent => {
				allAgents.push(agent);
			});
		});

		let svg = d3.select('#similarity').append('svg')
			.attr('width', this.canvas.width)
			.attr('height', this.canvas.height);
		const margin = { top: 30, right: 30, bottom: 30, left: 30 };
		const width = +svg.attr('width') - margin.left - margin.right;
		const height = +svg.attr('height') - margin.top - margin.bottom;
		
		this.plot = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);
		// 스케일 설정
		const xScale = d3.scaleLinear()
		.domain([
			d3.min(allAgents, d => d.x),
			d3.max(allAgents, d => d.x)
		]) // X 좌표의 범위 설정
		.range([0, width]);
		
		const yScale = d3.scaleLinear()
			.domain([
				d3.min(allAgents, d => d.y),
				d3.max(allAgents, d => d.y)
			]) // Y 좌표의 범위 설정
			.range([height, 0]);
		
		// 데이터를 SVG 요소로 변환
		this.plot
			.selectAll('circle')
			.data(allAgents)
			.enter()
				.append('circle')
				// .attr('class', 'dot')
				.attr('cx', d => xScale(d.x))
				.attr('cy', d => yScale(d.y))
				.attr('r', 3);
		
		let svg_brush = this.plot;
		let brush = d3.brush();
		brush
			.extent([[-margin.left, -margin.top], [this.canvas.width, this.canvas.height]])
			.on('brush', update.bind(this))
			.on('end', overViewUI.bind(this))

		function update() {
			let extent = d3.event.selection;
			let wRange = [extent[0][0], extent[1][0]];
			let lRange = [extent[0][1], extent[1][1]];
			let wSum = 0, lSum = 0, n = 0;
			// let normal = 0, coop = 0;
			DataManager.setMode();
			DataManager.setNumAgent();
			DataManager.setGridData();

			svg_brush
				.selectAll('circle')
				.each(d => {
					let insideBrush = wRange[0] <= xScale(d.x)
						&& xScale(d.x) <= wRange[1]
						&& lRange[0] <= yScale(d.y)
						&& yScale(d.y) <= lRange[1];
					d.brushed = insideBrush;

					if (insideBrush) {
						DataManager.updateMode(d.mode);
						DataManager.updateNumAgent(d.num_agent);
						DataManager.updateGridData(d.kill, d.time);
					}
				})
				.style('opacity', d => d.brushed ? 1 : 0.3);

			DataManager.updateBrushed();
			this.view.configView.updateChart();
		}
		
		function overViewUI() {
			this.view.overView.updateUI();
		}
		// 축 추가
		this.plot
			.append('g')
			.call(brush)
	}
}
