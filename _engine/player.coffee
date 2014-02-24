###

Materia
It's a thing

Widget	: Labeling
Authors	: Jonathan Warner
Updated	: 2/14

###

Namespace('Labeling').Engine = do ->
	_qset                   = null
	_questions				= null
	_instance				= {}

	# cache element lookups
	_domCache				= {}
	
	# the image asset
	_img					= null

	# reference to canvas drawing board
	_canvas					= null
	_context				= null

	# the current dragging term
	_curterm				= null

	# the current match the term is in proximity of
	_curMatch				= null

	# the current 'page', i.e. the scrolling on the terms
	_curPage				= 0

	# the text arranged by question id
	_labelTextsByQuestionId = {}

	# legacy support; older qsets are relative to window
	_offsetX				= 0
	_offsetY				= 0

	# zIndex of the terms, incremented so that the dragged term is always on top
	_zIndex					= 1000

	# getElementById and cache it, for the sake of performance
	_g = (id) -> _domCache[id] || (_domCache[id] = document.getElementById(id))

	# Called by Materia.Engine when your widget Engine should start the user experience.
	start = (instance, qset, version = '1') ->
		#document.oncontextmenu = ->	false
		#document.addEventListener 'mousedown', (e) ->
		#	if e.button is 2 then false else true
		#window.onselectstart =
		#document.onselectstart = (e) ->
		#	e.preventDefault() if e and e.preventDefault
		#	false

		_qset = qset

		_questions = _qset.items
		if (_questions[0].items)
			_questions = _questions[0].items

		_instance = instance
		
		# deal with some legacy qset things
		if _qset.options.version is 2
			_offsetX = -195
			_offsetY = -45

		# set background
		switch _qset.options.backgroundTheme
			when 'themeGraphPaper'
				background = 'url(assets/labeling-graph-bg.png)'
			when 'themeCorkBoard'
				background = 'url(assets/labeling-cork-bg.jpg)'
			else
				# convert to hex and zero pad the background, which is stored as an integer
				background = '#' + ('000000' + _qset.options.backgroundColor.toString(16)).substr(-6)

		# set background and header title
		$('#board').css('background',background)
		$('#title').html instance.name
		$('#title').css 'font-size', ((20 - instance.name.length / 30) + 'px')

		# set events
		$('#nextbtn').mousedown ->
			_curPage++
			_arrangeList()
		$('#prevbtn').mousedown ->
			_curPage--
			_arrangeList()
		$('#checkBtn').click ->
			_submitAnswers()
		$('#cancelbtn').click _hideAlert
		$('#donearrow').mouseover ->
			# css fades out the arrow, but make it display none
			# so that labels behind it can be interacted with
			setTimeout ->
				$('#donearrow').css 'display','none'
			,200

		# get canvas context
		_canvas = document.getElementById('image')
		_context = _canvas.getContext('2d')

		# load the image asset
		# when done, render the board
		_img = new Image()
		_img.onload = _drawBoard

		if _qset.options.image
			id = _qset.options.image.id
		else
			id = _qset.assets[0]
		_img.src = Materia.Engine.getImageAssetUrl(id)

		# create term divs
		for question in _questions
			if not question.id
				question.id = 'q'+Math.random()

			term = document.createElement 'div'
			term.id = 'term_' + question.id
			term.className = 'term ease'
			term.innerHTML = question.questions[0].text
			term.addEventListener('mousedown', _mouseDownEvent, false)
			term.addEventListener('touchstart', _mouseDownEvent, false)
			term.addEventListener('MSPointerDown', _mouseDownEvent, false)

			fontSize = (15 - question.questions[0].text.length / 10)
			fontSize = 12 if fontSize < 12
			term.style.fontSize = fontSize + 'px'

			# Some legacy qsets store these as strings, which we certainly don't want
			question.options.endPointX = parseInt(question.options.endPointX)
			question.options.endPointY = parseInt(question.options.endPointY)
			question.options.labelBoxX = parseInt(question.options.labelBoxX)
			question.options.labelBoxY = parseInt(question.options.labelBoxY)

			$('#termlist').append term

		# defer such that it is run once the labels are ready
		setTimeout ->
			_arrangeList()
		,25

		# attach document listeners
		document.addEventListener('touchend', _mouseUpEvent, false)
		document.addEventListener('mouseup', _mouseUpEvent, false)
		document.addEventListener('MSPointerUp', _mouseUpEvent, false)
		document.addEventListener('mouseup', _mouseUpEvent, false)
		document.addEventListener('touchmove', _mouseMoveEvent, false)
		document.addEventListener('MSPointerMove', _mouseMoveEvent, false)
		document.addEventListener('mousemove', _mouseMoveEvent, false)

		# once everything is drawn, set the height of the player
		Materia.Engine.setHeight()

	# arrange the items in the left list
	_arrangeList = ->
		if _curPage < 0
			_curPage = 0

		y = 20 + -570 * _curPage
		maxY = 0

		found = false

		for question in _questions
			node = _g('term_'+question.id)

			# if it's not placed, put it in the left list
			if !node.getAttribute('data-placed')
				if (y < 20)
					node.style.opacity = 0
					offScreen = true
				else
					node.style.transform =
					node.style.msTransform =
					node.style.webkitTransform = 'translate(50px,'+y+'px)'
					node.style.opacity = 1
					found = true

				maxY = y
				y += $(node).height() + 25

		$('#nextbtn').css 'opacity', if maxY > 580 then 1 else 0
		$('#prevbtn').css 'opacity', if offScreen then 1 else 0

		if not found and _curPage > 0
			_curPage--
			_arrangeList()
		else
			if not found and _curPage is 0
				$('#donearrow').css 'display', 'block'

	# when a term is mouse downed
	_mouseDownEvent = (e) ->
		if not e?
			e = window.event
		
		# show ghost term (but keep the opacity at 0)
		_g('ghost').style.display = 'inline-block'

		# set current dragging term
		_curterm = e.target

		# disable easing while it drags
		e.target.className = 'term'

		# if it's been placed, remove that association
		if _curterm.getAttribute('data-placed')
			_labelTextsByQuestionId[_curterm.getAttribute('data-placed')] = ''
			_curterm.setAttribute('data-placed','')

		# don't scroll the page on an iPad
		e.preventDefault()
		if e.stopPropagation
			e.stopPropagation()
		false

	# when the widget area has a cursor or finger move
	_mouseMoveEvent = (e) ->
		# if no term is being dragged, we don't care
		if not _curterm?
			return

		if not e?
			e = window.event

		# if it's not a mouse move, it's probably touch
		if not e.clientX
			e.clientX = e.changedTouches[0].clientX
			e.clientY = e.changedTouches[0].clientY

		# move the current term
		_curterm.style.transform =
		_curterm.style.msTransform =
		_curterm.style.webkitTransform = 'translate(' + (e.clientX - 30) + 'px,' + (e.clientY - 90) + 'px)'

		# check proximity against available drop points
		minDist = Number.MAX_VALUE
		_curMatch = null
		i = 0

		# first look for ones that aren't filled, then try replacing
		# this is a two-pass process
		onlyUnfilled = true
		for pass in [1..2]
			for question in _questions
				# distance formula
				dist = Math.sqrt(Math.pow((e.clientX - question.options.endPointX - _offsetX - 195),2) + Math.pow((e.clientY - question.options.endPointY - _offsetY - 50),2))

				# we want the closest one
				if dist < minDist and dist < 200
					if onlyUnfilled and _labelTextsByQuestionId[question.id]
						continue
					minDist = dist
					_curMatch = question
				i++
			# if we didnt find anything, accept filled ones
			if not _curMatch
				onlyUnfilled = false

		if _curMatch and _labelTextsByQuestionId[_curMatch.id] isnt ''
			fadeOutCurMatch = true

		for question in _questions
			node = _g('term_'+question.id)
			if fadeOutCurMatch and node.getAttribute('data-placed') == _curMatch.id
				_g('term_' + question.id).style.opacity = 0.5
				_curterm.style.zIndex = _zIndex++
			else
				_g('term_' + question.id).style.opacity = 1

		_drawBoard()

		# don't scroll on iPad
		e.preventDefault()
		if e.stopPropagation
			e.stopPropagation()
		false

	# when we let go of a term
	_mouseUpEvent = (e) ->
		# we don't care if nothing is selected
		if not _curterm?
			return

		# apply easing (for snap back animation)
		_curterm.className = 'term ease'
		
		# if it's matched with a dot
		if _curMatch?
			# used after reset
			matched = true
			
			# if the label spot already has something there
			if _labelTextsByQuestionId[_curMatch.id]
				# find the node and put it back in the terms list
				for question in _questions
					node = _g('term_'+question.id)
					if node.getAttribute('data-placed') == _curMatch.id
						node.setAttribute('data-placed','')
						break
				
			# if it has been placed before, reset the place it was placed
			if _curterm.getAttribute('data-placed')
				_labelTextsByQuestionId[_curterm.getAttribute('data-placed')] = ''
			# set the label key value array to this current answer
			_labelTextsByQuestionId[_curMatch.id] = _curterm.innerHTML

			# move the label to where it belongs
			_curterm.style.webkitTransform =
			_curterm.style.msTransform =
			_curterm.style.transform =
				'translate(' + (_curMatch.options.labelBoxX + 210 + _offsetX) + 'px,' + (_curMatch.options.labelBoxY + _offsetY - 45) + 'px)'
			_curterm.className += ' placed'

			# identify this element with the question it is answering
			_curterm.setAttribute('data-placed', _curMatch.id)
		else
			# not matched with a dot, reset the place it was placed
			_labelTextsByQuestionId[_curterm.getAttribute('data-placed')] = ''
			_curterm.setAttribute('data-placed','')

		# rearrange the terms list
		_arrangeList()

		# reset
		_curterm = null
		_curMatch = null

		# render changes
		_drawBoard()
		
		if matched
			# keep ghost on screen
			_g('ghost').style.opacity = 0.5
		else
			_g('ghost').style.opacity = 0
		_g('ghost').className = 'term hide'

		# prevent iPad/etc from scrolling
		e.preventDefault()

	_drawStrokedLine = (x1,y1,x2,y2,color1,color2) ->
		Labeling.Draw.drawLine(_context, x1 + _offsetX, y1 + _offsetY, x2 + _offsetX, y2 + _offsetY, 6, color1)
		Labeling.Draw.drawLine(_context, x1 + _offsetX, y1 + _offsetY, x2 + _offsetX, y2 + _offsetY, 2, color2)

	# render the canvas frame
	_drawBoard = ->
		# clear any lines outside of the canvas
		_context.clearRect(0,0,1000,1000)

		# draw the asset image
		_context.shadowOffsetX = 0
		_context.shadowOffsetY = 0
		_context.shadowBlur = 10
		_context.shadowColor = 'rgba(0,0,0,0.5)'
		_context.drawImage(_img, _qset.options.imageX,_qset.options.imageY,(_img.width * _qset.options.imageScale), (_img.height * _qset.options.imageScale))
		_context.shadowColor = ''
		_context.shadowBlur = 0

		# reference the ghost object, and make it invisible
		ghost = _g('ghost')
		ghost.style.opacity = 0

		for question in _questions
			# if the question has an answer placed, draw a solid line connecting it
			# but only if the label is not replacing one that already exists
			if _labelTextsByQuestionId[question.id] and not (_curMatch and _labelTextsByQuestionId[_curMatch.id] and question.id == _curMatch.id)
				_drawStrokedLine(question.options.endPointX, question.options.endPointY, question.options.labelBoxX, question.options.labelBoxY, '#fff', '#000')
				dotBorder = '#fff'
				dotBackground = '#000'
			else
				dotBorder = '#000'
				dotBackground = '#fff'

			# if the question has a match dragged near it, draw a ghost line
			if _curMatch? and _curMatch.id == question.id
				_drawStrokedLine(question.options.endPointX, question.options.endPointY, question.options.labelBoxX, question.options.labelBoxY, 'rgba(255,255,255,0.2)', 'rgba(0,0,0,0.3)')

				# move the ghost label and make it semi-transparent
				ghost.style.webkitTransform =
				ghost.style.msTransform =
				ghost.style.transform = 'translate(' + (question.options.labelBoxX + 210 + _offsetX) + 'px,' + (question.options.labelBoxY + _offsetY + 35) + 'px)'
				ghost.style.opacity = 0.5
				_g('ghost').className = 'term'

			# draw a dot on the canvas for the question location
			_context.beginPath()
			_context.arc(question.options.endPointX + _offsetX,question.options.endPointY + _offsetY, 7, 2 * Math.PI, false)
			_context.fillStyle = dotBackground
			_context.fill()
			_context.lineWidth = 3
			_context.strokeStyle = dotBorder
			_context.stroke()

	# show the "are you done?" warning dialog
	_showAlert = (action) ->
		ab = $('#alertbox')
		ab.css 'display','block'
		bc = $('#backgroundcover')
		bc.css 'display','block'

		setTimeout ->
			ab.css 'opacity',1
			bc.css 'opacity',0.5
		,10

		$('#confirmbtn').unbind('click').click ->
			_hideAlert()
			action()

	# hide the warning dialog
	_hideAlert = ->
		ab = $('#alertbox')
		bc = $('#backgroundcover')
		ab.css 'opacity',0
		bc.css 'opacity',0

		setTimeout ->
			ab.css 'display','none'
			bc.css 'display','none'
		,190

	# submit every question and the placed answer to Materia for scoring
	_submitAnswers = ->
		_showAlert ->
			for question in _questions
				Materia.Score.submitQuestionForScoring question.id, _labelTextsByQuestionId[question.id]

			Materia.Engine.end()

	#public
	manualResize: true
	start: start
