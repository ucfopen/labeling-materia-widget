###

Materia
It's a thing

Widget	: Labeling, Creator
Authors	: Jonathan Warner
Updated	: 3/14

###

Namespace('Labeling').Creator = do ->
	# variables for local use
	_title = _qset = null

	# canvas, context, and image to render to it
	_canvas = _context = _img = null

	# offset for legacy support
	_offsetX = _offsetY = 0

	# store image dimensions in case the user cancels the resize
	_lastImgDimensions = {}

	# track if the user is "getting started" or well on their way
	_gettingStarted = false

	initNewWidget = (widget, baseUrl) ->
		# prompt the user for a widget title
		$('#titlebox').addClass 'show'
		$('#backgroundcover').addClass 'show'

		# the image will have a sheen to it to indicate it should be clicked
		$('#imagewrapper').addClass 'firsttime'

		# hide the canvas so we can interact with it
		$('#canvas').css 'display','none'

		# hide the default help text
		$('#help_moving').css 'display','none'
		$('#btnMoveResize').css 'display','none'
		$('#btnChooseImage').css 'display','none'

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
			$('#btnMoveResizeCancel').css 'display','block'
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
		$('#btnChooseImageStep1').click ->
			Materia.CreatorCore.showMediaImporter()
			true

		$('#title').click ->
			$('#titlechanger').addClass 'show'
			$('#backgroundcover').addClass 'show'
			$('#titletxt').val($('#title').html()).focus()
		window.setTitle = (title = document.getElementById("title").textContent) ->
			$('#titlebox').removeClass 'show'
			$('#titlechanger').removeClass 'show'
			$('#backgroundcover').removeClass 'show'
			$('#title').html (title or 'My labeling widget')
			if _gettingStarted
				$('.arrow').css 'display','block'

		document.getElementById('canvas').addEventListener('click', _addTerm, false)

		# update background
		$('#colorpicker').spectrum({
			move: _updateColorFromSelector
			cancelText: ''
			chooseText: 'Done'
		})
	
	_makeDraggable = ->
		# drag all sides of the image for resizing
		$('#imagewrapper').draggable(
			drag: (event,ui) ->
				###
				if ui.position.left < 20
					ui.position.left = 20
				if ui.position.left + ui.helper.context.offsetWidth > 590
					ui.position.left = 590 - ui.helper.context.offsetWidth
				if ui.position.top + ui.helper.context.offsetHeight > 540
					ui.position.top = 540 - ui.helper.context.offsetHeight
				if ui.position.top < 20
					ui.position.top = 20
				###
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
		else
			$('#imagewrapper').removeClass 'resizable'
			$('#controlcover').removeClass 'show'
			$('#btnMoveResizeCancel').css 'display', 'none'

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
		$('#title').val title

		# add qset terms to the list
		# legacy support:
		questions = qset.items
		if questions[0]? and questions[0].items
			questions = questions[0].items
		for item in questions
			_makeTerm(item.options.endPointX,item.options.endPointY,item.questions[0].text,item.options.labelBoxX,item.options.labelBoxY)

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
		_makeTerm e.clientX-document.getElementById('frame').offsetLeft-document.getElementById('board').offsetLeft,e.clientY-50

		$('#help_adding').css 'display','none'
		$('#boardcover').css 'display','none'
		$('#imagewrapper').removeClass 'faded'

		setTimeout ->
			$('#help_moving').css 'display','block'
			$('#btnMoveResize').css 'display','block'
			$('#btnChooseImage').css 'display','block'
		,400
	
	# generate a term div
	_makeTerm = (x,y,text = '[label title]',labelX=null,labelY=null) ->
		dotx = x
		doty = y

		term = document.createElement 'div'
		term.id = 'term_' + Math.random(); # fake id for linking with dot
		term.innerHTML = "<div contenteditable='true'>"+text+"</div><div class='delete'></div>"
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

		$('#terms').append term

		dot = document.createElement 'div'
		dot.className = 'dot'
		dot.style.left = dotx + 'px'
		dot.style.top = doty + 'px'
		dot.setAttribute 'data-termid', term.id
		dot.id = "dot_" + term.id

		$('#terms').append dot

		# edit on click
		term.onclick = ->
			term.childNodes[0].focus()
			document.execCommand 'selectAll',false,null

		# resize text on change
		term.childNodes[0].onkeyup = _termKeyUp
		# set initial font size
		term.childNodes[0].onkeyup target: term.childNodes[0]
		
		# enter key press should stop editing
		term.childNodes[0].onkeydown = _termKeyDown

		# check if blank when the text is cleared
		term.childNodes[0].onblur = _termBlurred
		
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
		if e.keyCode is 13
			e.target.blur()
			e.stopPropagation() if e.stopPropagation?
			false
		if e.keyCode is 27 and e.target.innerHTML.length < 1
			$(document.getElementById('dot_'+e.target.parentElement.id)).remove()
			$(e.target.parentElement).remove()
			_drawBoard()


	# If the term is blank, put dummy text in it
	_termBlurred = (e) ->
		e = window.event if not e?
		e.target.innerHTML = '(blank)' if e.target.innerHTML is ''

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
			_makeTerm(150,300,item.questions[0].text)

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

			answer =
				text: dot.childNodes[0].innerHTML
				value: 100
				id: ''
			item.answers = [answer]
			item.assets = []
			question =
				text: dot.childNodes[0].innerHTML
			item.questions = [question]
			item.type = 'QA'
			item.id = ''
			item.options =
				labelBoxX: parseInt(dot.style.left.replace('px',''))
				labelBoxY: parseInt(dot.style.top.replace('px',''))
				endPointX: parseInt(dot.getAttribute('data-x'))
				endPointY: parseInt(dot.getAttribute('data-y'))

			items.push item

		_qset.items = items

		if items.length < 1
			_okToSave = false

		_qset.options =
			backgroundTheme: _qset.options.backgroundTheme
			backgroundColor: _qset.options.backgroundColor
			imageScale: $('#imagewrapper').width() / _img.width
			image:
				id: $('#image').attr('data-imgid')
				materiaType: "asset"
			imageX: $('#imagewrapper').position().left
			imageY: $('#imagewrapper').position().top

		_qset.version = "2"

		_okToSave

	# called from Materia creator page
	# loads and sets appropriate data for loading image
	onMediaImportComplete = (media) ->
		$('#btnChooseImageStep1').css 'display','none'
		$('#canvas').css 'display','block'
		$('#imagewrapper').removeClass 'firsttime'

		url = Materia.CreatorCore.getMediaUrl(media[0].id)
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

		if _gettingStarted
			$('#help_adding').css 'display','block'
			$('#boardcover').css 'display','block'
			$('#imagewrapper').addClass 'faded'
			
			# hide help tips
			$('.arrow').css 'display','none'

			_gettingStarted = false

			_makeDraggable()
		else
			_resizeMode true
		
		true
	
	# Public members
	initNewWidget            : initNewWidget
	initExistingWidget       : initExistingWidget
	onSaveClicked            : onSaveClicked
	onMediaImportComplete    : onMediaImportComplete
	onQuestionImportComplete : onQuestionImportComplete
	onSaveComplete           : onSaveComplete
