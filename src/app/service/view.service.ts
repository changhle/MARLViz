import { Injectable } from '@angular/core';
import { MainPageComponent } from '../main-page/main-page.component';
import { MapViewComponent } from '../map-view/map-view.component';
import { UserListViewComponent } from '../user-list-view/user-list-view.component';
import { RecordListViewComponent } from '../record-list-view/record-list-view.component';
import { RecordSubViewComponent } from '../record-sub-view/record-sub-view.component';
import { TemporalViewComponent } from '../temporal-view/temporal-view.component';
import { WorkoutMatrixViewComponent } from '../workout-matrix-view/workout-matrix-view.component';

@Injectable({
    providedIn: 'root'
})
export class ViewService {

    public mainPage: MainPageComponent;

    public userListView: UserListViewComponent;
    public workoutMatrixView: WorkoutMatrixViewComponent;
    public recordListView: RecordListViewComponent;
    public recordSubView: RecordSubViewComponent;
    public temporalView: TemporalViewComponent;

    constructor() { }

}
