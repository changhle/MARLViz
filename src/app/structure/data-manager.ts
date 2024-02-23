import { Constants as C } from '../constants';
import * as util from '../util';
import * as d3 from 'd3';
import { FitUser } from './fit-user';
import { Student } from './student';
import { Snake } from './snake';
import { Game } from './game';
import { Agent } from './agent';


export class DataManager {

    public static isDataLoaded = false;

    public static allUserList: FitUser[] = [];
    public static allUserDict: {[riderID: string]: FitUser} = {};
    public static targetUserList: FitUser[] = [];

    public static maxUserRecordCount = -1;

    // public static hobbyList: string[] = [];
    // public static exerciseList: string[] = [];
    // public static studyList: string[] = [];
    // public static sleepList: string[] = [];
    // public static statusList: string[] = [];
    // public static classList: string[] = [];

    public static snakeList: Snake[] = [];
    public static gameList: Game[] = [];

    public static mode = [];
    public static num_agent = [];
    public static gridData = [];
    // public static studentList: Student[] = [];

    public static colorScale;

    constructor() {
    }

    static _Initialize() {
        let aColorStr = '#ffffcc';
        this.colorScale = d3.scaleLinear()
        .domain([0, 1])
        .range([aColorStr as any, C.tableauRed as any]);
    }
    
    // static setUser(raw) {
    //     let userDict = raw['user_record'];
    //     let userIDList = raw['user_id_list'];
    //     let hobbyList = raw['hobby_list']
    //     let exerciseList = raw['exercise_list']
    //     let studyList = raw['study_list']
    //     let sleepList = raw['sleep_list']
    //     let statusList = raw['status_list']
    //     let classList = raw['class_list']
    //     userIDList.forEach(uID => {
    //         let recordList = userDict[uID];
    //         let user = new FitUser(uID, recordList);
    //         this.allUserList.push(user);
    //         this.allUserDict[uID] = user;
            
    //         if (this.maxUserRecordCount < user.recordCount) {
    //             this.maxUserRecordCount = user.recordCount;
    //         }
    //     });
        
    //     this.allUserList.sort((a, b) => {
    //         return b.recordCount - a.recordCount;
    //     });
    //     console.log(this.allUserList);
    // }


    static setMode() {
        this.mode = [
            {label: "Norm", value: 0},
            {label: "Coop", value: 0}
        ];
    }

    static setNumAgent() {
        this.num_agent = [
            {label: "2", value: 0},
            {label: "3", value: 0},
            {label: "4", value: 0}
        ];
    }

    static setGridData() {
        this.gridData = [];
        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 4; col++) {
                this.gridData.push({
                    row: row,
                    col: col,
                    value: 0
                });
            }
        }
    }

    static updateMode(mode) {
        if (mode === 'Norm')
            this.mode[0]['value']++;
        else
            this.mode[1]['value']++;
    }

    static updateNumAgent(num_agent) {
        if (num_agent === 2)
            this.num_agent[0]['value']++;
        else if (num_agent === 3)
            this.num_agent[1]['value']++;
        else
            this.num_agent[2]['value']++;
    }

    static updateGridData(kill, time) {
        if (kill === -1 && time === -0.03)
            this.gridData[0]['value']++;
        else if (kill === -1 && time === -0.01)
            this.gridData[1]['value']++;
        else if (kill === -1 && time === 0.01)
            this.gridData[2]['value']++;
        else if (kill === -1 && time === 0.03)
            this.gridData[3]['value']++;
        else if (kill === -2 && time === -0.03)
            this.gridData[4]['value']++;
        else if (kill === -2 && time === -0.01)
            this.gridData[5]['value']++;
        else if (kill === -2 && time === 0.01)
            this.gridData[6]['value']++;
        else if (kill === -2 && time === 0.03)
            this.gridData[7]['value']++;
        else if (kill === -3 && time === -0.03)
            this.gridData[8]['value']++;
        else if (kill === -3 && time === -0.01)
            this.gridData[9]['value']++;
        else if (kill === -3 && time === 0.01)
            this.gridData[10]['value']++;
        else if (kill === -3 && time === 0.03)
            this.gridData[11]['value']++;
    }

    static updateBrushed() {
        this.gameList.forEach(game => {
            game.brushed = game.agentList.some(agent => agent.brushed);
            console.log(game.brushed);
            game.selected = false;
        })
    }

    static updateSelected() {
        this.gameList.forEach(game => {
            game.brushed = game.agentList.some(agent => agent.brushed);
        })
    }

    static setSimilarity(rawList) {
        this.gameList = [];

        rawList.forEach((agent) => {
            const gameIndex = this.gameList.findIndex(game => 
                game.mode === agent.mode && 
                game.num_agent === agent.num_agent && 
                game.kill === agent.kill && 
                game.time === agent.time
            );

            if (gameIndex === -1) {
                this.gameList.push(new Game(agent));
            } else {
                this.gameList[gameIndex].agentList.push(new Agent(agent));
            }
        }, []);
    }

    static setStudent(rawList) {
        this.snakeList = [];
        rawList.forEach(raw => {
            let s = new Snake(raw);
            this.snakeList.push(s);
        });
        console.log(this.snakeList);
    }
}
DataManager._Initialize();
