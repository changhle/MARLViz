import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ViewService } from '../service/view.service';
import { DataManager } from '../structure/data-manager';
import { Constants as C } from '../constants';
import * as d3 from 'd3';
import { SocketIOService } from '../service/socketio.service';
import { Game } from '../structure/game';
import { Agent } from '../structure/agent';

@Component({
	selector: 'over-view',
	templateUrl: './over-view.component.html',
	styleUrls: ['./over-view.component.scss']
})
export class OverViewComponent implements OnInit {
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
	public gameRows: Game[] = [];
	public listGroup;

	public width;
    public height;
	public chartMargin = {top: 10, right: 20, bottom: 40, left: 50};
    public chartHeight;
    public chartWidth;

	public newRowID = 1;

	public isInitialized = false;

	constructor(public view: ViewService, public socket: SocketIOService) {
        this.view.overView = this;
        this.dm = DataManager;
    }

	ngOnInit() {
		this.rootDiv = this.rootDivRef.nativeElement;
        this.canvasDiv = this.canvasDivRef.nativeElement;
        this.svgDiv = this.svgDivRef.nativeElement;

        this.canvas = d3.select(this.canvasDiv).append('canvas').node();
        // this.svg = d3.select("#game").append('svg');
        this.svg = d3.select(this.svgDiv).append('svg');
	}

	initialize() {
        if (this.isInitialized) return;

        this.width = this.canvasDiv.clientWidth - 6;
        this.height = this.canvasDiv.clientHeight;

        this.chartHeight = this.height - this.chartMargin.top - this.chartMargin.bottom;
        this.chartWidth = this.width - this.chartMargin.left - this.chartMargin.right;

        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.ctx = this.canvas.getContext('2d');

        this.svg
            .attr('width', this.width)
            .attr('height', this.height);

        // this.listGroup = this.svg.append('g');

        // this.updateRenderingRows();

        this.isInitialized = true;
    }

    updateRenderingRows() {
		if (this.gameRows.length > 0)
			this.clearRows();
		this.newRowID = 1;
        DataManager.gameList.forEach(gameRow => {
            // let gameRow = new UserRow(user);
            gameRow.setSVG(this.svg);
            // gameRow.setCanvas(this.ctx);
            gameRow._id = this.newRowID++;
            // this.gameRows.push(gameRow);
        });
    }

	updateUI() {
        if (!DataManager.isDataLoaded) return;
        if (!this.isInitialized) return;

		this.updateRenderingRows();

		this.gameRows = [];
		DataManager.gameList.forEach(game => {
			if (game.brushed)
				this.gameRows.push(game);
		})

		this.gameRows.sort((a, b) => {
			if (a.mode > b.mode)
				return 1;
			else if (a.mode < b.mode)
				return -1;
			else if (a.num_agent !== b.num_agent)
				return a.num_agent - b.num_agent;
			else if (a.kill !== b.kill)
				return b.kill - a.kill;
			else
				return a.time - b.time;
		});

        this.updateLayoutSize();
        this.updateRowPosition();

        this.drawRows();
    }

	updateLayoutSize() {
        this.height = this.gameRows.length * Game.HEIGHT;

        this.canvas.height = this.height;
        this.ctx = this.canvas.getContext('2d');

        this.svg.attr('height', this.height);
    }

	updateRowPosition() {
        let rowY = 0;
        for (let i = 0 ; i < this.gameRows.length; i++) {
            let row = this.gameRows[i];
            let currHeight = Game.HEIGHT;
            // let currHeight = row.position.height;
            row.setPosition(0, rowY, this.width, currHeight);
            rowY += currHeight;
        }
    }

