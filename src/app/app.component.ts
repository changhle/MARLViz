import { Component, OnInit, ComponentRef } from '@angular/core';
import { ComponentLoaderService } from './service/component-loader.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

    private dirtyRefs: ComponentRef<any>[] = [];
    constructor(public cl: ComponentLoaderService) {
        this.cl.app = this;
    }

    ngOnInit() {
    }

    addDirtyRef(cRef: ComponentRef<any>) {
        this.dirtyRefs.push(cRef);
    }

    ngDoCheck() {
        this.dirtyRefs.forEach(cRef => {
            if (cRef) {
                cRef.changeDetectorRef.detectChanges();
            }
        });
    }
}
