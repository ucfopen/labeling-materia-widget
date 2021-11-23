// Temporarily disable while using MWDK

// Using this style of import will cause the 3D to run every time even when on 2D.
// import { renderedSpheresGroup } from './core3D.js'

Namespace('Labeling').Creator = (function () {

	// variables for local use
	let _context, _img, _offsetY, _qset
	let _title = (_qset = null)

	// canvas, context, and image to render to it
	let _canvas = (_context = (_img = null))

	// offset for legacy support
	const _offsetX = (_offsetY = 0)

	//Anchor tag opacity class modifier
	let _anchorOpacity = ' '

	// store image dimensions in case the user cancels the resize
	let _lastImgDimensions = {}

	const _defaultLabel = '[label title]'

	// class Vertex located in core3D, one of its parameters is function spheres.
	// variables used through the code to manage the 3D aspect of the code
	let flag3D = false
	let areWeLabeling = true
	let areLinesHided = true
	const oneSecond = 1000
	const cameraRotationSpeed = 2.5
	let listOfVertex = []  // contains each vertex.
	let highlightSpheresGroup = null
	let renderedSpheresGroup = null// render group containing spheres of each vertex.
	var uvMapToMousePoint = null
	let horizontalCameraRotation = null
	let verticalCameraRotation = null
	let mouseDownFireIntervals = null
	let sphereRadius = 1
	let sphereScale = 1
	let fireCTRL = true

	let mediaFileType = []

	// have to change function to async/await to be able read flag3D
	const initNewWidget = function () {
		document.querySelector('#image').display = 'none'
		document.querySelector('#chooseimage').display = 'block'

		// prompt the user for a widget title
		document.querySelector('#titlebox').classList.add("show")
		document.querySelector('#backgroundcover').classList.add("show")

		// make a scaffold qset object
		_qset = {}
		_qset.options = {}
		_qset.options.backgroundTheme = 'themeCorkBoard'
		_qset.options.backgroundColor = 2565927

		chooseVer()
		return _setupCreator()
	}

	var _setupCreator = function () {
		// set background and header title
		_setBackground()

		// get canvas context
		_canvas = document.getElementById('canvas')
		_context = _canvas.getContext('2d')
		_img = new Image()

		// set up event handlers
		document.querySelector('.graph').addEventListener('click', () => {
			_qset.options.backgroundTheme = 'themeGraphPaper'
			return _setBackground()
		})

		document.querySelector('.cork').addEventListener('click', () => {
			_qset.options.backgroundTheme = 'themeCorkBoard'
			return _setBackground()
		})

		// Color Wheel ==>
		$('.backgroundtile.color').click(function () {
			if (_qset.options.backgroundTheme !== 'themeSolidColor') {
				_qset.options.backgroundTheme = 'themeSolidColor'
				_setBackground()
			}
			// custom jQuery
			$("#colorpicker").spectrum("show")
			$('.sp-coloropt').click(function (e) {
				if ((e != null) && (e.target != null)) {
					let color = e.target.style.backgroundColor.split(',')
					color = parseInt(parseInt(color[0].substring(4)).toString(16) + parseInt(color[1]).toString(16) + parseInt(color[2]).toString(16), 16)
					_qset.options.backgroundTheme = 'themeSolidColor'
					_qset.options.backgroundColor = color
					return _setBackground()
				}
			})
			return false
		})

		$('#opaque-toggle').change(function () {
			_anchorOpacity = ' '
			const dots = $(document).find('.dot')
			let i = 0
			return (() => {
				const result = []
				while (i < dots.length) {
					$(dots[i]).removeClass('frosted transparent')
					result.push(i++)
				}
				return result
			})()
		})

		$('#frosted-toggle').change(function () {
			_anchorOpacity = ' frosted'
			const dots = $(document).find('.dot')
			let i = 0
			return (() => {
				const result = []
				while (i < dots.length) {
					$(dots[i]).removeClass('transparent').addClass('frosted')
					result.push(i++)
				}
				return result
			})()
		})

		$('#transparent-toggle').change(function () {
			_anchorOpacity = ' transparent'
			const dots = $(document).find('.dot')
			let i = 0
			return (() => {
				const result = []
				while (i < dots.length) {
					$(dots[i]).removeClass('frosted').addClass('transparent')
					result.push(i++)
				}
				return result
			})()
		})

		document.querySelector('#btnChooseImage').addEventListener('click', btnChooseImage)

		// Events pertaining to resize.
		document.querySelector('#btnMoveResize').addEventListener('click', resizable)
		document.querySelector('#btnMoveResizeDone').addEventListener('click', resizableDone)
		document.querySelector('#btnMoveResizeCancel').addEventListener('click', resizableCancel)

		// Events pertaining to the title.
		document.querySelector('#btn-enter-title').addEventListener('click', btnTitle)  // Temporarily disable while using MWDK
		document.querySelector('#title').addEventListener('click', _showMiniTitleEditor)
		document.querySelector('#header .link').addEventListener('click', _showMiniTitleEditor)

		window.setTitle = function (title) {
			if (title == null) { title = document.getElementById("title").textContent }

			title = title.replace(/</g, '').replace(/>/g, '')

			document.querySelector('#titlebox').classList.remove('show')
			document.querySelector('#titlechanger').classList.remove('show')
			document.querySelector('#backgroundcover').classList.remove('show')
			return document.querySelector('#title').textContent = title || 'My labeling widget'
		}

		document.getElementById('canvas').addEventListener('click', _addTerm, false)

		// update background
		return $('#colorpicker').spectrum({
			move: _updateColorFromSelector,
			cancelText: '',
			chooseText: 'Done'
		})
	}

	function resizable() {
		_resizeMode(true)

		let resizable = document.querySelector('.resizable')

		_qset.options.backgroundTheme === "themeGraphPaper"
			? resizable.classList.add('dark')
			: resizable.classList.remove('dark')

		_qset.options.backgroundTheme === "themeGraphPaper"
			? document.querySelector('.resizable').classList.add('dark')
			: document.querySelector('.resizable').classList.remove('dark')

		let imageWrapper = document.querySelector('#imagewrapper')
		return _lastImgDimensions = {
			width: imageWrapper.offsetWidth,
			height: imageWrapper.offsetHeight,
			left: imageWrapper.offsetLeft,
			top: imageWrapper.offsetTop,
		}
	}

	function resizableCancel() {
		_resizeMode(false)

		let imageWrapper = document.querySelector('#imagewrapper')
		imageWrapper.style.width = _lastImgDimensions.width + 'px'
		imageWrapper.style.height = _lastImgDimensions.height + 'px'
		imageWrapper.style.left = _lastImgDimensions.left + 'px'

		return imageWrapper.style.top = _lastImgDimensions.top + 'px'
	}

	function resizableDone() { _resizeMode(false) }

	function btnChooseImage() {
		if (flag3D === true) { remove3DLoadedAssets() }
		Materia.CreatorCore.showMediaImporter(mediaFileType)
	}

	function btnTitle() {
		Materia.CreatorCore.showMediaImporter(mediaFileType)
		return true
	}

	var _showMiniTitleEditor = function () {
		document.querySelector('#titlechanger').classList.add('show')
		document.querySelector('#backgroundcover').classList.add('show')

		return $('#titletxt').val($('#title').html()).focus()
	}

	const _makeDraggable = () => // drag all sides of the image for resizing
		$('#imagewrapper').draggable({
			drag(event, ui) { return ui }

		}).resizable({
			aspectRatio: true,
			handles: 'n, e, s, w, ne, nw, se, sw'
		})

	// sets resize mode on and off, and sets UI accordingly
	var _resizeMode = function (isOn) {
		$('#terms').css('display', isOn ? 'none' : 'block')
		$('#canvas').css('display', isOn ? 'none' : 'block')
		$('#maincontrols').css('display', isOn ? 'none' : 'block')
		$('#resizecontrols').css('display', isOn ? 'block' : 'none')
		if (isOn) {
			$('#imagewrapper').addClass('resizable')
			$('#controlcover').addClass('show')
			$('#btnMoveResizeCancel').css('display', 'block')
			return $('#btnMoveResizeDone').css('display', 'block')
		} else {
			$('#imagewrapper').removeClass('resizable')
			$('#controlcover').removeClass('show')
			$('#btnMoveResizeCancel').css('display', 'none')
			return $('#btnMoveResizeDone').css('display', 'none')
		}
	}

	// set background color, called from the spectrum events
	var _updateColorFromSelector = function (color) {
		_qset.options.backgroundTheme = 'themeSolidColor'
		_qset.options.backgroundColor = parseInt(color.toHex(), 16)
		return _setBackground()
	}

	// sets background from the qset
	var _setBackground = function () {
		let background
		document.querySelector('.backgroundtile').classList.remove('show')

		// set background
		switch (_qset.options.backgroundTheme) {
			case 'themeGraphPaper':
				background = 'url(assets/labeling-graph-bg.png)'
				document.querySelector('.graph').classList.add('show')
				break

			case 'themeCorkBoard':
				background = 'url(assets/labeling-cork-bg.jpg)'
				document.querySelector('.cork').classList.add('show')
				break

			default:
				// convert to hex and zero pad the background, which is stored as an integer
				background = '#' + ('000000' + _qset.options.backgroundColor.toString(16)).substr(-6)
				document.querySelector('.color').classList.add('show')
				document.querySelector('#curcolor').style.background = background
		}

		return document.querySelector('#board').style.background = background
	}

	const initExistingWidget = function (title, widget, qset, version, baseUrl) {
		qset.options.flag3D === false ? initExisting2D(title, widget, qset, version, baseUrl)
			: initExisting3D(title, widget, qset, version, baseUrl)
	}

	function initExisting2D(title, widget, qset, version, baseUrl) {
		mediaFileType.push('jpg', 'jpeg', 'gif', 'png')
		_qset = qset

		_setupCreator()
		_makeDraggable()

		// get asset url from Materia API (baseUrl and all)
		const url = Materia.CreatorCore.getMediaUrl(_qset.options.image.id)

		// render the image inside of the imagewrapper
		let imageDon = document.querySelector('#image')
		imageDon.setAttribute('src', url)
		imageDon.setAttribute('data-imgid', _qset.options.image.id)

		// load the image resource via JavaScript for rendering later
		_img.src = url
		let imageWrapper = document.querySelector('#imagewrapper')

		_img.onload = function () {
			imageWrapper.style.height = (_img.height * _qset.options.imageScale) + 'px'
			return imageWrapper.style.width = (_img.width * _qset.options.imageScale) + 'px'
		}

		// set the resizable image wrapper to the size and pos from qset
		imageWrapper.style.left = _qset.options.imageX + 'px'
		imageWrapper.style.top = _qset.options.imageY + 'px'

		// set the title from the qset
		document.querySelector('#title').innerHTML = title
		_title = title

		// add qset terms to the list
		// legacy support:
		let questions = qset.items
		if ((questions[0] != null) && questions[0].items) { questions = questions[0].items }

		return Array.from(questions).map((item) =>
			_makeTerm(item.options.endPointX, item.options.endPointY, item.questions[0].text, item.options.labelBoxX, item.options.labelBoxY, item.id))
	}

	function initExisting3D(title, widget, qset, version, baseUrl) {

		_qset = qset

		_setupCreator()
		_makeDraggable()

		// get asset url from Materia API (baseUrl and all)
		const url = Materia.CreatorCore.getMediaUrl(_qset.options.image.id)
		let realURL = 'https://'
		let reverseSplitURL = url.split('/').reverse()
		let httpsIndex = reverseSplitURL.findIndex(element => element === 'https:')

		for (let index = httpsIndex - 2; index > -1; index--) {
			let temp = realURL.concat(reverseSplitURL[index], '/')
			realURL = temp
		}

		setUp3DEnvironment()
		// PASS THE SPHERE SCALE AND UPDATE AFTER getObj() RUNS.
		load3DAsset(realURL, _qset.options.sphereRadius)
		_img.src = realURL

		// set the title from the qset
		document.querySelector('#title').innerHTML = title
		_title = title

		flag3D = true

		// legacy support:
		let questions = qset.items
		if ((questions[0] != null) && questions[0].items) { questions = questions[0].items }

		return setTimeout(() => {
			Array.from(questions).map((item) =>
				reloadingLabels(item.options.endPointX, item.options.endPointY, item.questions[0].text, item.options.labelBoxX, item.options.labelBoxY, item.id,
					item.options.vertex.faceIndex, item.options.vertex.point, item.options.vertex.uv))
		},
			(oneSecond / 2))
	}

	// draw lines on the board
	const _drawBoard = function () {
		// clear the board area
		_context.clearRect(0, 0, 1000, 1000)

		// iterate every term and read dot attributes
		return (() => {
			const result = []
			let termArray = document.querySelectorAll('.term')
			for (let term of Array.from(termArray)) {
				const dotx = parseInt(term.getAttribute('data-x'))
				const doty = parseInt(term.getAttribute('data-y'))

				// read label position from css
				const labelx = parseInt(term.style.left)
				const labely = parseInt(term.style.top)

				Labeling.Draw.drawLine(_context, dotx + _offsetX, doty + _offsetY, labelx + _offsetX, labely + _offsetY, 6, '#fff')
				result.push(Labeling.Draw.drawLine(_context, dotx + _offsetX, doty + _offsetY, labelx + _offsetX, labely + _offsetY, 2, '#000'))
			}
			return result
		})()
	}

	// Add term to the list, called by the click event
	var _addTerm = function (e) {

		flag3D
			? _makeTerm3D(e.pageX - document.getElementById('frame').offsetLeft - document.getElementById('board').offsetLeft, e.pageY - 50)
			: _makeTerm(e.pageX - document.getElementById('frame').offsetLeft - document.getElementById('board').offsetLeft, e.pageY - 50)

		document.querySelector('#boardcover').style.display = 'none'
		document.querySelector('#help_adding').style.display = 'none'

		if (flag3D === false) { document.querySelector('#imagewrapper').classList.remove('faded') }

		return setTimeout(function () {
			document.querySelector('#help_moving').style.display = 'block'
			document.querySelector('#btnMoveResize').style.display = 'block'
			return document.querySelector('#btnChooseImage').style.display = 'block'
		}
			, oneSecond / 2)
	}

	// generate a term div
	var _makeTerm = function (x, y, text, labelX = null, labelY = null, id) {
		if (text == null) { text = _defaultLabel }
		if (id == null) { id = '' }

		const dotx = x
		const doty = y

		const term = document.createElement('div')
		term.id = 'term_' + Math.random()  // fake id for linking with dot
		term.className = 'term'
		term.innerHTML = "<div class='label-input' contenteditable='true' onkeypress='return (this.innerText.length <= 400)'>" + text + "</div><div class='delete'></div>"

		// if we're generating a generic one, decide on a position
		if ((labelX === null) || (labelY === null)) {
			y = (y - 200)

			const labelAreaHalfWidth = 500 / 2
			const labelAreaHalfHeight = 500 / 2

			const labelStartOffsetX = 70
			const labelStartOffsetY = 50

			if (x < labelAreaHalfWidth) {
				x -= labelStartOffsetX
				y < labelAreaHalfHeight ? y += labelStartOffsetY : y -= labelStartOffsetY

			} else {
				x += labelStartOffsetX
				y < labelAreaHalfHeight ? y += labelStartOffsetY : y -= labelStartOffsetY
			}

			if (y < 150) { y = 150 }
			if (x > 450) { x = 450 }
			if (x < 100) { x = 100 }

		} else {
			x = labelX
			y = labelY
		}

		// set term location and dot attribute
		term.style.left = x + 'px'
		term.style.top = y + 'px'
		term.setAttribute('data-x', dotx)
		term.setAttribute('data-y', doty)
		term.setAttribute('data-id', id)

		const dot = document.createElement('div')
		dot.className = 'dot' + _anchorOpacity
		dot.style.left = dotx + 'px'
		dot.style.top = doty + 'px'
		dot.setAttribute('data-termid', term.id)
		dot.id = "dot_" + term.id

		document.getElementById('terms').append(term)
		document.getElementById('terms').append(dot)

		// edit on click
		term.onclick = function () {
			term.childNodes[0].focus()
			document.execCommand('selectAll', false, null)
			if (term.childNodes[0].innerHTML === _defaultLabel) {
				return term.childNodes[0].innerHTML = ''
			}
		}

		// resize text on change
		term.childNodes[0].onkeyup = _termKeyUp
		// set initial font size
		term.childNodes[0].onkeyup({ target: term.childNodes[0] })

		// enter key press should stop editing
		term.childNodes[0].onkeydown = _termKeyDown

		// check if blank when the text is cleared
		term.childNodes[0].onblur = _termBlurred

		// clean up pasted content to make sure we don't accidentally get invisible html garbage
		term.childNodes[0].onpaste = _termPaste

		// make delete button remove it from the list
		term.childNodes[1].onclick = function () {
			term.parentElement.removeChild(term)
			dot.parentElement.removeChild(dot)

			return _drawBoard()
		}

		// make the term movable
		$(term).draggable({
			drag(event, ui) {
				if (ui.position.left < 20) { ui.position.left = 20 }
				if (ui.position.left > 460) { ui.position.left = 460 }
				if (ui.position.top > 505) { ui.position.top = 505 }
				if (ui.position.top < 20) { ui.position.top = 20 }
				_drawBoard()
				return ui
			}
		})

		// make the dot movable
		$(dot).draggable({ drag: _dotDragged })

		setTimeout(function () {
			term.childNodes[0].focus()
			return document.execCommand('selectAll', false, null)
		}
			, 1 * (oneSecond / 100))

		return _drawBoard()
	}

	var _makeTerm3D = function (x, y, text, labelX = null, labelY = null, id) {

		if (text == null) { text = _defaultLabel }
		if (id == null) { id = '' }

		const term = document.createElement('div')
		term.id = 'term_' + Math.random()  // fake id for linking with dot

		const dot = document.createElement('div')
		dot.id = "dot_" + term.id

		import('./core3D.js')
			.then((module) => {
				if (module.intersects.length > 0) {
					let vertex = module.vertex
					vertex.dataTermID = term.id
					vertex.dotID = 'dot_' + term.id
					renderedSpheresGroup.add(vertex.sphere())
					listOfVertex.push(vertex)
					scaleNeutral()
					appendingOfMake3D(x, y, text, labelX = null, labelY = null, id, term, dot)
				}
			}).catch((error) => {
				console.log(error)
			})
	}

	function reloadingLabels(x, y, text, labelX = null, labelY = null, id, faceIndex, point, uv) {
		if (text == null) { text = _defaultLabel }
		if (id == null) { id = '' }
		const reloadScale = _qset.options.sphereScale
		const term = document.createElement('div')
		term.id = 'term_' + Math.random()  // fake id for linking with dot

		const dot = document.createElement('div')
		dot.id = "dot_" + term.id

		import('./core3D.js')
			.then((module) => {
				return module.createVertex(term.id, dot.id, faceIndex, point, uv)

			}).then((vertex) => {
				listOfVertex.push(vertex)
				renderedSpheresGroup.add(vertex.sphere())

			}).then(() => {
				appendingOfMake3D(x, y, text, labelX = null, labelY = null, id, term, dot)

			}).then(() => {
				scaleSpheresOnReload(reloadScale)

			}).catch((error) => {
				console.log(error)
			})
	}

	// Manages adding the label for _makeTerm3D
	function appendingOfMake3D(x, y, text, labelX = null, labelY = null, id, term, dot) {

		const dotx = x
		const doty = y

		// if we're generating a generic one, decide on a position
		if ((labelX === null) || (labelY === null)) {
			y = (y - 200)

			const labelAreaHalfWidth = 500 / 2
			const labelAreaHalfHeight = 500 / 2

			const labelStartOffsetX = 70
			const labelStartOffsetY = 50

			if (x < labelAreaHalfWidth) {
				x -= labelStartOffsetX
				y < labelAreaHalfHeight ? y += labelStartOffsetY : y -= labelStartOffsetY

			} else {
				x += labelStartOffsetX
				y < labelAreaHalfHeight ? y += labelStartOffsetY : y -= labelStartOffsetY
			}

			if (y < 150) { y = 150 }

			x < 100 ? x = 100
				: x > 450 ? x = 450 : true

		} else {
			x = labelX
			y = labelY
		}

		// set term location and dot attribute
		term.className = `term`
		term.innerHTML = "<div class='label - input' contenteditable='true' onkeypress='return (this.innerText.length <= 400)'>" + text + "</div><div class='delete '></div>"
		term.style.left = `${x}px`
		term.style.top = `${y}px`
		term.setAttribute('data-x', dotx)
		term.setAttribute('data-y', doty)
		term.setAttribute('data-id', id)

		dot.className = `dot${_anchorOpacity}`
		dot.style.left = `${dotx}px`
		dot.style.top = `${doty}px`
		dot.setAttribute('data-termid', term.id)

		document.getElementById('terms').append(term)

		// edit on click
		term.onclick = function () {
			term.childNodes[0].focus()
			document.execCommand('selectAll', false, null)
			if (term.childNodes[0].innerHTML === _defaultLabel) {
				return term.childNodes[0].innerHTML = ''
			}
		}

		// resize text on change
		term.childNodes[0].onkeyup = _termKeyUp

		// set initial font size
		term.childNodes[0].onkeyup({ target: term.childNodes[0] })

		// enter key press should stop editing
		term.childNodes[0].onkeydown = _termKeyDown

		// check if blank when the text is cleared
		term.childNodes[0].onblur = _termBlurred

		// clean up pasted content to make sure we don't accidentally get invisible html garbage
		term.childNodes[0].onpaste = _termPaste

		// make delete button remove it from the list
		term.childNodes[1].onclick = () => {
			term.parentElement.removeChild(term)
			listOfVertex.forEach((element, index) => {
				if (element.dataTermID == term.id) {
					renderedSpheresGroup.remove(renderedSpheresGroup.children[index])
					listOfVertex.splice(index, 1)
					highlightSpheresGroup.children[0].visible = false
				}
			})

			return _drawBoard()
		}

		// make the term movable
		$(term).draggable({
			drag(event, ui) {
				if (ui.position.left < 20) { ui.position.left = 20 }
				if (ui.position.left > 460) { ui.position.left = 460 }
				if (ui.position.top > 505) { ui.position.top = 505 }
				if (ui.position.top < 20) { ui.position.top = 20 }
				_drawBoard()
				return ui
			}
		})

		// appends the highlightSphere to the label when hovering
		let highlightSphere = highlightSpheresGroup.children[0]
		term.childNodes[0].onmouseover = () => {
			listOfVertex.forEach((element, index) => {
				if (element.dataTermID == term.id) {
					highlightSphere.visible = true
					let position = renderedSpheresGroup.children[index].position
					highlightSphere.position.x = position['x']
					highlightSphere.position.y = position['y']
					highlightSphere.position.z = position['z']
				}
			})
		}

		setTimeout(function () {
			term.childNodes[0].focus()
			return document.execCommand('selectAll', false, null)
		}
			, 1 * (oneSecond / 100))

		return _drawBoard()
	}

	// When typing on a term, resize the font accordingly
	var _termKeyUp = function (e) {
		if ((e == null)) { e = window.event }
		let fontSize = (16 - (e.target.innerHTML.length / 10))
		if (fontSize < 12) { fontSize = 12 }
		return e.target.style.fontSize = fontSize + 'px'
	}

	// When typing on a term, resize the font accordingly
	var _termKeyDown = function (e) {
		if ((e == null)) { e = window.event }

		if (e.keyCode === 13) {
			// Defocus
			e.target.blur()
			window.getSelection().removeAllRanges()  // needed for contenteditable blur
			// put event in a sleeper hold
			if (e.stopPropagation != null) { e.stopPropagation() }
			e.preventDefault()
			return false
		}

		// Escape
		if (e.keyCode === 27) {
			if (e.target.innerHTML.length < 1) {
				$(document.getElementById('dot_' + e.target.parentElement.id)).remove()
				$(e.target.parentElement).remove()
				return _drawBoard()

			} else {
				// Defocus
				e.target.blur()
				return window.getSelection().removeAllRanges()  // needed for contenteditable blur
			}
		}
	}

	// If the term is blank, put dummy text in it
	var _termBlurred = function (e) {
		if ((e == null)) { e = window.event }
		if (e.target.innerHTML === '') { return e.target.innerHTML = _defaultLabel }
	}

	// Convert anything on the clipboard into pure text before pasting it into the label
	var _termPaste = function (e) {
		let clipboardArgument, clipboardData, input
		if (e == null) { e = window.event }
		e.preventDefault()

		// contenteditable divs will insert an empty <br/> when they're empty, this checks for and removes them on paste
		if (e.target.tagName === 'BR') {
			input = e.target.parentElement
			e.target.parentElement.removeChild(e.target)
		} else {
			input = e.target
		}
		// ie11 has different arguments for clipboardData and makes it a method of window instead of the paste event
		if (e.clipboardData != null) {
			({ clipboardData } = e)
			clipboardArgument = 'text/plain'

		} else {
			({ clipboardData } = window)
			clipboardArgument = 'Text'
		}

		const sel = window.getSelection()
		if (sel.rangeCount) {
			const range = sel.getRangeAt(0)
			range.deleteContents()

			const newText = clipboardData.getData(clipboardArgument)
			const newNode = document.createTextNode(newText)
			range.insertNode(newNode)

			const newRange = document.createRange()
			newRange.selectNodeContents(newNode)
			newRange.collapse(false)

			sel.removeAllRanges()
			return sel.addRange(newRange)
		}
	}

	// a dot has been dragged, lock it in place if its within 10px
	var _dotDragged = function (event, ui) {
		let minDist = 9999
		let minDistEle = null

		for (let dot of Array.from($('.dot'))) {
			if (dot === event.target) { continue }

			const dist = Math.sqrt(Math.pow((ui.position.left - $(dot).position().left), 2) + Math.pow((ui.position.top - $(dot).position().top), 2))
			if (dist < minDist) {
				minDist = dist
				minDistEle = dot
			}
		}

		// less than 10px away, put the dot where the other one is
		// this is how duplicates are supported
		if (minDist < 10) {
			ui.position.left = $(minDistEle).position().left
			ui.position.top = $(minDistEle).position().top
		}

		const term = document.getElementById(event.target.getAttribute('data-termid'))
		term.setAttribute('data-x', ui.position.left)
		term.setAttribute('data-y', ui.position.top)

		return _drawBoard()
	}

	// called from Materia creator page
	const onSaveClicked = function (mode) {
		if (mode == null) { mode = 'save' }

		return !_buildSaveData()
			? Materia.CreatorCore.cancelSave('Widget needs a title and at least one term.')
			: Materia.CreatorCore.save(_title, _qset)
	}

	const onSaveComplete = (title, widget, qset, version) => true

	// called from Materia creator page
	// place the questions in an arbitrary location to be moved
	const onQuestionImportComplete = items => Array.from(items).map((item) =>
		_makeTerm(150, 300, item.questions[0].text, null, null, item.id))

	// generate the qset
	var _buildSaveData = function () {
		if ((_qset == null)) { _qset = {} }
		if ((_qset.options == null)) { _qset.options = {} }

		const words = []

		_qset.assets = []
		_qset.rand = false
		_qset.name = ''
		_title = document.getElementById('title').innerHTML
		let _okToSave = (_title != null) && (_title !== '') ? true : false

		const items = []
		const dots = document.querySelectorAll('.term')
		for (let dot of Array.from(dots)) {
			const item = {}
			const label = dot.childNodes[0].innerHTML

			const answer = {
				text: label,
				value: 100,
				id: ''
			}
			item.answers = [answer]
			item.assets = []

			const question = { text: label }
			item.questions = [question]
			item.type = 'QA'
			item.id = dot.getAttribute('data-id') || ''

			if (flag3D === false) {
				item.options = {
					labelBoxX: parseInt(dot.style.left.replace('px', '')),
					labelBoxY: parseInt(dot.style.top.replace('px', '')),
					endPointX: parseInt(dot.getAttribute('data-x')),
					endPointY: parseInt(dot.getAttribute('data-y'))
				}

			} else {
				let vertex
				listOfVertex.forEach((element) => {
					if (element.dataTermID == dot.id) { vertex = element }
				})

				// The sphere name is generated based on the dotID automatically
				item.options = {
					labelBoxX: parseInt(dot.style.left.replace('px', '')),
					labelBoxY: parseInt(dot.style.top.replace('px', '')),
					endPointX: parseInt(dot.getAttribute('data-x')),
					endPointY: parseInt(dot.getAttribute('data-y')),
					vertex: {
						dataTermID: vertex.dataTermID,
						dotID: vertex.dotID,
						faceIndex: vertex.faceIndex,
						point: vertex.point,
						uv: vertex.uv,
						// sphereRadius: sphereRadius,
					}
				}
			}

			items.push(item)
		}

		_qset.items = items

		if (items.length < 1) { _okToSave = false }

		if (_anchorOpacity.indexOf('frosted') > -1) { _anchorOpacityValue = 0.5 }
		else if (_anchorOpacity.indexOf('transparent') > -1) { anchorOpacityValue = 0.0 }

		_qset.options.flag3D === true ? qsetOption3D(_qset)
			: flag3D === true ? qsetOption3D(_qset)
				: qsetOption(_qset)

		_qset.version = "2"
		return _okToSave
	}

	// called from Materia creator page
	// loads and sets appropriate data for loading image
	const onMediaImportComplete = function (media) {
		flag3D === false ? onMediaImportComplete2D(media) : onMediaImportComplete3D(media)
	}

	function onMediaImportComplete2D(media) {
		mediaFileType.push('jpg', 'jpeg', 'gif', 'png')
		document.getElementById('canvas').style.display = 'block'
		document.getElementById('chooseimage').style.display = 'none'

		const url = Materia.CreatorCore.getMediaUrl(media[0].id)
		let image = document.getElementById('image')
		image.style.display = ''
		image.setAttribute('src', url)
		image.setAttribute('data-imgid', media[0].id)
		_img.src = url

		_img.onload = function () {
			let height, width
			const iw = document.getElementById('imagewrapper')

			if (_img.width > _img.height) {
				width = 570 + 'px'
				iw.style.width = width
				iw.style.height = ((_img.height * parseInt(iw.style.width)) / _img.width) + 'px'

			} else {
				height = 470 + 'px'
				iw.style.height = height
				iw.style.width = ((_img.width * parseInt(iw.style.height)) / _img.height) + 'px'
			}

			iw.style.left = (600 / 2) - (parseInt(iw.style.width) / 2) + 'px'
			return iw.style.top = (550 / 2) - (parseInt(iw.style.height) / 2) + 'px'
		}

		_makeDraggable()
		return true
	}

	function onMediaImportComplete3D(media) {

		mediaFileType.push('obj')
		let _anchorOpacityValue = 1.0
		const url = Materia.CreatorCore.getMediaUrl(media[0].id)

		_img.src = url

		load3DAsset(url)
		_makeDraggable()

		return true
	}

	function qsetOption(_qset) {
		let _anchorOpacityValue = 1.0
		let imageWrapper = document.querySelector('#imagewrapper')

		_qset.options = {
			backgroundTheme: _qset.options.backgroundTheme,
			backgroundColor: _qset.options.backgroundColor,
			imageScale: parseFloat(getComputedStyle(imageWrapper, null).width.replace("px", "")) / _img.width,
			image: {
				id: document.getElementById('image').getAttribute('data-imgid'),
				materiaType: "asset"
			},
			imageX: imageWrapper.offsetLeft,
			imageY: imageWrapper.offsetTop,
			opacity: _anchorOpacityValue,
			flag3D: flag3D,
		}
	}

	function qsetOption3D(_qset) {
		let _anchorOpacityValue = 1.0
		console.log(highlightSpheresGroup.children[0])

		_qset.options = {
			backgroundTheme: _qset.options.backgroundTheme,
			backgroundColor: _qset.options.backgroundColor,
			image: {
				id: _img.src,	// Store in the id the model fileName.obj
				materiaType: 'asset',
			},
			flag3D: flag3D,
			sphereRadius: highlightSpheresGroup.children[0].geometry.parameters.radius,
			sphereScale: highlightSpheresGroup.children[0].scale
		}

		console.log(_qset.options.sphereRadius)
	}

	// Choose which UI based on the version of the widget. By default its the 2D version.
	function chooseVer() {
		let btnEnterTitle = document.querySelector('#btn-enter-title')
		let ver3D = document.querySelector('#ver3D')
		let ver2D = document.querySelector('#ver2D')

		ver2D.classList.toggle('orange')

		ver2D.addEventListener('click', () => {
			ver2D.classList.toggle('orange')
			ver3D.classList.toggle('orange')
			ver2D.classList.contains('orange') ? flag3D = false : flag3D = true
		})

		ver3D.addEventListener('click', () => {
			ver2D.classList.toggle('orange')
			ver3D.classList.toggle('orange')
			ver2D.classList.contains('orange') ? flag3D = false : flag3D = true
		})

		btnEnterTitle.addEventListener('click', () => {
			if (flag3D == true) {
				mediaFileType.push('obj')
				setUp3DEnvironment()
			} else {
				mediaFileType.push('jpg', 'jpeg', 'gif', 'png')
			}
		})
	}

	// set the 3D UI.
	function setUp3DEnvironment() {
		removeFromUI()
		optionsBox()

		document.getElementById('btnChooseImage').innerHTML = 'Choose a different model'
		document.getElementById('btnMoveResize').remove()

		let tagBottom = document.getElementsByClassName('optionsBox')[0]
		tagBottom.addEventListener('click', optionsBoxActions)

		// btn created in display order.
		let btnScaleSmaller = createBtn('scaleDownSpheres', 'Smaller', 'controls')
		let btnScaleBigger = createBtn('scaleUpSpheres', 'Larger', 'controls')
		scaleBanner()
		let btnCenterCamera = createBtn('centerCamera', 'Center Camera', 'controls')
		let btnToggleLines = createBtn('toggleLines', 'Toggle Lines', 'controls')
		let btnRotateModel = createBtn('btnMoveResize', 'Toggle label placement', 'controls')

		let loadCore3D = document.createElement("script")
		loadCore3D.src = 'core3D.js'
		loadCore3D.type = 'module'

		document.getElementsByTagName('head')[0].appendChild(loadCore3D)
		document.getElementById('canvas').style.pointerEvents = 'none'

		import('./core3D.js')
			.then((module) => {
				uvMapToMousePoint = module.uvMapToMousePoint
				renderedSpheresGroup = module.renderedSpheresGroup
				highlightSpheresGroup = module.highlightSpheresGroup
				verticalCameraRotation = module.verticalCameraRotation
				horizontalCameraRotation = module.horizontalCameraRotation
				return module

			}).then((module) => {
				startMouseDownFire()

				let my3DCanvas = document.getElementById('my3DCanvas')
				my3DCanvas.addEventListener('mousemove', arrowKeys)

				btnScaleBigger.addEventListener('click', scaleUp)
				btnScaleSmaller.addEventListener('click', scaleDown)
				btnCenterCamera.addEventListener('click', module.centeringCameraEvent)

				document.onkeydown = (e) => { arrowKeys(e) }
				document.onkeyup = (e) => { revertToPreviousState(e) }

			}).catch((err) => {
				console.log(err)
			})

		disable2DEvents()
		enable3DEvents()
	} // End of Environment3D

	function scaleBanner() {
		let banner = document.createElement('div')
		banner.id = `scaleBanner`
		banner.innerHTML = `Label anchor size`
		banner.style.textAlign = 'center'
		banner.style.color = '#000000'
		banner.style.backgroundColor = '#fffac4'
		banner.style.marginBottom = '9px'
		banner.style.paddingTop = '5px'
		banner.style.paddingBottom = '5px'
		banner.style.font = 'bold'

		let controlNodeList = document.getElementById('controls')
		controlNodeList.insertBefore(banner, controlNodeList.children[3])
	}

	// Scaling up the label spheres requires increasing the scale of each sphere individually.
	// Scaling up the group scales up all the spheres in one go but also scales up the spacing
	// between node creating a visual distortion between the spheres, model, and lines.
	function scaleUp() {
		let groupChildren = highlightSpheresGroup.children
		if (groupChildren.length > 0) {
			let sphereCurrentScale = groupChildren[0].scale.x
			if (sphereCurrentScale < 3.1) {
				groupChildren[0].scale.set(
					sphereCurrentScale + 0.1, sphereCurrentScale + 0.1, sphereCurrentScale + 0.1
				)
			}
		}

		groupChildren = renderedSpheresGroup.children
		if (groupChildren.length > 0) {
			let sphereCurrentScale = groupChildren[0].scale.x
			if (sphereCurrentScale < 3.1) {
				groupChildren.forEach((element) => {
					element.scale.set(
						sphereCurrentScale + 0.1, sphereCurrentScale + 0.1, sphereCurrentScale + 0.1
					)
				})
			}
		}
	}

	function scaleDown() {
		let groupChildren = highlightSpheresGroup.children
		if (groupChildren.length > 0) {

			let sphereCurrentScale = groupChildren[0].scale.x
			if (sphereCurrentScale > 0.5) {
				groupChildren[0].scale.set(
					sphereCurrentScale - 0.1, sphereCurrentScale - 0.1, sphereCurrentScale - 0.1
				)
			}
		}

		groupChildren = renderedSpheresGroup.children
		if (groupChildren.length > 0) {

			let sphereCurrentScale = groupChildren[0].scale.x
			if (sphereCurrentScale > 0.5) {
				groupChildren.forEach((element) => {
					element.scale.set(
						sphereCurrentScale - 0.1, sphereCurrentScale - 0.1, sphereCurrentScale - 0.1
					)
				})
			}
		}
	}

	// Makes the new added sphere the same scale as the others.
	function scaleNeutral() {
		let groupChildren = highlightSpheresGroup.children
		if (groupChildren.length > 0) {
			let sphereCurrentScale = groupChildren[0].scale.x
			groupChildren[0].scale.set(sphereCurrentScale, sphereCurrentScale, sphereCurrentScale)
		}

		groupChildren = renderedSpheresGroup.children
		if (groupChildren.length > 0) {
			let sphereCurrentScale = groupChildren[0].scale.x
			groupChildren.forEach((element) => {
				element.scale.set(sphereCurrentScale, sphereCurrentScale, sphereCurrentScale)
			})
		}
	}

	// On reloading a widget the sphere scales will be set to the one save on the qset.
	function scaleSpheresOnReload(reloadScale = 1) {
		let groupChildren = highlightSpheresGroup.children
		if (groupChildren.length > 0) {
			groupChildren[0].scale.set(reloadScale.x, reloadScale.y, reloadScale.z)
		}

		groupChildren = renderedSpheresGroup.children
		if (groupChildren.length > 0) {
			groupChildren.forEach((element) => {
				element.scale.set(reloadScale.x, reloadScale.y, reloadScale.z)
			})
		}
	}

	// Function that creates the effect of an animation for the lines when moving the model.
	function startMouseDownFire() {
		reRenderLines()
		mouseDownFireIntervals = setInterval(reRenderLines, 4) // 4 ms is the fastest setInterval can trigger.
	}

	// Arrow keys rotate the camera.
	function arrowKeys(e) {
		let radiantIncrement = (Math.PI * cameraRotationSpeed) / 180
		switch (e.keyCode) {
			case 37:
				horizontalCameraRotation(radiantIncrement) // Left
				break;

			case 38:
				verticalCameraRotation(radiantIncrement) // Up
				break;

			case 39:
				horizontalCameraRotation(-radiantIncrement) // Right
				break;

			case 40:
				verticalCameraRotation(-radiantIncrement) // Down
				break;

			case 18:
				ctrlToggleState()
				break;

			default:
				break;
		}
	}

	function revertToPreviousState(e) {
		switch (e.keyCode) {
			case 18:
				fireCTRL = true
				addingLabelsBtnEffect()
				break
		}
	}

	function removeFromUI() {
		document.querySelector('#image').remove()
		document.querySelector('#imagewrapper').remove()
		document.querySelector('#opacity-toggle').remove()
		document.querySelector('#maincontrols').remove()
		let helpBox = document.getElementById('help_moving')
		for (let i = 7; i >= 3; i--) { helpBox.lastElementChild.remove() }
	}

	function createBtn(btnId, btnValue, btnParent) {
		let btn = document.createElement('button')
		btn.type = 'button'
		btn.innerHTML = btnValue
		btn.id = btnId

		let controlNodeList = document.getElementById(btnParent)
		controlNodeList.insertBefore(btn, controlNodeList.children[3])

		return btn
	}

	function optionsBox() {
		let modeIdBox = document.createElement('div')
		modeIdBox.classList.add('optionsBox')
		modeIdBox.innerHTML = 'Rotating'

		const controlNodeList = document.getElementById('controls')
		controlNodeList.insertBefore(modeIdBox, controlNodeList.children[0])

		let menu = document.createElement('div')
		menu.classList.add('optionsMenu')
		menu.innerHTML = 'mouse / keyboard support'

		// modeIdBox.appendChild(menu)
	}

	function optionsBoxActions() {
		let modeIdBox = document.getElementsByClassName('optionsBox')[0]
		if (modeIdBox.offsetHeight < 50) {
			modeIdBox.style.top = 0 + 'px'
			// modeIdBox.classList.add('animate')
		}
		else {
			modeIdBox.style.top = ''
			// modeIdBox.classList.remove('animate')
		}
	}

	function disable2DEvents() {
		document.querySelector('#btnMoveResize').removeEventListener('click', resizable)
		document.querySelector('#btnMoveResizeCancel').removeEventListener('click', resizableCancel)
		document.querySelector('#btnMoveResizeDone').removeEventListener('click', resizableDone)
	}

	function enable3DEvents() {
		document.getElementById('btnMoveResize').addEventListener('click', addingLabelsBtnEffect, true)
		document.getElementById('toggleLines').addEventListener('click', toggleLinesBtnEffect, true)
	}

	function addingLabelsBtnEffect() {
		if (areWeLabeling) { toggleStateRotation() }
		else { toggleStateLabeling() }
	}

	function toggleStateRotation() {
		let element = document.getElementById('canvas')
		element.style.pointerEvents = 'auto'
		element.addEventListener('click', _addTerm, false)

		let btn = document.getElementById('btnMoveResize')
		btn.innerHTML = 'Toggle rotation'
		btn.classList.add('orange')

		let modeIdBox = document.getElementsByClassName('optionsBox')[0]
		modeIdBox.innerHTML = 'Labeling'

		areWeLabeling = false
	}

	function toggleStateLabeling() {
		let element = document.getElementById('canvas')
		element.style.pointerEvents = 'none'
		element.removeEventListener('click', _addTerm, false)

		let btn = document.getElementById('btnMoveResize')
		btn.innerHTML = 'Toggle label placement'
		btn.classList.remove('orange')

		let modeIdBox = document.getElementsByClassName('optionsBox')[0]
		modeIdBox.innerHTML = 'Rotating'

		areWeLabeling = true
	}

	function ctrlToggleState() {
		if (fireCTRL === true) {
			fireCTRL = false
			addingLabelsBtnEffect()
		}
	}

	// Depending on the btn toggle status drawn lines may be display.
	function toggleLinesBtnEffect() {
		let element = document.getElementById('canvas')
		let btn = document.getElementById('toggleLines')

		if (areLinesHided) {
			btn.classList.toggle('orange')
			element.style.display = 'none'
			areLinesHided = false

		} else {
			btn.classList.toggle('orange')
			element.style.display = 'inline'
			areLinesHided = true
		}
	}

	// Updates every term attribute data-x and data-y values. This allows for the lines
	// on the model to be updated and follow it.
	function reRenderLines() {
		listOfVertex.forEach(element => {
			let vector = uvMapToMousePoint(element.point)

			let label = document.getElementById(element.dataTermID)
			label.setAttribute('data-x', vector.x)
			label.setAttribute('data-y', vector.y)
		})

		return _drawBoard()
	}

	function load3DAsset(assetUrl, newRadius = 1) {
		mediaFileType.push('obj')
		import('./core3D.js')
			.then((module) => {
				module.newSphereRadius(newRadius)
				module.getOBJRender(assetUrl)

			})

			.catch((err) => { console.log(err) })
	}

	// removes labels, lines, spheres, and model from the canvas.
	function remove3DLoadedAssets() {
		for (let index = 0; index != 5; index++) {

			let termsList = document.getElementById('terms').childNodes
			termsList.forEach((element) => {
				element.parentElement.removeChild(element)
				listOfVertex.pop()
			})

			renderedSpheresGroup.children.forEach((element) => {
				renderedSpheresGroup.remove(element)
			})
		}

		highlightSpheresGroup.remove(highlightSpheresGroup.children[0])

		import('./core3D.js')
			.then((module) => { module.removeModel() })
			.catch((err) => { console.log(err) })
	}

	// Public members
	return {
		initNewWidget,
		initExistingWidget,
		onSaveClicked,
		onMediaImportComplete,
		onQuestionImportComplete,
		onSaveComplete,
	}

})()
