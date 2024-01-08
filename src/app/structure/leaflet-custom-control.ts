import { 
    HostBinding,
    HostListener } from '@angular/core';

export class LeafletCustomControl {
    
    public label: string;
    public leafletControl: L.Control;
    public isSelected = false;

    @HostBinding('style.display') styleDisplay = '';

    @HostListener('click', ['$event'])
    onHostClick(event: MouseEvent) {
        event.stopPropagation();
    }
    
    @HostListener('dblclick', ['$event'])
    onHostDblClick(event: MouseEvent) {
        event.stopPropagation();
    }

    @HostListener('mousewheel', ['$event'])
    onHostScroll(event: Event) {
        event.stopPropagation();
    }

    constructor() {
    }

    toggleVisibility(show) {
        this.isSelected = show;
        if (show) this.styleDisplay = '';
        else this.styleDisplay = 'none';
    }

    onClickClose() {
        this.toggleVisibility(false);
    }
}
