###

Materia
It's a thing

Widget	: Labeling, Creator
Authors	: Jonathan Warner
Updated	: 5/15

###

Namespace('Labeling').Creator = do ->
	# variables for local use
	_title = _qset = null

	# canvas, context, and image to render to it
	_canvas = _context = _img = null

	# offset for legacy support
	_offsetX = _offsetY = 0

	#Anchor tag opacity class modifier
	_anchorOpacity = ' '

	# store image dimensions in case the user cancels the resize
	_lastImgDimensions = {}

	# track if the user is "getting started" or well on their way
	_gettingStarted = false

	_defaultLabel = '[label title]'

	initNewWidget = (widget, baseUrl) ->
		$('#image').hide()
		$('#chooseimage').show()
		# prompt the user for a widget title
		$('#titlebox').addClass 'show'
		$('#backgroundcover').addClass 'show'

		# hide the canvas so we can interact with it
		$('#canvas').css 'display','none'

		_gettingStarted = true

		# make a scaffold qset object
		_qset = {}
		_qset.options = {}
		_qset.options.backgroundTheme = 'themeCorkBoard'
		_qset.options.backgroundColor = 2565927

		# set up the creator, shared between new and existing
		_setupCreator()

	_setupCreator = ->
		# set background and header title
		_setBackground()

		# get canvas context
		_canvas = document.getElementById('canvas')
		_context = _canvas.getContext('2d')

		_img = new Image()

		# set up event handlers
		$('.graph').click ->
			_qset.options.backgroundTheme = 'themeGraphPaper'
			_setBackground()

		$('.cork').click  ->
			_qset.options.backgroundTheme = 'themeCorkBoard'
			_setBackground()

		$('.backgroundtile.color').click ->
			if _qset.options.backgroundTheme isnt 'themeSolidColor'
				_qset.options.backgroundTheme = 'themeSolidColor'
				_setBackground()

			$("#colorpicker").spectrum("show")
			$('.sp-coloropt').click (e) ->
				if e? and e.target?
					color = e.target.style.backgroundColor.split(',')
					color = parseInt(parseInt(color[0].substring(4)).toString(16) + parseInt(color[1]).toString(16) + parseInt(color[2]).toString(16), 16)
					_qset.options.backgroundTheme = 'themeSolidColor'
					_qset.options.backgroundColor = color
					_setBackground()
			false

		$('#opaque-toggle').change ->
			_anchorOpacity = ' '
			dots = $(document).find('.dot')
			i = 0
			while i < dots.length
				$(dots[i]).removeClass('frosted transparent')
				i++

		$('#frosted-toggle').change ->
			_anchorOpacity = ' frosted'
			dots = $(document).find('.dot')
			i = 0
			while i < dots.length
				$(dots[i]).removeClass('transparent').addClass('frosted')
				i++

		$('#transparent-toggle').change ->
			_anchorOpacity = ' transparent'
			dots = $(document).find('.dot')
			i = 0
			while i < dots.length
				$(dots[i]).removeClass('frosted').addClass('transparent')
				i++

		$('#btnMoveResize').click ->
			_resizeMode true

			if _qset.options.backgroundTheme == "themeGraphPaper"
				$('.resizable').addClass('dark')
			else
				$('.resizable').removeClass('dark')

			_lastImgDimensions =
				width: $('#imagewrapper').width()
				height: $('#imagewrapper').height()
				left: $('#imagewrapper').position().left
				top: $('#imagewrapper').position().top

		$('#btnMoveResizeCancel').click ->
			_resizeMode false
			$('#imagewrapper').width _lastImgDimensions.width
			$('#imagewrapper').height _lastImgDimensions.height
			$('#imagewrapper').css 'left', _lastImgDimensions.left + 'px'
			$('#imagewrapper').css 'top', _lastImgDimensions.top + 'px'

		$('#btnMoveResizeDone').click ->
			_resizeMode false

		$('#btnChooseImage').click ->
			Materia.CreatorCore.showMediaImporter()

		$('#btn-enter-title').click ->
			Materia.CreatorCore.showMediaImporter()
			true

		$('#title').click _showMiniTitleEditor
		$('#header .link').click _showMiniTitleEditor

		window.setTitle = (title = document.getElementById("title").textContent) ->
			title = title.replace(/</g, '').replace(/>/g, '');
			$('#titlebox').removeClass 'show'
			$('#titlechanger').removeClass 'show'
			$('#backgroundcover').removeClass 'show'
			$('#title').html (title or 'My labeling widget')

		document.getElementById('canvas').addEventListener('click', _addTerm, false)

		# update background
		$('#colorpicker').spectrum
			move: _updateColorFromSelector
			cancelText: ''
			chooseText: 'Done'

	_showMiniTitleEditor = ->
		$('#titlechanger').addClass 'show'
		$('#backgroundcover').addClass 'show'
		$('#titletxt').val($('#title').html()).focus()

	_makeDraggable = ->
		# drag all sides of the image for resizing
		$('#imagewrapper').draggable(
			drag: (event,ui) ->
				return ui
		).resizable
			aspectRatio: true
			handles: 'n, e, s, w, ne, nw, se, sw'

	# sets resize mode on and off, and sets UI accordingly
	_resizeMode = (isOn) ->
		$('#terms').css 'display', if isOn then 'none' else 'block'
		$('#canvas').css 'display', if isOn then 'none' else 'block'
		$('#maincontrols').css 'display', if isOn then 'none' else 'block'
		$('#resizecontrols').css 'display', if isOn then 'block' else 'none'
		if isOn
			$('#imagewrapper').addClass 'resizable'
			$('#controlcover').addClass 'show'
			$('#btnMoveResizeCancel').css 'display', 'block'
			$('#btnMoveResizeDone').css 'display','block'
		else
			$('#imagewrapper').removeClass 'resizable'
			$('#controlcover').removeClass 'show'
			$('#btnMoveResizeCancel').css 'display', 'none'
			$('#btnMoveResizeDone').css 'display','none'

	# set background color, called from the spectrum events
	_updateColorFromSelector = (color) ->
		_qset.options.backgroundTheme = 'themeSolidColor'
		_qset.options.backgroundColor = parseInt(color.toHex(),16)
		_setBackground()

	# sets background from the qset
	_setBackground = ->
		$('.backgroundtile').removeClass 'show'

		# set background
		switch _qset.options.backgroundTheme
			when 'themeGraphPaper'
				background = 'url(assets/labeling-graph-bg.png)'
				$('.graph').addClass 'show'
			when 'themeCorkBoard'
				background = 'url(assets/labeling-cork-bg.jpg)'
				$('.cork').addClass 'show'
			else
				# convert to hex and zero pad the background, which is stored as an integer
				background = '#' + ('000000' + _qset.options.backgroundColor.toString(16)).substr(-6)
				$('.color').addClass 'show'
				$('#curcolor').css('background',background)

		$('#board').css('background',background)

	initExistingWidget = (title,widget,qset,version,baseUrl) ->
		_qset = qset

		_setupCreator()
		_makeDraggable()

		# get asset url from Materia API (baseUrl and all)
		url = Materia.CreatorCore.getMediaUrl(_qset.options.image.id)

		# render the image inside of the imagewrapper
		$('#image').attr 'src', url
		$('#image').attr 'data-imgid', _qset.options.image.id

		# load the image resource via JavaScript for rendering later
		_img.src = url
		_img.onload = ->
			$('#imagewrapper').css('height', (_img.height * _qset.options.imageScale))
			$('#imagewrapper').css('width', (_img.width * _qset.options.imageScale))

		# set the resizable image wrapper to the size and pos from qset
		$('#imagewrapper').css('left', (_qset.options.imageX))
		$('#imagewrapper').css('top', (_qset.options.imageY))

		# set the title from the qset
		$('#title').html title
		_title = title

		# add qset terms to the list
		# legacy support:
		questions = qset.items
		if questions[0]? and questions[0].items
			questions = questions[0].items
		for item in questions
			_makeTerm(item.options.endPointX, item.options.endPointY, item.questions[0].text, item.options.labelBoxX, item.options.labelBoxY, item.id)

	# draw lines on the board
	_drawBoard = ->
		# clear the board area
		_context.clearRect(0,0,1000,1000)

		# iterate every term and read dot attributes
		for term in $('.term')
			dotx = parseInt(term.getAttribute('data-x'))
			doty = parseInt(term.getAttribute('data-y'))

			# read label position from css
			labelx = parseInt(term.style.left)
			labely = parseInt(term.style.top)

			# drawLine handles the curves and such; run it for inner
			# and outer stroke
			Labeling.Draw.drawLine(_context, dotx + _offsetX, doty + _offsetY, labelx + _offsetX, labely + _offsetY, 6, '#fff')
			Labeling.Draw.drawLine(_context, dotx + _offsetX, doty + _offsetY, labelx + _offsetX, labely + _offsetY, 2, '#000')

	# Add term to the list, called by the click event
	_addTerm = (e) ->
		# draw a dot on the canvas for the question location
		_makeTerm e.pageX-document.getElementById('frame').offsetLeft-document.getElementById('board').offsetLeft, e.pageY-50

		$('#help_adding').css 'display','none'
		$('#boardcover').css 'display','none'
		$('#imagewrapper').removeClass 'faded'

		setTimeout ->
			$('#help_moving').css 'display','block'
			$('#btnMoveResize').css 'display','block'
			$('#btnChooseImage').css 'display','block'
		,400

	# generate a term div
	_makeTerm = (x, y, text = _defaultLabel, labelX=null, labelY=null, id='') ->
		dotx = x
		doty = y

		term = document.createElement 'div'
		term.id = 'term_' + Math.random(); # fake id for linking with dot
		term.innerHTML = "<div class='label-input' contenteditable='true'>"+text+"</div><div class='delete'></div>"
		term.className = 'term'

		# if we're generating a generic one, decide on a position
		if labelX is null or labelY is null
			y = (y - 200)

			labelAreaHalfWidth = 500 / 2
			labelAreaHalfHeight = 500 / 2

			labelStartOffsetX = 70
			labelStartOffsetY = 50

			if (x < labelAreaHalfWidth)
				x -= labelStartOffsetX

				if (y < labelAreaHalfHeight)
					y += labelStartOffsetY
				else
					y -= labelStartOffsetY
			else
				x += labelStartOffsetX

				if (y < labelAreaHalfHeight)
					y += labelStartOffsetY
				else
					y -= labelStartOffsetY

			if y < 150
				y = 150

			if x > 450
				x = 450
			if x < 100
				x = 100
		else
			x = labelX
			y = labelY

		# set term location and dot attribute
		term.style.left = x + 'px'
		term.style.top = y + 'px'
		term.setAttribute 'data-x', dotx
		term.setAttribute 'data-y', doty
		term.setAttribute 'data-id', id

		$('#terms').append term

		dot = document.createElement 'div'
		dot.className = 'dot' + _anchorOpacity
		dot.style.left = dotx + 'px'
		dot.style.top = doty + 'px'
		dot.setAttribute 'data-termid', term.id
		dot.id = "dot_" + term.id

		$('#terms').append dot

		# edit on click
		term.onclick = ->
			term.childNodes[0].focus()
			document.execCommand 'selectAll',false,null
			if term.childNodes[0].innerHTML == _defaultLabel then term.childNodes[0].innerHTML = ''

		# resize text on change
		term.childNodes[0].onkeyup = _termKeyUp
		# set initial font size
		term.childNodes[0].onkeyup target: term.childNodes[0]

		# enter key press should stop editing
		term.childNodes[0].onkeydown = _termKeyDown

		# check if blank when the text is cleared
		term.childNodes[0].onblur = _termBlurred

		# clean up pasted content to make sure we don't accidentally get invisible html garbage
		term.childNodes[0].onpaste = _termPaste

		# make delete button remove it from the list
		term.childNodes[1].onclick = ->
			term.parentElement.removeChild(term)
			dot.parentElement.removeChild(dot)
			_drawBoard()

		# make the term movable
		$(term).draggable({
			drag: (event,ui) ->
				if ui.position.left < 20
					ui.position.left = 20
				if ui.position.left > 460
					ui.position.left = 460
				if ui.position.top > 505
					ui.position.top = 505
				if ui.position.top < 20
					ui.position.top = 20
				_drawBoard()
				return ui
		})
		# make the dot movable
		$(dot).draggable({
			drag: _dotDragged
		})
		setTimeout ->
			term.childNodes[0].focus()
			document.execCommand 'selectAll',false,null
		,10

		_drawBoard()

	# When typing on a term, resize the font accordingly
	_termKeyUp = (e) ->
		e = window.event if not e?
		fontSize = (16 - e.target.innerHTML.length / 10)
		fontSize = 12 if fontSize < 12
		e.target.style.fontSize = fontSize + 'px'

	# When typing on a term, resize the font accordingly
	_termKeyDown = (e) ->
		e = window.event if not e?

		# Enter key
		# block adding line returns
		# consider Enter Key to mean 'done editing'
		if e.keyCode is 13
			# Defocus
			e.target.blur()
			window.getSelection().removeAllRanges() # needed for contenteditable blur
			# put event in a sleeper hold
			e.stopPropagation() if e.stopPropagation?
			e.preventDefault()
			return false

		# Escape
		if e.keyCode is 27
			if e.target.innerHTML.length < 1
				$(document.getElementById('dot_'+e.target.parentElement.id)).remove()
				$(e.target.parentElement).remove()
				_drawBoard()
			else
				# Defocus
				e.target.blur()
				window.getSelection().removeAllRanges() # needed for contenteditable blur

	# If the term is blank, put dummy text in it
	_termBlurred = (e) ->
		e = window.event if not e?
		e.target.innerHTML = _defaultLabel if e.target.innerHTML is ''

	# Convert anything on the clipboard into pure text before pasting it into the label
	_termPaste = (e) ->
		e = window.event unless e?
		e.preventDefault()

		# contenteditable divs will insert an empty <br/> when they're empty, this checks for and removes them on paste
		if e.target.tagName is 'BR'
			input = e.target.parentElement
			e.target.parentElement.removeChild e.target
		else
			input = e.target
		# ie11 has different arguments for clipboardData and makes it a method of window instead of the paste event
		if e.clipboardData?
			clipboardData = e.clipboardData
			clipboardArgument = 'text/plain'
		else
			clipboardData = window.clipboardData
			clipboardArgument = 'Text'

		sel = window.getSelection()
		if sel.rangeCount
			range = sel.getRangeAt 0
			range.deleteContents()

			newText = clipboardData.getData clipboardArgument
			newNode = document.createTextNode newText
			range.insertNode newNode

			newRange = document.createRange()
			newRange.selectNodeContents newNode
			newRange.collapse false

			sel.removeAllRanges()
			sel.addRange newRange


	# a dot has been dragged, lock it in place if its within 10px
	_dotDragged = (event,ui) ->
		minDist = 9999
		minDistEle = null

		for dot in $('.dot')
			if dot is event.target
				continue
			dist = Math.sqrt(Math.pow((ui.position.left - $(dot).position().left),2) + Math.pow((ui.position.top - $(dot).position().top),2))
			if dist < minDist
				minDist = dist
				minDistEle = dot

		# less than 10px away, put the dot where the other one is
		# this is how duplicates are supported
		if minDist < 10
			ui.position.left = $(minDistEle).position().left
			ui.position.top = $(minDistEle).position().top

		term = document.getElementById event.target.getAttribute('data-termid')
		term.setAttribute('data-x', ui.position.left)
		term.setAttribute('data-y', ui.position.top)

		_drawBoard()

	# called from Materia creator page
	onSaveClicked = (mode = 'save') ->
		if not _buildSaveData()
			return Materia.CreatorCore.cancelSave 'Widget needs a title and at least one term.'
		Materia.CreatorCore.save _title, _qset

	onSaveComplete = (title, widget, qset, version) -> true

	# called from Materia creator page
	# place the questions in an arbitrary location to be moved
	onQuestionImportComplete = (items) ->
		for item in items
			_makeTerm(150,300,item.questions[0].text,null,null,item.id)

	# generate the qset	
	_buildSaveData = ->
		if not _qset? then _qset = {}
		if not _qset.options? then _qset.options = {}

		words = []

		_qset.assets = []
		_qset.rand = false
		_qset.name = ''
		_title = $('#title').html()
		_okToSave = if _title? && _title != '' then true else false

		items = []

		dots = $('.term')
		for dot in dots
			item = {}
			label = dot.childNodes[0].innerHTML

			answer =
				text: label
				value: 100
				id: ''
			item.answers = [answer]
			item.assets = []
			question =
				text: label
			item.questions = [question]
			item.type = 'QA'
			item.id = dot.getAttribute('data-id') or ''
			item.options =
				labelBoxX: parseInt(dot.style.left.replace('px',''))
				labelBoxY: parseInt(dot.style.top.replace('px',''))
				endPointX: parseInt(dot.getAttribute('data-x'))
				endPointY: parseInt(dot.getAttribute('data-y'))

			items.push item

		_qset.items = items

		if items.length < 1
			_okToSave = false

		_anchorOpacityValue = 1.0
		if _anchorOpacity.indexOf('frosted') > -1
			_anchorOpacityValue = 0.5
		else if _anchorOpacity.indexOf('transparent') > -1
			_anchorOpacityValue = 0.0

		_qset.options =
			backgroundTheme: _qset.options.backgroundTheme
			backgroundColor: _qset.options.backgroundColor
			imageScale: $('#imagewrapper').width() / _img.width
			image:
				id: $('#image').attr('data-imgid')
				materiaType: "asset"
			imageX: $('#imagewrapper').position().left
			imageY: $('#imagewrapper').position().top
			opacity: _anchorOpacityValue

		_qset.version = "2"

		_okToSave

	# called from Materia creator page
	# loads and sets appropriate data for loading image
	onMediaImportComplete = (media) ->
		$('#canvas').css 'display','block'

		url = Materia.CreatorCore.getMediaUrl(media[0].id)
		$('#chooseimage').hide()
		$('#image').show()
		$('#image').attr 'src', url
		$('#image').attr 'data-imgid', media[0].id
		_img.src = url
		_img.onload = ->
			iw = $('#imagewrapper')
			if _img.width > _img.height
				width = 570
				iw.css('width', width)
				iw.css('height', (_img.height * iw.width() / _img.width))
			else
				height = 470
				iw.css('height', height)
				iw.css('width', (_img.width * iw.height() / _img.height))

			$('#imagewrapper').css('left', (600 / 2) - (iw.width() / 2))
			$('#imagewrapper').css('top', (550 / 2) - (iw.height() / 2))


		$('#boardcover').css 'display','block'
		$('#imagewrapper').addClass 'faded'

		_makeDraggable()

		_resizeMode true

		true

	# Public members
	initNewWidget            : initNewWidget
	initExistingWidget       : initExistingWidget
	onSaveClicked            : onSaveClicked
	onMediaImportComplete    : onMediaImportComplete
	onQuestionImportComplete : onQuestionImportComplete
	onSaveComplete           : onSaveComplete