	drawRows() {
        for (let i = 0 ; i < this.gameRows.length; i++) {
            let game = this.gameRows[i];
            // game.draw();
			let svg = game.svg;

			let x = game.position.x;
			let y = game.position.y;
			let width = game.position.width;
			let height = game.position.height;
	
			let fontSize = 0.8;
	
			svg.append('rect')
				.attr('class', 'row-background')
				.attr('x', x)
				.attr('y', 2)
				.attr('width', width)
				.attr('height', height - 5)
				.attr('fill', () => {
					if (game.selected) return C.rowSelectColor;
					else return 'white';
				})
				// .style('cursor', 'pointer')
				.on('click', () => {
					DataManager.gameList.forEach(g => {
						if (g !== game) {
							g.selected = false;
							g.updateSVG();
						}
					})
					game.selected = !game.selected;
					game.updateSVG();
					this.view.detalView.updateUI();
				});
			
			svg.append('text')
				.attr("x", 30)
				.attr("y", Game.HEIGHT / 2 + 5)
				.attr("fill", "black")
				.style("font-weight", "bold")
				.style("font-size", "20px")
				.text(game.mode);
			
			svg.append('text')
				.attr("x", 120)
				.attr("y", 23)
				.attr("fill", "black")
				.style("font-size", "14px")
				.text("Num agent");
			
			svg.append('text')
				.attr("x", 115)
				.attr("y", 68)
				.attr("fill", "black")
				.style("font-size", "14px")
				.text("Reward Func");

			const kill = [-1, -2, -3];
			const time = [-0.03, -0.01, 0.01, 0.03];

			const rows = 3;
			const cols = 4;
			const cellWidth = 25;
			const cellHeight = 22;
			const colorScale = d3.scaleSequential(d3.interpolateBlues)
				.domain([-1, d3.max(DataManager.gridData, d => d.value)]);

			for (let i = 0; i < cols; i++) {
				let fill = 'none';
				if (i < game.num_agent)
					fill = d3.schemeSet2[6];
				svg.append("rect")
					.attr("x", i * cellWidth + 100)
					.attr("y", cellHeight + 5)
					.attr("width", cellWidth)
					.attr("height", cellHeight - 10)
					.style("opacity", "0.8")
					.style("fill", fill) // 셀 채우기 없음
					.style("stroke", "black"); // 테두리 색상
			}

			for (let i = 0; i < rows; i++) {
				for (let j = 0; j < cols; j++) {
					let fill = 'none';
					let opacity = '0.5';
					if (game.kill === kill[i] && game.time === time[j]) {
						// if (game.mode === "Norm")
							// opacity = "0.4";
						fill = d3.schemeCategory10[0];
					}
					// if (game.kill === kill[i] && game.time === time[j])
					// 	fill = colorScale(DataManager.gridData[cols*i + j].value);
					svg.append("rect")
						.attr("x", j * cellWidth + 100)
						.attr("y", i * cellHeight + 72)
						.attr("width", cellWidth)
						.attr("height", cellHeight)
						.attr("fill", fill)
						// .style("fill", fill) // 셀 채우기 없음
						.style("opacity", opacity) // 테두리 색상
						.style("stroke", "black"); // 테두리 색상
				}
			}

			const action:any = [
				{label: "straight", value: game.agentList.reduce((totalSum, agent) => {
					return totalSum + agent.feature['straight'].reduce((sum, n) => sum + n, 0);
				}, 0)},
				{label: "left", value: game.agentList.reduce((totalSum, agent) => {
					return totalSum + agent.feature['left'].reduce((sum, n) => sum + n, 0);
				}, 0)},
				{label: "right", value: game.agentList.reduce((totalSum, agent) => {
					return totalSum + agent.feature['right'].reduce((sum, n) => sum + n, 0);
				}, 0)}
			];
			const color = d3.scaleOrdinal()
				.range(d3.schemeSet2);
			const pie = d3.pie()
				.value(d => d['value']);
			const arc = d3.arc()
				.innerRadius(0)
				.outerRadius(Game.HEIGHT/(5/2));

			const group = svg.append("g")
				.attr("transform", `translate(315, 75)`);

			group.selectAll('path')
				.data(pie(action))
				.enter().append('path')
				.attr('d', arc)
				.attr('stroke', '#FFFFFF')
				.attr('stroke-width', '3px')
				// .attr('stroke-opacity', 1)
				// .style('opacity', (d, i) => `${(3-i)/10}`)
				.style('opacity', "0.2")
				// .attr('fill', (d, i) => d3.schemeCategory10[i]);
				// .attr('fill', (d, i) => d3.schemeSet2[i]);
				// .attr('fill', (d, i) => 'gray');
				.attr('fill', (d, i) => d3.schemeSet1[3]);

			group.selectAll("text")
				.data(pie(action))
				.enter().append("text")
				.attr("transform", d => `translate(${arc.centroid(d)})`)
				.attr("text-anchor", "middle")
				.text(d => d.data.value > 0 ? d.data.label : '')
				.style("fill", "black")
				.style("font-size", "14px");



			// const reward = {
			// 	"straight": [0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0],
			// 	"left": [1, 0, 0, 1, 0, 1, 1, 0, 0, 0, 0, 1, 0, 1, 1, 0, 0, 0, 0, 1, 0, 1, 1, 0, 0, 0, 0, 1, 0, 1, 1, 0, 0, 0, 0, 1, 0, 1, 1, 0, 0],
			// 	"right": [0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1],
			// 	"fruit": [0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 1, 0, 0, 0, 1],
			// 	"kill": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0],
			// 	"death": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0]
			// };
			const reward:any = [
				game.agentList.reduce((totalCount, agent) => {
					return totalCount + agent.feature['fruit'].filter(d => d === 1).length;
				}, 0),
				game.agentList.reduce((totalCount, agent) => {
					return totalCount + agent.feature['straight'].length + agent.feature['left'].length + agent.feature['right'].length;
				}, 0),
				game.agentList.reduce((totalCount, agent) => {
					return totalCount + agent.feature['kill'].filter(d => d === 1).length;
				}, 0),
				game.agentList.reduce((totalCount, agent) => {
					return totalCount + agent.feature['death'].filter(d => d === 1).length;
				}, 0)
			];
			const fruitReward = reward[0] * 1;
			const timeReward = reward[1] * game.time; // 전체 스텝 길이에 -0.3을 곱함
			const killReward = reward[2] * -1;
			const deathReward = reward[3] * game.kill;
			const rewards = [
				{category: "Fruit", value: fruitReward, color: d3.schemeSet2[0]},
				{category: "Time", value: timeReward, color: d3.schemeSet2[2]},
				{category: "Kill", value: killReward, color: d3.schemeSet2[1]},
				{category: "Death", value: deathReward, color: d3.schemeSet2[3]}
			];
			// const rewards = [
			// 	{category: "Fruit", value: fruitReward, color: "green"},
			// 	{category: "Time", value: timeReward, color: "blue"},
			// 	{category: "Kill", value: killReward, color: "red"},
			// 	{category: "Death", value: deathReward, color: "orange"}
			// ];
			// console.log(rewards);

			const xScale = d3.scaleBand()
				.domain(rewards.map(d => d.category))
				.range([0, Game.HEIGHT - 35])
				.padding(0.1);
        // y축 스케일 설정: 0을 포함하는 범위로 설정
			const yScale = d3.scaleLinear()
				.domain([d3.min(rewards, d => d.value), d3.max(rewards, d => d.value)])
				.range([Game.HEIGHT - 20, 0])
				.nice();

			const bar = svg.append("g")
				// .attr("width", 100)
				// .attr("height", 100)
				.attr("transform", `translate(${440},${10})`);
				
				bar.append("g")
				.style("font-size", "8px")
				.call(d3.axisLeft(yScale));
	
			bar.append("line")
				.attr("x1", 0)
				.attr("y1", yScale(0))
				.attr("x2", Game.HEIGHT - 30)
				.attr("y2", yScale(0))
				.attr("stroke", "black")
				.attr("stroke-width", 1);

			bar.selectAll(".bar")
				.data(rewards)
				.enter().append("rect")
				.attr("class", "bar")
				.attr("x", d => xScale(d.category)+2)
				.attr("width", xScale.bandwidth() - 5)
				.attr("y", d => yScale(Math.max(0, d.value)))
				.attr("height", d => Math.abs(yScale(d.value) - yScale(0)))
				.attr("fill", d => d.color);
				// .style("opacity", "0.5");
			// 레전드 추가
			const legend = bar.append("g")
				.attr("transform", `translate(${Game.HEIGHT + 4}, 0)`); // 레전드를 차트의 오른쪽에 배치
	
			rewards.forEach((d, i) => {
				const legendRow = legend.append("g")
					.attr("transform", `translate(0, ${i * 14})`);
	
				legendRow.append("rect")
					.attr("width", 5)
					.attr("height", 5)
					.attr("fill", d.color);
	
				legendRow.append("text")
					.attr("x", -6)
					.attr("y", 6)
					.attr("text-anchor", "end")
					.attr("font-size", "10px")
					.style("text-transform", "capitalize")
					.text(d.category);
			})





			svg.append("line")
				.attr("x1", 220)
				.attr("y1", 0)
				.attr("x2", 220)
				.attr("y2", Game.HEIGHT)
				.attr("stroke", "gray")
				.style('opacity', 0.2)
				.attr("stroke-width", 1);

			svg.append("line")
				.attr("x1", 410)
				.attr("y1", 0)
				.attr("x2", 410)
				.attr("y2", Game.HEIGHT)
				.attr("stroke", "gray")
				.style('opacity', 0.2)
				.attr("stroke-width", 1);

			svg.append('line')
				.attr('x1', x)
				.attr('x2', x + width)
				.attr('y1', height)
				.attr('y2', height)
				.style('shape-rendering', 'crispEdges')
				.style('stroke', C.borderPurpleColor);
        }
    }

    clearRows() {
        DataManager.gameList.forEach(mr => {
            mr.clear();
        });
        this.gameRows = [];
    }
}
