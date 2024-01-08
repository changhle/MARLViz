import { Injectable, ComponentFactoryResolver, Injector, ComponentRef, Type } from '@angular/core';
import { AppComponent } from '../app.component';
import { LeafletControlSwitchComponent } from '../leaflet/leaflet-control-switch/leaflet-control-switch.component';
import { LeafletDummyPanelComponent } from '../leaflet/leaflet-dummy-panel/leaflet-dummy-panel.component';

@Injectable({
    providedIn: 'root'
})
export class ComponentLoaderService {

    public app: AppComponent;

    constructor(private cf: ComponentFactoryResolver,
                private injector: Injector) {
        }

    getControlSwitchComponent(): ComponentRef<LeafletControlSwitchComponent> {
        return this.getComponentReference(LeafletControlSwitchComponent);
    }

    getDummyPanelComponent(): ComponentRef<LeafletDummyPanelComponent> {
        let ref = this.getComponentReference(LeafletDummyPanelComponent);
        return ref;
    }

    getComponentReference<T>(componentType: Type<T>): ComponentRef<T> {
        const factory = this.cf.resolveComponentFactory<T>(componentType);
        let cRef = factory.create(this.injector);
        cRef.changeDetectorRef.detectChanges();
        this.app.addDirtyRef(cRef);
        return cRef;
    }
}
