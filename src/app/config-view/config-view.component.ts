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
    public grid;
    public barChart1;
    public barChart2;
    public pieChart1;
    public pieChart2;
    public line;


    public barChartWidth = 50;
    public barChartHeight = 100;
    
    public kill = [-1, -2, -3];
    public time = [-0.03, -0.01, 0.01, 0.03];

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
        // this.svg = d3.select(this.svgDiv).append('svg');
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

        // this.svg
        //     .attr('width', this.width)
        //     .attr('height', this.height);

        // this.chart = this.svg.append('g')
        //     .attr('transform', util.translate(this.chartMargin.left, this.chartMargin.top));

        this.isInitialized = true;
    }

    updateChart() {
        this.grid.selectAll('rect').remove();
        this.grid.selectAll('text').remove();

        const gridWidth = 4;
        const gridHeight = 3;
        const xScale = d3.scaleBand()
            .range([0, 250])
            .domain(d3.range(gridWidth).map(String))
            .padding(0.05);

        const yScale = d3.scaleBand()
            .range([0, 190])
            .domain(d3.range(gridHeight).map(String))
            .padding(0.05);

        const colorScale = d3.scaleSequential(d3.interpolateBlues)
            .domain([-1, d3.max(DataManager.gridData, d => d.value)]);

        const xAxis = d3.axisTop(xScale).tickFormat((d, i) => `${this.time[i]}`);
        const yAxis = d3.axisLeft(yScale).tickFormat((d, i) => `${this.kill[i]}`);
        this.grid.append("g")
            .attr('transform', `translate(${0},${-5})`)
            .call(xAxis)
            .style("font-size", "12px")
            .style("font-weight", "100");
        this.grid.append("g")
            .attr('transform', `translate(${-5},${0})`)
            .call(yAxis)
            .style("font-size", "12px")
            .style("font-weight", "100");

        this.grid.selectAll('rect')
            .data(DataManager.gridData)
            .enter().append('rect')
            // .attr('class', 'grid-cell')
            .attr('x', d => xScale(d.col))
            .attr('y', d => yScale(d.row))
            .attr('width', xScale.bandwidth())
            .attr('height', yScale.bandwidth())
            .attr('fill', d => colorScale(d.value))
            .style('stroke', 'none');
            // .style('stroke', 'gray');

        // this.grid.append("text")
        //     .attr("class", "axis-label")
        //     .attr('x', d => xScale(d.col))
        //     .attr('y', d => yScale(d.row))
        //     .style("text-anchor", "middle")
        //     .style("font-family", "sans-serif")
        //     .style("font-size", "14px")
        //     .text('애러');
            // .text(d => `${d.value}`);

        this.grid.append("text")
            .attr("class", "axis-label")
            .attr("x", this.canvas.height / 2)
            .attr("y", -25) // x축 위에 위치
            .style("text-anchor", "middle")
            .style("font-family", "sans-serif")
            .style("font-size", "14px")
            // .style("font-weight", "300")
            // .style("letter-spacing", "2px")
            .text("Time");

        this.grid.append("text")
            .attr("class", "axis-label")
            // .attr("transform", "rotate(-90)")
            .attr("x", -25)
            .attr("y", this.canvas.height / 3) // y축 왼쪽에 위치
            .style("text-anchor", "middle")
            .style("font-family", "sans-serif")
            .style("font-size", "14px")
            // .style("font-weight", "300")
            // .style("letter-spacing", "1px")
            .text("Death");




        this.pieChart1.selectAll("path").remove();
        this.pieChart2.selectAll("path").remove();
        this.pieChart1.selectAll("text").remove();
        this.pieChart2.selectAll("text").remove();

        const color = d3.scaleOrdinal()
            .range(d3.schemeSet2);
        const pie = d3.pie()
            .value(d => d['value']);
        const arc = d3.arc()
            .innerRadius(0)
            .outerRadius(this.barChartHeight/2);

        this.pieChart1.selectAll('path')
            .data(pie(DataManager.mode))
            .enter().append('path')
            .attr('d', arc)
            .style('stroke', 'white')
            .attr('stroke-width', '2px')
            .style('opacity', (d, i) => `${2*(i+3)/10}`)
            // .attr('fill', (d, i) => d3.schemeCategory10[i]);
            .attr('fill', (d, i) => d3.schemeSet2[7]);
            // .attr('fill', (d, i) => color(i));

        this.pieChart1.selectAll("text")
            .data(pie(DataManager.mode))
            .enter().append("text")
            .attr("transform", d => `translate(${arc.centroid(d)})`)
            .attr("text-anchor", "middle")
            .each(function(d) {
                if (d.data.value > 0) {
                    d3.select(this).append("tspan")
                        .attr("x", 0)
                        .attr("dy", "-0.6em") // 라벨 위치 조정
                        .text(` ${d.data.label}`);
                    d3.select(this).append("tspan")
                        .attr("x", 0)
                        .attr("dy", "1.2em") // 값 위치 조정
                        .text(`(${d.data.value})`);
                }
            })
            // .text(d => d.data.value > 0 ? `${d.data.label} (${d.data.value})` : '')
            .style("fill", "black")
            .style("font-size", "11px");

        this.pieChart2.selectAll('path')
            .data(pie(DataManager.num_agent))
            .enter().append('path')
            .attr('d', arc)
            .style('stroke', 'white')
            .attr('stroke-width', '2px')
            .style('opacity', (d, i) => `${2*(i+2)/10}`)
            // .attr('fill', (d, i) => d3.schemeCategory10[i+2]);
            .attr('fill', (d, i) => d3.schemeSet2[6]);
            // .attr('fill', (d, i) => color(i + 2));

        this.pieChart2.selectAll("text")
            .data(pie(DataManager.num_agent))
            .enter().append("text")
            .attr("transform", d => `translate(${arc.centroid(d)})`)
            .attr("text-anchor", "middle")
            .each(function(d) {
                if (d.data.value > 0) {
                    d3.select(this).append("tspan")
                        .attr("x", 0)
                        .attr("dy", "-0.6em") // 라벨 위치 조정
                        .text(` ${d.data.label}`);
                    d3.select(this).append("tspan")
                        .attr("x", 0)
                        .attr("dy", "1.2em") // 값 위치 조정
                        .text(`(${d.data.value})`);
                }
            })
            // .text(d => d.data.value > 0 ? `${d.data.label} (${d.data.value})` : '')
            .style("fill", "black")
            .style("font-size", "11px");







        // let yModeScale = d3.scaleLinear()
        //     .domain([0, d3.max(DataManager.mode)])
        //     .range([this.barChartHeight, 0]);

        // this.barChart1.selectAll("rect").remove();

        // this.barChart1.selectAll("rect")
        //     .data(DataManager.mode)
        //     .enter().append("rect")
        //     .attr("x", (d, i) => i * 15)
        //     .attr("y", d => yModeScale(d))
        //     .attr("width", 10)
        //     // .attr("height", d => this.barChartHeight - d)
        //     .attr("height", d => d === 0 ? 0 : this.barChartHeight - yModeScale(d))
        //     .attr("fill", "steelblue");


        // yModeScale = d3.scaleLinear()
        //     .domain([0, d3.max(DataManager.num_agent)])
        //     .range([this.barChartHeight, 0]);

        // this.barChart2.selectAll("rect").remove();

        // this.barChart2.selectAll("rect")
        //     .data(DataManager.num_agent)
        //     .enter().append("rect")
        //     .attr("x", (d, i) => i * 15)
        //     .attr("y", d => yModeScale(d))
        //     .attr("width", 10)
        //     .attr("height", d => d === 0 ? 0 : this.barChartHeight - yModeScale(d))
        //     .attr("fill", "steelblue");
    }

    updateUI() {
		if (!DataManager.isDataLoaded) return;
        if (!this.isInitialized) return;

        let svg = d3.select('#grid').append('svg')
            .attr('width', this.canvas.width)
            .attr('height', this.canvas.height);
        // const gridWidth = 4;
        // const gridHeight = 3;
        // const cellSize = 60;
        const margin = { top: 30, right: 20, bottom: 40, left: 35 };
        // const gridData = [];
        // DataManager.setMode();
        // DataManager.setNumAgent();
        // DataManager.setGridData();
        // DataManager.updateBrushed();
        const allAgents = [];
		DataManager.gameList.forEach(game => {
			game.agentList.forEach(agent => {
				allAgents.push(agent);
			});
		});

        DataManager.setMode();
        DataManager.setNumAgent();
        DataManager.setGridData();

        allAgents.forEach(d => {
            DataManager.updateMode(d.mode);
            DataManager.updateNumAgent(d.num_agent);
            DataManager.updateGridData(d.kill, d.time);
        })

        this.grid = svg.append('g')
            .attr('transform', `translate(${this.barChartWidth + 130},${margin.top * 2 - 15})`);

        // // 그리드 데이터 생성
        // for (let row = 0; row < gridHeight; row++) {
        //     for (let col = 0; col < gridWidth; col++) {
        //         // gridData.push({ row, col });
        //         gridData.push({
        //             row: row,
        //             col: col,
        //             value: Math.random() // 임의의 값
        //         });
        //     }
        // }

        // const xScale = d3.scaleBand()
        //     .range([0, 250])
        //     .domain(d3.range(gridWidth).map(String))
        //     .padding(0.05);

        // const yScale = d3.scaleBand()
        //     .range([0, 190])
        //     .domain(d3.range(gridHeight).map(String))
        //     .padding(0.05);

        // const colorScale = d3.scaleSequential(d3.interpolateBlues)
        //     .domain([0, 1]);

        // // 셀을 SVG에 추가
        // this.grid.selectAll()
        //     .data(gridData)
        //     .enter().append('rect')
        //     // .attr('class', 'grid-cell')
        //     .attr('x', d => xScale(d.col))
        //     .attr('y', d => yScale(d.row))
        //     .attr('width', xScale.bandwidth())
        //     .attr('height', yScale.bandwidth())
        //     .attr('fill', d => colorScale(d.value))
        //     .style('stroke', 'none');
        //     // .on('click', function(d) {
        //     //     const isSelected = d3.select(this).classed('selected');
        //     //     d3.select(this)
        //     //         .classed('selected', !isSelected)
        //     //         .style('stroke-width', isSelected ? '1px' : '4px')
        //     //         .style('stroke', isSelected ? 'black' : 'blue');
        //     //     if (!isSelected)
        //     //         d3.select(this).raise();
        //     //     else
        //     //         d3.select(this).lower();
        //     //     console.log(`Clicked cell at row ${d['row']}, col ${d['col']}`);
        //     // });
        //     const xAxis = d3.axisTop(xScale).tickFormat((d, i) => `${this.time[i]}`);
        //     const yAxis = d3.axisLeft(yScale).tickFormat((d, i) => `${this.kill[i]}`)
        //     this.grid.append("g")
        //         .attr('transform', `translate(${0},${-5})`)
        //         .call(xAxis)
        //         .style("font-size", "12px")
        //         .style("font-weight", "100");
        //     this.grid.append("g")
        //         .attr('transform', `translate(${-5},${0})`)
        //         .call(yAxis)
        //         .style("font-size", "12px")
        //         .style("font-weight", "100");




        this.pieChart1 = svg.append('g')
            .attr('width', this.barChartWidth)
            .attr('height', this.barChartHeight)
            .attr("transform", `translate(${this.barChartHeight/2 + 17},${this.barChartHeight/2 + 15})`);

        this.pieChart2 = svg.append('g')
            .attr('width', this.barChartWidth)
            .attr('height', this.barChartHeight)
            .attr("transform", `translate(${this.barChartHeight/2 + 17},${this.barChartHeight * 2 - 10})`);

        // //모드 바 차트 1
        // // this.barChart1 = svg.append('g')
        // //     .attr('width', this.barChartWidth)
        // //     .attr('height', this.barChartHeight)
        // //     .attr("transform", `translate(${margin.left + 15},${40})`);

        // // const dataMode = [30, 40];

        // // const yModeScale = d3.scaleLinear()
        // //     .domain([0, d3.max(dataMode)])
        // //     .range([this.barChartHeight, 0]);

        // // this.barChart1.selectAll("rect")
        // //     .data(dataMode)
        // //     .enter().append("rect")
        // //     .attr("x", (d, i) => i * 15)
        // //     .attr("y", d => yModeScale(d))
        // //     .attr("width", 10)
        // //     .attr("height", d => this.barChartHeight - yModeScale(d))
        // //     .attr("fill", "steelblue");


        // //모드 바 차트 2
        // // this.barChart2 = svg.append('g')
        // //     .attr('width', this.canvas.width)
        // //     .attr('height', this.canvas.height)
        // //     .attr("transform", `translate(${margin.left + 10},${this.barChartHeight + 80})`);

        // // const dataAgent = [40, 8, 15];

        // // this.barChart2.selectAll("rect")
        // //     .data(dataAgent)
        // //     .enter().append("rect")
        // //     .attr("x", (d, i) => i * 15)
        // //     .attr("y", d => yModeScale(d))
        // //     .attr("width", 10)
        // //     .attr("height", d => this.barChartHeight - yModeScale(d))
        // //     .attr("fill", "steelblue");


        // // 선
        // // const xScale = d3.scaleLinear().domain([0, 4]).range([0, 600]);
        // // const yScale = d3.scaleLinear().domain([0, 50]).range([400, 0]);
        this.line = svg.append('g')
            .attr('width', this.canvas.width)
            .attr('height', this.canvas.height)
            .style('opacity', 0.2);

        this.updateChart();
            // .attr("transform", `translate(${0},${0})`);

        // const gridWidth = 4;
        // const gridHeight = 3;
        // const xScale = d3.scaleBand()
        //     .range([0, 250])
        //     .domain(d3.range(gridWidth).map(String))
        //     .padding(0.05);

        // const yScale = d3.scaleBand()
        //     .range([0, 190])
        //     .domain(d3.range(gridHeight).map(String))
        //     .padding(0.05);

        // const colorScale = d3.scaleSequential(d3.interpolateBlues)
        //     .domain([-1, d3.max(DataManager.gridData, d => d.value)]);

        // const xAxis = d3.axisTop(xScale).tickFormat((d, i) => `${this.time[i]}`);
        // const yAxis = d3.axisLeft(yScale).tickFormat((d, i) => `${this.kill[i]}`);
        // this.grid.append("g")
        //     .attr('transform', `translate(${0},${-5})`)
        //     .call(xAxis)
        //     .style("font-size", "12px")
        //     .style("font-weight", "100");
        // this.grid.append("g")
        //     .attr('transform', `translate(${-5},${0})`)
        //     .call(yAxis)
        //     .style("font-size", "12px")
        //     .style("font-weight", "100");

        // this.grid.selectAll('rect')
        //     .data(DataManager.gridData)
        //     .enter().append('rect')
        //     // .attr('class', 'grid-cell')
        //     .attr('x', d => xScale(d.col))
        //     .attr('y', d => yScale(d.row))
        //     .attr('width', xScale.bandwidth())
        //     .attr('height', yScale.bandwidth())
        //     .attr('fill', d => colorScale(d.value))
        //     .style('stroke', 'none');
        //     // .style('stroke', 'gray');

        // this.grid.append("text")
        //     .attr("class", "axis-label")
        //     .attr("x", this.canvas.height / 2)
        //     .attr("y", -25) // x축 위에 위치
        //     .style("text-anchor", "middle")
        //     .style("font-family", "sans-serif")
        //     .style("font-size", "14px")
        //     // .style("font-weight", "300")
        //     .style("letter-spacing", "2px")
        //     .text("Time");

        // this.grid.append("text")
        //     .attr("class", "axis-label")
        //     // .attr("transform", "rotate(-90)")
        //     .attr("x", -30)
        //     .attr("y", this.canvas.height / 3) // y축 왼쪽에 위치
        //     .style("text-anchor", "middle")
        //     .style("font-family", "sans-serif")
        //     .style("font-size", "14px")
        //     // .style("font-weight", "300")
        //     .style("letter-spacing", "2px")
        //     .text("Kill");

        this.line.append("line")
            .attr("x1", this.barChartWidth * 2 + margin.left)
            .attr("y1", 0)
            .attr("x2", this.barChartWidth * 2 + margin.left)
            .attr("y2", this.canvas.height)
            .attr("stroke", "gray")
            .attr("stroke-width", 1);

        this.line.append("line")
            .attr("x1", 0)
            .attr("y1", this.canvas.height / 2)
            .attr("x2", this.barChartWidth * 2 + margin.left)
            .attr("y2", this.canvas.height / 2)
            .attr("stroke", "gray")
            .attr("stroke-width", 1);
            

        // this.line1.selectAll("rect")
        //     .enter().append("rect")
        //     .attr("x", 10)
        //     .attr("y", 10)
        //     .attr("width", 10)
        //     .attr("height", this.barChartHeight * 2)
        //     .attr("fill", "gray")
    }
}
