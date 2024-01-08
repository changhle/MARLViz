import { FitRecord } from "./fit-record";

export class FitUser {
    public recordCount: number;
    public recordList: FitRecord[];

    public timeEquipRecordDict: {[teID: string]: FitRecord[]};

    constructor(public id: string, recordList: []) {
        this.recordCount = recordList.length;
        this.recordList = [];
        this.timeEquipRecordDict = {};
        recordList.forEach(r => {
            let record = new FitRecord(r);
            this.recordList.push(record);
            if (!this.timeEquipRecordDict.hasOwnProperty(record.timeEquipID)) {
                this.timeEquipRecordDict[record.timeEquipID] = [];
            }
            this.timeEquipRecordDict[record.timeEquipID].push(record);
        });
    }


}
