export class RectPosition {
    x: number;
    y: number;
    width: number;
    height: number;

    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    contains(px, py) {
        if (px >= this.x && px <= this.x + this.width) {
            if (py >= this.y && py <= this.y + this.height) {
                return true;
            }
        }
        return false;
    }
}
