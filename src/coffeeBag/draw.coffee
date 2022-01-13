
Namespace('Labeling').Draw = do ->
	# draw a stylized line connecting to a term, with curvature
	# shared between player and creator, since it MUST be consistent
	# between the two
	drawLine: (ctx,x1,y1,x2,y2,width,color, curvature) ->
		ctx.beginPath()

		# move lines
		ctx.moveTo(x1,y1)

		# determine curvature based on direction of line
		labelOffsetX = 0
		labelOffsetY = 0
		lineCurveOffsetY = 0
		lineCurveOffsetX = 60
		lineResultX = 60

		if Math.abs(y1-y2) > 40
			lineCurveOffsetX = 0
			if y1 > y2
				lineCurveOffsetY = 65
				labelOffsetY = 20
			else
				lineCurveOffsetY = -35
				labelOffsetY = -10
			labelOffsetX = 60
			lineResultX = 0
		else if Math.abs(x1-x2) > 60
			if x1 > x2
				lineCurveOffsetX = 180
				lineResultX = 140
			else
				lineResultX = -10
				lineCurveOffsetX = -60

		# Creates a curve Line
		ctx.quadraticCurveTo(
			x2 + labelOffsetX + lineCurveOffsetX + curvature,
			y2 + lineCurveOffsetY + curvature,
			x2 + labelOffsetX + lineResultX,
			y2 + labelOffsetY
		)


		ctx.lineWidth = width
		ctx.strokeStyle = color
		ctx.lineCap = 'round'
		ctx.stroke()
