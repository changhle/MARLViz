import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ViewService } from '../service/view.service';
import { DataManager } from '../structure/data-manager';
import * as d3 from 'd3';

@Component({
	selector: 'detail-view',
	templateUrl: './detail-view.component.html',
	styleUrls: ['./detail-view.component.scss']
})
export class DetailViewComponent implements OnInit {

	@ViewChild('rootDiv', {static: true}) rootDivRef: ElementRef<HTMLDivElement>;
	@ViewChild('canvasDiv', {static: true}) canvasDivRef: ElementRef<HTMLDivElement>;
	@ViewChild('svgDiv', { static: true }) svgDivRef: ElementRef<HTMLDivElement>;
	public rootDiv: HTMLDivElement;
	public canvasDiv: HTMLDivElement;
	public svgDiv: HTMLDivElement;

	public dm: DataManager;
	public canvas: HTMLCanvasElement;
	public ctx: CanvasRenderingContext2D;
	public legend;
	public svg;
	public lineChart;

	public width;
    public height;

	public isInitialized = false;

	constructor(public view: ViewService) {
        this.view.detalView = this;
        this.dm = DataManager;
    }

	ngOnInit() {
		this.rootDiv = this.rootDivRef.nativeElement;
		// this.canvasDiv = this.canvasDivRef.nativeElement;
		this.svgDiv = this.svgDivRef.nativeElement;

		// this.canvas = d3.select(this.canvasDiv).append('canvas').node();
		this.legend = d3.select("#legend").append('svg');
		this.svg = d3.select(this.svgDiv).append('svg');
		this.lineChart = d3.select("#reward").append('svg');
	}

	initialize() {
        if (this.isInitialized) return;

        this.width = this.rootDiv.clientWidth;
        this.height = this.rootDiv.clientHeight;

        // this.canvas.width = this.width;
        // this.canvas.height = this.width;
        // this.ctx = this.canvas.getContext('2d');

        this.svg
            .attr('width', this.width)
            .attr('height', this.width);
			
		this.legend
            .attr('width', this.width)
            .attr('height', 30);

        this.isInitialized = true;
    }

