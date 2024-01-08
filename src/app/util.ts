
export function translate(x: number, y: number): string {
    return 'translate(' + x + ', ' + y + ')';
}

export function remove(arr, elem) {
    let index = arr.indexOf(elem);
    if (index > -1) {
        arr.splice(index, 1);
    }
}

export function dateToStringHMS(d: Date) {
    let year = d.getFullYear();
    let month = d.getMonth() + 1;
    let date = d.getDate();

    let h: any = d.getHours();
    let m: any = d.getMinutes();
    let s: any = d.getSeconds();

    if (h < 10) {
        h = '0' + h;
    }
    if (m < 10) {
        m = '0' + m;
    }
    if (s < 10) {
        s = '0' + s;
    }

    return year + '/' + month + '/' + date + ' (' + h + ':' + m + ':' + s + ')';
}

export function dateToStringYMD(d: Date) {
    let year = d.getFullYear();
    let month = d.getMonth() + 1;
    let date = d.getDate();

    return year + '/' + month + '/' + date;
}

export function fittingString(ctx: CanvasRenderingContext2D, str: string, maxWidth: number) {
    let width = ctx.measureText(str).width;
    let ellipsis = '…';
    let ellipsisWidth = ctx.measureText(ellipsis).width;
    if (width <= maxWidth || width <= ellipsisWidth) {
        return str;
    } else {
        let len = str.length;
        while (width >= maxWidth - ellipsisWidth && len-- > 0) {
            str = str.substring(0, len);
            width = ctx.measureText(str).width;
        }
        return str + ellipsis;
    }
}

export function roundRect(ctx, x, y, width, height, r: number, fill = true, stroke = true) {
    let x0 = x;
    let x1 = x + r;
    let x2 = x + width - r;
    let x3 = x + width;

    let y0 = y;
    let y1 = y + r;
    let y2 = y + height - r;
    let y3 = y + height;

    if (ctx.lineWidth % 2 !== 0) {
        x0 -= 0.5;
        x1 -= 1;
        x2 -= 0.5;
        x3 -= 0.5;

        y0 -= 0.5;
        y1 -= 0.5;
        // y2 -= 0.5;
        y3 -= 0.5;
    }

    ctx.beginPath();
    ctx.moveTo(x1, y0);
    ctx.lineTo(x2, y0);
    ctx.quadraticCurveTo(x3, y0, x3, y1);
    ctx.lineTo(x3, y2);
    ctx.quadraticCurveTo(x3, y3, x2, y3);
    ctx.lineTo(x1, y3);
    ctx.quadraticCurveTo(x0, y3, x0, y2);
    ctx.lineTo(x0, y1);
    ctx.quadraticCurveTo(x0, y0, x1, y0);
    ctx.closePath();

    if (fill) {
        ctx.fill();
    }
    if (stroke) {
        ctx.stroke();
    }
}

export function arcParameter(rx, ry, xAxisRotation, largeArcFlag, sweepFlag, x, y) {
    return [rx, ',', ry, ' ',
            xAxisRotation, ' ',
            largeArcFlag, ',',
            sweepFlag, ' ',
            x, ',', y].join('');
}

export function generatePathData(x, y, width, height, tr, br, bl, tl) {
    let data = [];
    // start point in top-middle of the rectangle
    data.push('M' + (x + width / 2) + ',' + y);
    // next we go to the right
    data.push('H' + (x + width - tr));
    if (tr > 0) {
        // now we draw the arc in the top-right corner
        data.push('A' + arcParameter(tr, tr, 0, 0, 1, (x + width), (y + tr)));
    }
    // next we go down
    data.push('V' + (y + height - br));
    if (br > 0) {
        // now we draw the arc in the lower-right corner
        data.push('A' + arcParameter(br, br, 0, 0, 1, (x + width - br), (y + height)));
    }
    // now we go to the left
    data.push('H' + (x + bl));
    if (bl > 0) {
        // now we draw the arc in the lower-left corner
        data.push('A' + arcParameter(bl, bl, 0, 0, 1, (x + 0), (y + height - bl)));
    }
    // next we go up
    data.push('V' + (y + tl));
    if (tl > 0) {
        // now we draw the arc in the top-left corner
        data.push('A' + arcParameter(tl, tl, 0, 0, 1, (x + tl), (y + 0)));
    }
    // and we close the path
    data.push('Z');
    return data.join(' ');
}

export function getContrastYIQ(hexcolor) {
    hexcolor = hexcolor.replace("#", "");
    let r = parseInt(hexcolor.substr(0, 2), 16);
    let g = parseInt(hexcolor.substr(2, 2), 16);
    let b = parseInt(hexcolor.substr(4, 2), 16);
    let yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    // return (yiq >= 128) ? 'black' : 'white';
    return (yiq >= 128) ? '#262524' : 'white';
}

export function numToKFormat(num: number) {
    let m = ((Math.abs(num) / 1000 ).toFixed(1));
    return Math.abs(num) > 999 ? (Math.sign(num) * (Math.abs(num) / 1000 )).toFixed(1) + 'k' : Math.sign(num) * Math.abs(num);
}

export function numberToCommaFormat(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// 둘다 sorting 되어 있다는 가정
export function arraysEqual(a, b) {
    if (a === b) return true;
    if (a == null || b == null) return false;
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; ++i) {
        if (a[i] !== b[i]) return false;
    }
    return true;
}

export function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

export function rgbToHex(nums: number[]) {
    return "#" + componentToHex(nums[0]) + componentToHex(nums[1]) + componentToHex(nums[2]);
}
