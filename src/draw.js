// draw a stylized line connecting to a term, with curvature
// shared between player and creator, since it MUST be consistent
// between the two

Namespace('Labeling').Draw = (() => ({
	drawLine: (ctx, x1, y1, x2, y2, width, color) => {
		ctx.beginPath();
		ctx.moveTo(x1, y1);

		// determine curvature based on direction of line
		let labelOffsetX = 0;
		let labelOffsetY = 0;
		let lineCurveOffsetX = 60;
		let lineCurveOffsetY = 0;
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

		ctx.lineTo(x2 + labelOffsetX + lineCurveOffsetX, y2 + lineCurveOffsetY);
		ctx.lineTo(x2 + labelOffsetX + lineResultX, y2 + labelOffsetY);
		ctx.lineWidth = width;
		ctx.strokeStyle = color;
		ctx.lineCap = 'round';

		return ctx.stroke();
	}
}))();

Labeling.Draw

// Namespace('Class').ClassThing = (() => ({
// 	functionInClassThing: () => {}
// }))();
// Class.ClassThing // { functionInClassThing: Function ... }