import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'spinnerclass' })
export class Spinner2ClassPipe implements PipeTransform {
    transform(isWaiting: boolean): string {
        if (isWaiting) {
            return 'spinner-border bottom-loading-spinner';
        } else {
            return 'spinner-border bottom-loading-spinner loading-finish';
        }
    }
}
