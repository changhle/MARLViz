import { Component, OnInit } from '@angular/core';
import { SocketIOService } from '../service/socketio.service';
import { ViewService } from '../service/view.service';

@Component({
    selector: 'main-page',
    templateUrl: './main-page.component.html',
    styleUrls: ['./main-page.component.scss']
})
export class MainPageComponent implements OnInit {

    public isWaiting = false;
    public waitingMessage = 'None';
    public isServerConnected = false;

    constructor(public socket: SocketIOService, public view: ViewService) { 
        this.view.mainPage = this;
    }

    ngOnInit() {
        this.socket.setWaitingStatus = this.setWaitingStatus.bind(this);
        this.socket.setServerConnection = this.setServerConnection.bind(this);
        this.socket.connectSocketServer();
    }

    setWaitingStatus(isWaiting: boolean, message?: string) {
        this.isWaiting = isWaiting;
        if (message) {
            this.waitingMessage = message;
        }
    }

    setServerConnection(isConnected: boolean) {
        this.isServerConnected = isConnected;
    }

}
