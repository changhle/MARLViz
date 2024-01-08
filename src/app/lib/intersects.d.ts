
declare module 'intersects' {
    function linePoint(
        x1: number, y1: number,
        x2: number, y2: number,
        xp: number, yp: number,
        tolerance?: number): boolean

    function circlePoint(
        x1: number, y1: number,
        r1: number,
        x2: number, y2: number): boolean

    function polygonPoint(
        points: number[],
        x: number,
        y: number,
        tolerance?: number): boolean
}