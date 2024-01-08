import { RectPosition } from "./rect-position";

export class TableRow {

    public _id: number;
    public position: RectPosition = new RectPosition(-1, -1, -1, -1);
    public selected = false;

    public ctx: CanvasRenderingContext2D;
    public svg;

    constructor() {
    }

    setCanvas(ctx) {
        this.ctx = ctx;
    }

    setSVG(svg) {
        this.svg = svg.append('g');
    }


    setPosition(x: number, y: number, width: number, height: number) {
    }

    draw() {
    }
}
