import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { MainPageComponent } from './main-page/main-page.component';
import { MapViewComponent } from './map-view/map-view.component';
import { LeafletControlSwitchComponent } from './leaflet/leaflet-control-switch/leaflet-control-switch.component';
import { LeafletDummyPanelComponent } from './leaflet/leaflet-dummy-panel/leaflet-dummy-panel.component';

import { Spinner2ClassPipe } from './pipe/spinner-class.pipe';
import { UserListViewComponent } from './user-list-view/user-list-view.component';
import { RecordListViewComponent } from './record-list-view/record-list-view.component';
import { RecordSubViewComponent } from './record-sub-view/record-sub-view.component';
import { TemporalViewComponent } from './temporal-view/temporal-view.component';
import { WorkoutMatrixViewComponent } from './workout-matrix-view/workout-matrix-view.component';
import { ConfigViewComponent } from './config-view/config-view.component';
import { OverViewComponent } from './over-view/over-view.component';
import { DetailViewComponent } from './detail-view/detail-view.component';
import { SummaryViewComponent } from './summary-view/summary-view.component';

@NgModule({
    declarations: [
        AppComponent,
        MainPageComponent,
        MapViewComponent,
        Spinner2ClassPipe,
        LeafletControlSwitchComponent,
        LeafletDummyPanelComponent,
        UserListViewComponent,
        RecordListViewComponent,
        TemporalViewComponent,
        WorkoutMatrixViewComponent,
        RecordSubViewComponent,
        ConfigViewComponent,
        OverViewComponent,
        DetailViewComponent,
        SummaryViewComponent
    ],
    imports: [
        BrowserModule,
        FormsModule
    ],
    providers: [],
    bootstrap: [AppComponent],
    entryComponents: [
        LeafletControlSwitchComponent,
        LeafletDummyPanelComponent
    ]
})
export class AppModule { }
