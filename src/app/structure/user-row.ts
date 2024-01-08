import { TableRow } from "./table-row";
import { DataManager } from "./data-manager";
import { Constants as C } from '../constants';
import * as d3 from 'd3';
import * as util from '../util';
import { FitUser } from "./fit-user";

export class UserRow extends TableRow {

    public static readonly HEIGHT = 40;

    public svgRendered = false;

    constructor(public user: FitUser) {
        super();
        this.position.x = 0;
        this.position.height = UserRow.HEIGHT;
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

    clear() {
        this.svg.selectAll('*');
        this.svg.remove();
    }

    updateSVG() {
        this.svg.selectAll('.row-background')
        .attr('fill', () => {
            if (this.selected) return C.rowSelectColor;
            else return 'white';
        });
    }

    drawSVG() {
        let svg = this.svg;

        let x = this.position.x;
        let y = this.position.y;
        let width = this.position.width;
        let height = this.position.height;

        let fontSize = 0.8;

        svg.append('rect')
            .attr('class', 'row-background')
            .attr('x', x)
            .attr('y', 2)
            .attr('width', width)
            .attr('height', height - 5)
            .attr('fill', () => {
                if (this.selected) return C.rowSelectColor;
                else return 'white';
            })
            // .style('cursor', 'pointer')
            .on('click', () => {
                this.selected = !this.selected;
                this.updateSVG();
            });

        svg.append('line')
            .attr('x1', x)
            .attr('x2', x + width)
            .attr('y1', height)
            .attr('y2', height)
            .style('shape-rendering', 'crispEdges')
            .style('stroke', C.borderPurpleColor);

        svg.append('text')
            .attr('class', 'rider-id')
            .attr('x', 10)
            .attr('y', height / 2 - 4)
            .attr("font-family", C.fontRobotoCondensed)
            .attr("font-size", fontSize + "rem")
            .attr('alignment-baseline', 'middle')
            .attr('text-anchor', 'start')
            .attr("fill", C.grayFontColor)
            .text('' + this.user.id)
            .on('click', () => {
                this.selected = !this.selected;
                this.updateSVG();
            });

        // let sex = this.rider.categoryDict[RiderAttribute.SEX.label];
        // let ag = this.rider.categoryDict[RiderAttribute.AGE_GROUP.label];
        // svg.append('text')
        //     .attr('class', 'rider-sex-age')
        //     .attr('x', 90)
        //     .attr('y', height / 2)
        //     .attr("font-family", C.fontRobotoCondensed)
        //     .attr("font-size", fontSize + "rem")
        //     .attr('alignment-baseline', 'middle')
        //     .attr('text-anchor', 'start')
        //     .attr("fill", C.grayFontColor)
        //     .text(sex + ' / ' + ag);

        // let cx = 146;
        
        
        // let ch = 14;
        // let currData = this.rider.timeTrafficDict[RiderAttribute.TRAFFIC.label];
        // let maxVal = this.rider.maxTrafficDict[RiderAttribute.TRAFFIC.label];

        // let dat = [];
        // for (let j = 0; j < currData.length; j++) {
        //     let d  = {
        //         idx: j,
        //         val: currData[j]
        //     };
        //     dat.push(d);
        // }

        let cw = width - 50;
        let cy = height / 2 + 5;
        let ch = 7;
        let xScale = d3.scaleLinear().domain([0, DataManager.maxUserRecordCount]).range([0, cw]);
        // let yScale = d3.scaleLinear().domain([0, maxVal]).range([ch, 0]);

        // svg.append('g')
        // .attr('transform', util.translate(cx, cy))
        // .append("path")
        //     .datum(dat)
        //     .attr("fill", "none")
        //     .attr("stroke", "steelblue")
        //     .attr("stroke-width", 1.5)
        //     .attr("d", d3.line()
        //         .x((d: any) => xScale(d.idx))
        //         .y((d: any) => yScale(d.val))
        //     );

        // cy  = cy + ch + 7;
        // ch = 6;
        // let stat = DataManager.totalAttrStatDict[RiderAttribute.TRAFFIC.label];
        // let txScale = d3.scaleLinear().domain([0, stat.maxVal]).range([0, cw]);
        // let traffic = this.rider.valueDict[RiderAttribute.TRAFFIC.label];

        svg.append('rect')
            .attr('class', 'rider-traffic-b')
            .attr('x', 10)
            .attr('y', cy)
            .attr('width', xScale(this.user.recordCount))
            .attr('height', ch)
            .attr('rx', 2)
            .attr("fill", C.barPurpleColor);
    }

    drawCanvas() {

    }

    draw() {
        this.drawCanvas();
        if (!this.svgRendered) {
            this.drawSVG();
            this.svgRendered = true;
        }
    }
}