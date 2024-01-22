import { Injectable } from '@angular/core';
import { ViewService } from './view.service';
import { DataManager } from '../structure/data-manager';
import * as io from 'socket.io-client';

@Injectable({
    providedIn: 'root'
})
export class SocketIOService {

    private readonly devServer = 'http://localhost:8664';
    // private readonly devServer = 'http://223.194.46.216:8664';

    private address;
    private socket: SocketIOClient.Socket;

    public isWaiting = false;

    // Main Page
    public setWaitingStatus: (boolean, string?) => void;
    public setServerConnection: (boolean) => void;

    constructor(public view: ViewService) {
        this.address = this.devServer;
    }

    connectSocketServer() {
        this.socket = io(this.address, {
            transports: ['websocket'],
            reconnection: false
        });

        this.socket.on('connect', () => {
            console.log('SocketIO: socket connected');
        });

        this.socket.on('ping', () => {
            console.log('ping');
        });
        this.socket.on('pong', (ms) => {
            console.log('pong', ms);
        });

        this.socket.on('disconnect', (reason) => {
            console.log('SocketIO: disconnected :', reason);
            this.setServerConnection(false);
        });

        this.socket.on('connection_response', () => {
            console.log('SocketIO: handshake success');
            this.setServerConnection(true);
            
            DataManager.isDataLoaded = true;

            // this.view.workoutMatrixView.initialize();

            this.setWaitingStatus(true, 'Loading dummy data ...');
            this.socket.emit('user');
        });
        
        this.socket.on('user', (data) => {
            console.log('SocketIO: user', data);
            
            DataManager.setStudent(data['snake_list']);
            
            // this.view.userListView.initialize();
            // this.view.userListView.updateUI();
            // this.view.configView.initialize();
            // this.view.configView.updateUI();
            // this.view.recordListView.initialize();
            // this.view.recordListView.updateUI();
            // this.view.recordSubView.initialize();
            // this.view.recordSubView.updateUI();

            this.setWaitingStatus(false);
        });

        // this.socket.on('user_workout_matrix', (data) => {
        //     console.log('SocketIO: user_workout_matrix', data);

        //     this.view.workoutMatrixView.setData(data);
        //     this.view.workoutMatrixView.updateUI();

        //     this.setWaitingStatus(false);
        // });
    }

    requestUserWorkoutMatrix(packet) {
        console.log('Request: user workout matrix', packet);

        this.setWaitingStatus(true, 'Request Rider OD Info ...');
        this.socket.emit('user_workout_matrix', packet);
    }
}