	updateUI() {
        if (!DataManager.isDataLoaded) return;
        if (!this.isInitialized) return;

        this.svg.selectAll('*').remove();
		this.lineChart.selectAll('*').remove();
		this.legend.selectAll('*').remove();
        // this.lineChart.remove();

		// this.svg = d3.select(this.svgDiv).append('svg');
		// this.width = 400;
		this.svg
			.attr('transform', `translate(${15},${0})`)
            .attr('width', this.width - 30)
            .attr('height', this.width - 30);

		// const data = [{'0': [7, 7], '1': [2, 8], '2': [4, 3], '3': [2, 6]}, {'0': [8, 7], '1': [2, 9], '2': [4, 4], '3': [1, 6]}, {'0': [9, 7], '1': [2, 10], '2': [4, 5], '3': [1, 7]}, {'0': [10, 7], '1': [3, 10], '2': [5, 5], '3': [1, 8]}, {'0': [10, 6], '1': [4, 10], '2': [5, 4], '3': [2, 8]}, {'0': [10, 5], '1': [4, 11], '2': [5, 3]}, {'0': [9, 5], '1': [4, 12], '2': [4, 3]}, {'0': [9, 6], '1': [5, 12], '2': [3, 3]}, {'0': [10, 6], '2': [3, 2]}, {'0': [10, 7], '2': [4, 2]}, {'0': [10, 8], '2': [5, 2]}, {'0': [9, 8], '2': [5, 1]}, {'0': [9, 7], '2': [4, 1]}, {'0': [10, 7]}, {'0': [11, 7]}, {'0': [11, 6]}, {'0': [12, 6]}, {'0': [12, 7]}, {'0': [12, 8]}]
		const game = DataManager.gameList.find(game => game.selected === true);
		const data = game.mapCoord;
		// console.log(data);
		// 맵 크기 설정
		const mapSize = 14;
		const cellSize = (this.width - 30) / mapSize; // 셀 크기

		// 에이전트별 색상 설정
		const colorScale = d3.scaleOrdinal()
			.domain(['0', '1', '2', '3'])
			.range(["red", "blue", "green", "yellow"]);
			// .range([d3.schemeCategory10[3], d3.schemeCategory10[0], d3.schemeCategory10[2], d3.schemeCategory10[4]]);

		// 히트맵 데이터 초기화
		let heatmapData = Array.from({length: mapSize}, () =>
			Array.from({length: mapSize}, () => ({
				count: 0, agents: {'0': 0, '1': 0, '2': 0, '3': 0}
			}))
		);

		const agents = ["agent0", "agent1", "agent2", "agent3"];
		const agentColor = ["red", "blue", "green", "yellow"];
		for (let i = 0; i < game.num_agent; i++) {
			const legendRow = this.legend.append("g")
				.attr("transform", `translate(${(i+1/2)*((this.width)/game.num_agent) + 17}, 10)`);

			legendRow.append("rect")
				.attr("width", 10)
				.attr("height", 10)
				.attr("fill", agentColor[i]);

			legendRow.append("text")
				.attr("x", -10)
				.attr("y", 10)
				.attr("text-anchor", "end")
				.attr("font-size", "14px")
				.style("text-transform", "capitalize")
				.text(agents[i]);
		}

		// 데이터 처리
		let maxVisits = 0;
		data.forEach(row => {
			console.log(row);
			Object.keys(row).forEach(agent => {
				const [y, x] = row[agent];
				heatmapData[y-1][x-1].count += 1;
				heatmapData[y-1][x-1].agents[String(agent)] += 1;
				maxVisits = Math.max(maxVisits, heatmapData[y-1][x-1].agents[agent]);
			});
		});
		console.log(heatmapData);
		// 셀 그리기

		this.svg.selectAll("g")
			.data(heatmapData.flat())
			.enter()
			.append("rect")
			.attr("x", (d, i) => (i % mapSize) * cellSize)
			.attr("y", (d, i) => Math.floor(i / mapSize) * cellSize)
			.attr("width", cellSize)
			.attr("height", cellSize)
			.style("fill", d => {
				return colorScale('0');
			})
			.style("opacity", d => d.count ? 0.01 + d.agents['0'] / maxVisits : 0);

		this.svg.selectAll("g")
			.data(heatmapData.flat())
			.enter()
			.append("rect")
			.attr("x", (d, i) => (i % mapSize) * cellSize)
			.attr("y", (d, i) => Math.floor(i / mapSize) * cellSize)
			.attr("width", cellSize)
			.attr("height", cellSize)
			.style("fill", d => {
				return colorScale('1');
			})
			.style("opacity", d => d.count ? 0.01 + d.agents['1'] / maxVisits : 0);

		this.svg.selectAll("g")
			.data(heatmapData.flat())
			.enter()
			.append("rect")
			.attr("x", (d, i) => (i % mapSize) * cellSize)
			.attr("y", (d, i) => Math.floor(i / mapSize) * cellSize)
			.attr("width", cellSize)
			.attr("height", cellSize)
			.style("fill", d => {
				return colorScale('2');
			})
			.style("opacity", d => d.count ? 0.01 + d.agents['2'] / maxVisits : 0);

		this.svg.selectAll("g")
			.data(heatmapData.flat())
			.enter()
			.append("rect")
			.attr("x", (d, i) => (i % mapSize) * cellSize)
			.attr("y", (d, i) => Math.floor(i / mapSize) * cellSize)
			.attr("width", cellSize)
			.attr("height", cellSize)
			.style("fill", d => {
				return colorScale('3');
			})
			.style("opacity", d => d.count ? 0.01 + d.agents['3'] / maxVisits : 0);

		// 셀 테두리 그리기
		this.svg.selectAll("g")
			.data(heatmapData.flat())
			.enter()
			.append("rect")
			.attr("x", (d, i) => (i % mapSize) * cellSize)
			.attr("y", (d, i) => Math.floor(i / mapSize) * cellSize)
			.attr("width", cellSize)
			.attr("height", cellSize)
			.style("fill", "none")
			.style("stroke", "#000");

		const agentCategories = ['0', '1', '2', '3']; // 예시 범주
		const categoriesColorScale = d3.scaleOrdinal().domain(agentCategories).range(["red", "blue", "green", "yellow"]); // 색상 스케일
		
		// 그리드 위에 범주 표기하기
		this.svg.selectAll("text.agent-category")
			.data(agentCategories)
			.enter()
			.append("text")
			.attr("class", "agent-category")
			.attr("x", (d, i) => (i * cellSize) + (cellSize / 2)) // 셀의 중앙 위치
			.attr("y", 0) // 그리드 위에 위치
			.attr("dy", "-1em") // 텍스트를 셀 위로 조금 올림
			.style("text-anchor", "middle") // 텍스트 중앙 정렬
			.style("fill", d => categoriesColorScale(d)) // 범주에 따라 색상 적용
			.text(d => `Agent ${d}`); // 범주 이름 표시



		// this.lineChart = d3.select("#reward").append('svg')
		// 	.attr("width", this.width)
		// 	.attr("height", this.height - this.width);

		// const action = {
        //     "straight": [0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0],
        //     "left": [1, 0, 0, 1, 0, 1, 1, 0, 0, 0, 0, 1, 0, 1, 1, 0, 0, 0, 0, 1, 0, 1, 1, 0, 0, 0, 0, 1, 0, 1, 1, 0, 0, 0, 0, 1, 0, 1, 1, 0, 0],
        //     "right": [0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1],
        //     "fruit": [0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 1, 0, 0, 0, 1],
        //     "kill": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0]
        // };
		// Math.max(...action.straight);
		// const maxLength = Math.max(game.agentList.map(a => Math.max(a.straight.length, a.left.length, a.right.length, a.fruit.length, a.kill.length)));
		let maxLength = 0;
		for (const agent of game.agentList) {
			maxLength = Math.max(maxLength, agent.feature.straight.length);
			maxLength = Math.max(maxLength, agent.feature.left.length);
			maxLength = Math.max(maxLength, agent.feature.right.length);
			maxLength = Math.max(maxLength, agent.feature.fruit.length);
			maxLength = Math.max(maxLength, agent.feature.kill.length);
			maxLength = Math.max(maxLength, agent.feature.death.length);
		}

		const action = {
			straight: Array(maxLength).fill(0),
			left: Array(maxLength).fill(0),
			right: Array(maxLength).fill(0),
			fruit: Array(maxLength).fill(0),
			kill: Array(maxLength).fill(0),
			death: Array(maxLength).fill(0)
		};

		for (let i = 0; i < maxLength; i++) {
			game.agentList.forEach(agent => {
				action.straight[i] += agent.feature.straight[i] || 0;
				action.left[i] += agent.feature.left[i] || 0;
				action.right[i] += agent.feature.right[i] || 0;
				action.fruit[i] += agent.feature.fruit[i] || 0;
				action.kill[i] += agent.feature.kill[i] || 0;
				action.death[i] += agent.feature.death[i] || 0;
			});
		}

        // 보상 계산
        let rewards = [0];
        for (let i = 0; i < action.straight.length; i++) {
            let reward = rewards[rewards.length - 1];
            if (action.straight[i] === 1 || action.left[i] === 1 || action.right[i] === 1) {
                reward += game.time;
            }
            if (action.fruit[i] === 1) {
                reward += 1;
            }
            if (action.kill[i] === 1) {
                reward -= 1;
            }
            if (action.death[i] === 1) {
                reward += game.kill;
            }
            rewards.push(reward);
        }

        // 차트 크기 설정
        const margin = {top: 20, right: 20, bottom: 30, left: 50},
            // width = this.width * 2 - margin.left - margin.right,
            width = action.straight.length * 8,
            height = this.height - this.width - margin.top - margin.bottom;

        // 스케일 설정
        const x = d3.scaleLinear().domain([0, action.straight.length]).range([0, width]);
        const y = d3.scaleLinear().domain([d3.min(rewards), d3.max(rewards)]).range([height - 10, 0]);

        // SVG 생성
        this.lineChart
            .attr("width", width + 80)
            .attr("height", this.height - this.width)
			.append("g")
            .attr("transform", `translate(${margin.left},${margin.top + 5})`);

        // 라인 생성
        const line = d3.line<number>()
            .x((d, i) => x(i))
            .y(d => y(d));

        // 라인 및 점 추가
        this.lineChart.select("g")
			.append("path")
            .datum(rewards)
            .attr("fill", "none")
            .attr("stroke", "black")
            .attr("stroke-width", 1)
            .attr("d", line);

        // "kill"이 1인 곳에 빨간 세로선 추가
        action.fruit.forEach((k, i) => {
            if (k === 1) {
                this.lineChart.select("g")
					.append("line")
                    .attr("x1", x(i))
                    .attr("y1", y(d3.min(rewards)))
                    .attr("x2", x(i))
                    .attr("y2", y(d3.max(rewards)))
                    .attr("stroke", d3.schemeSet2[0])
                    .attr("stroke-width", 2)
                    .style("stroke-dasharray", ("4, 2"));
            }
        });
        // "kill"이 1인 곳에 빨간 세로선 추가
        action.kill.forEach((k, i) => {
            if (k === 1) {
                this.lineChart.select("g")
					.append("line")
                    .attr("x1", x(i))
                    .attr("y1", y(d3.min(rewards)))
                    .attr("x2", x(i))
                    .attr("y2", y(d3.max(rewards)))
                    .attr("stroke", d3.schemeSet2[1])
                    .attr("stroke-width", 2)
                    .style("stroke-dasharray", ("4, 2"));
            }
        });
        // "kill"이 1인 곳에 빨간 세로선 추가
        action.death.forEach((k, i) => {
            if (k === 1) {
                this.lineChart.select("g")
					.append("line")
                    .attr("x1", x(i))
                    .attr("y1", y(d3.min(rewards)))
                    .attr("x2", x(i))
                    .attr("y2", y(d3.max(rewards)))
                    .attr("stroke", d3.schemeSet2[3])
                    .attr("stroke-width", 2)
                    .style("stroke-dasharray", ("4, 2"));
            }
        });

		this.lineChart.append("text")
            .attr("class", "axis-label")
            .attr("transform", "rotate(-90)")
            .attr("x", -95)
            .attr("y", height / 8) // y축 왼쪽에 위치
            .style("text-anchor", "middle")
            .style("font-family", "sans-serif")
            .style("font-size", "12px")
            // .style("font-weight", "300")
            // .style("letter-spacing", "1px")
            .text("Reward");

		this.lineChart.append("text")
            .attr("class", "axis-label")
            // .attr("transform", "rotate(-90)")
            .attr("x", 225)
            .attr("y", height + 45) // y축 왼쪽에 위치
            .style("text-anchor", "middle")
            .style("font-family", "sans-serif")
            .style("font-size", "12px")
            // .style("font-weight", "300")
            // .style("letter-spacing", "1px")
            .text("Step");

        // 축 추가
        this.lineChart.select("g")
			.append("g")
            .attr("transform", `translate(0,${height - 10})`)
            .call(d3.axisBottom(x).ticks(maxLength/10));

        this.lineChart.select("g")
			.append("g")
            .call(d3.axisLeft(y));

		
		this.lineChart.append("line")
			.attr("x1", 0)
			.attr("y1", 12)
			.attr("x2", width + 80)
			.attr("y2", 12)
			.attr("stroke", "gray")
			.style('opacity', 0.2)
			.attr("stroke-width", 1);
	}
}
