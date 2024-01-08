import { Constants as C } from '../constants';
import * as util from '../util';
import * as d3 from 'd3';
import { FitUser } from './fit-user';
import { Student } from './student';
import { Snake } from './snake';

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
