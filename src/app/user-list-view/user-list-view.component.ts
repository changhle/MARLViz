import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ViewService } from '../service/view.service';
import { DataManager } from '../structure/data-manager';
import { Constants as C } from '../constants';
import * as d3 from 'd3';
import * as util from '../util';
import { UserRow } from '../structure/user-row';
import { SocketIOService } from '../service/socketio.service';

@Component({
    selector: 'user-list-view',
    templateUrl: './user-list-view.component.html',
    styleUrls: ['./user-list-view.component.scss']
})
export class UserListViewComponent implements OnInit {
    
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
    public listGroup;

    public width;
    public height;
    public chartMargin = {top: 10, right: 20, bottom: 40, left: 50};
    public chartHeight;
    public chartWidth;

    public userRows: UserRow[] = [];

    public newRowID = 1;

    public isInitialized = false;

    constructor(public view: ViewService, public socket: SocketIOService) {
        this.view.userListView = this;
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

        this.listGroup = this.svg.append('g');

        this.updateRenderingRows();

        this.isInitialized = true;
    }

    onClickExplore() {
        let selectedRows: UserRow[] = [];
        this.userRows.forEach(row => {
            if (row.selected) {
                selectedRows.push(row);
            }
        });

        if (selectedRows.length === 0) return;

        DataManager.targetUserList = [];
        let idList = [];
        selectedRows.forEach(row => {
            DataManager.targetUserList.push(row.user);
            idList.push(row.user.id);
        });

        let packet = {
            'user_id_list': idList
        }
        this.socket.requestUserWorkoutMatrix(packet);
    }

    updateRenderingRows() {
        this.clearRows();

        DataManager.allUserList.forEach(user => {
            let userRow = new UserRow(user);
            userRow.setSVG(this.listGroup);
            userRow.setCanvas(this.ctx);
            userRow._id = this.newRowID++;
            this.userRows.push(userRow);
        });
    }

    updateLayoutSize() {
        this.height = this.userRows.length * UserRow.HEIGHT;

        this.canvas.height = this.height;
        this.ctx = this.canvas.getContext('2d');

        this.svg.attr('height', this.height);
    }

    updateRowPosition() {
        let rowY = 0;
        for (let i = 0 ; i < this.userRows.length; i++) {
            let row = this.userRows[i];
            let currHeight = row.position.height;
            row.setPosition(0, rowY, this.width, currHeight);
            rowY += currHeight;
        }
    }

    updateUI() {
        if (!DataManager.isDataLoaded) return;
        if (!this.isInitialized) return;

        this.updateLayoutSize();
        this.updateRowPosition();

        this.drawRows();
    }

    drawRows() {
        for (let i = 0 ; i < this.userRows.length; i++) {
            let r = this.userRows[i];
            r.draw();
        }
    }

    clearRows() {
        this.userRows.forEach(mr => {
            mr.clear();
        });
        this.userRows = [];
    }

}
