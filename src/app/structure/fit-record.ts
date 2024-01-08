export class FitRecord {

    public id: string;
    public userID: string;
    public startTime: string;
    public equip: string;
    public count: number;
    public duration: number;
    public logs: any[];

    public timeEquipID: string;    

    constructor(raw) {
        this.id = raw['id'];
        this.userID = raw['user'];
        this.startTime = raw['start'];
        this.equip = raw['equip'];
        this.count = raw['count'];
        this.duration = raw['duration'];
        this.logs = raw['data'];

        this.timeEquipID = this.startTime.split(' ')[0] + '-' + this.equip;
    }
}