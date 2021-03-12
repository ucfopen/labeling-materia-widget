/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
Namespace('Labeling').Draw = ((() => // draw a stylized line connecting to a term, with curvature
// shared between player and creator, since it MUST be consistent
// between the two
({
    drawLine(ctx, x1, y1, x2, y2, width, color) {
        ctx.beginPath();

        // move lines
        ctx.moveTo(x1, y1);

        // determine curvature based on direction of line
        let labelOffsetX = 0;
        let labelOffsetY = 0;
        let lineCurveOffsetY = 0;
        let lineCurveOffsetX = 60;
        let lineResultX = 60;

        if (Math.abs(y1 - y2) > 40) {
            lineCurveOffsetX = 0;
            if (y1 > y2) {
                lineCurveOffsetY = 65;
                labelOffsetY = 20;
            } else {
                lineCurveOffsetY = -35;
                labelOffsetY = -10;
            }
            labelOffsetX = 60;
            lineResultX = 0;
        } else if (Math.abs(x1 - x2) > 60) {
            if (x1 > x2) {
                lineCurveOffsetX = 180;
                lineResultX = 140;
            } else {
                lineResultX = -10;
                lineCurveOffsetX = -60;
            }
        }

        // ctx.lineTo(x2 + labelOffsetX + lineCurveOffsetX, y2 + lineCurveOffsetY);
        // ctx.lineTo(x2 + labelOffsetX + lineResultX, y2 + labelOffsetY);
        ctx.quadraticCurveTo(
            x2 + labelOffsetX + lineCurveOffsetX + 40,
            y2 + lineCurveOffsetY + 32,
            x2 + labelOffsetX + lineResultX + 40,
            y2 + labelOffsetY + 32
        );

        ctx.lineTo(x2 + labelOffsetX + lineResultX + 60, y2 + labelOffsetY + 32);
        ctx.lineTo(x2 + labelOffsetX + lineResultX + 20, y2 + labelOffsetY);
        ctx.lineTo(x2 + labelOffsetX + lineResultX - 24, y2 + labelOffsetY + 32);
        ctx.lineTo(x2 + labelOffsetX + lineResultX, y2 + labelOffsetY + 32);
        ctx.quadraticCurveTo(
            x2 + labelOffsetX + lineCurveOffsetX + 40,
            y2 + lineCurveOffsetY,
            x1,
            y1
        );
        // ctx.quadraticCurveTo(
        //     x2 + labelOffsetX + lineCurveOffsetX,
        //     y2 + lineCurveOffsetY,
        //     x1 - 5,
        //     y1
        // );


        // ctx.moveTo(x1, y1);
        // ctx.quadraticCurveTo(
        //     x2 + labelOffsetX + lineCurveOffsetX + 10,
        //     y2 + lineCurveOffsetY,
        //     x2 + labelOffsetX + lineResultX + 10,
        //     y2 + labelOffsetY
        // );

        ctx.fillStyle = 'white';
        ctx.fill();
        ctx.lineWidth = width;
        ctx.strokeStyle = color;
        ctx.lineCap = 'round';
        return ctx.stroke();
    }
})))();

