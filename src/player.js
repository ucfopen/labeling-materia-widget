
Namespace('Labeling').Engine = (function () {

	// ORIGINAL CODE FOR PLAYER
	let _qset = null
	let _questions = null

	// cache element lookups
	const _domCache = {}

	// the image asset
	let _img = null

	// reference to canvas drawing board
	let _canvas = null
	let _context = null

	// the current dragging term
	let _curterm = null

	// anchor tag opacity
	let _anchorOpacityValue = 1.0

	// the current match the term is in proximity of
	let _curMatch = null

	// the current 'page', i.e. the scrolling on the terms
	let _curPage = 0

	// the text arranged by question id
	const _labelTextsByQuestionId = {}

	// legacy support  older qsets are relative to window
	let _offsetX = 0
	let _offsetY = 0

	// state of the puzzle completion
	let _isPuzzleComplete = false

	// zIndex of the terms, incremented so that the dragged term is always on top
	let _zIndex = 11000

	// Variables used to control the 3D functionality
	var uvMapToMousePoint
	let renderedSpheresGroup  // render group containing spheres of each vertex.

	let spacing = 10
	let termWidth = 48
	// Default 10 terms display on termList.
	let numberOfTerms = 10
	let numberOfTermsRemove = 3
	let listOfTerms = []
	let oneSecond = 1000
	let mouseDownFireIntervals = null
	let highlightSpheresGroup = null

	// getElementById and cache it, for the sake of performance
	const _g = id => _domCache[id] || (_domCache[id] = document.getElementById(id))

	// Called by Materia.Engine when your widget Engine should start the user experience.
	const start = function (instance, qset, version) {

		let background
		if (version == null) { version = '1' }
		_qset = qset

		// if (_qset.options.flag3D === true) { chooseVer()  }

		_questions = _qset.items
		if (_questions[0].items) { _questions = _questions[0].items }

		// deal with some legacy qset things
		if (_qset.options.version === 2) {
			_offsetX = -195
			_offsetY = -45
		}

		if ((_qset.options.opacity !== null) && (_qset.options.opacity !== undefined)) {
			_anchorOpacityValue = _qset.options.opacity

		} else {
			_anchorOpacityValue = 1.0
		}

		// set background
		switch (_qset.options.backgroundTheme) {
			case 'themeGraphPaper':
				background = 'url(assets/labeling-graph-bg.png)'
				break

			case 'themeCorkBoard':
				background = 'url(assets/labeling-cork-bg.jpg)'
				break

			default:
				// convert to hex and zero pad the background, which is stored as an integer
				background = '#' + ('000000' + _qset.options.backgroundColor.toString(16)).substr(-6)
		}

		// set background and header title
		_g('board').style.background = background

		if ((instance.name === undefined) || null) { instance.name = "Widget Title Goes Here" }

		_g('title').innerHTML = instance.name
		_g('title').style['font-size'] = ((20 - (instance.name.length / 30)) + 'px')

		// set events
		_g('cancelbtn').addEventListener('click', _hideAlert)
		_g('backgroundcover').addEventListener('click', _hideAlert)
		_g('checkBtn').addEventListener('click', () => _submitAnswers())

		_g('nextbtn').addEventListener('mousedown', function () {
			_curPage++
			return _arrangeList()
		})

		_g('prevbtn').addEventListener('mousedown', function () {
			_curPage--
			return _arrangeList()
		})

		// get canvas context
		_canvas = _g('image')
		_context = _canvas.getContext('2d')

		// draw preview board for intro animation
		if (navigator.userAgent.indexOf("IE 9") === -1) {
			_g('backgroundcover').classList.add('show')
			_drawPreviewBoard()

		} else {
			_g('previewbox').style.display = 'none'
		}

		// load the image asset
		// when done, render the board
		_img = new Image()
		_img.onload = _drawBoard

		let url = Materia.Engine.getImageAssetUrl((
			_qset.options.image ? _qset.options.image.id : _qset.assets[0]))

		_img.src = url

		if (_qset.options.flag3D === true) {
			let realURL = 'https://'
			let reverseSplitURL = url.split('/').reverse()
			let httpsIndex = reverseSplitURL.findIndex(element => element === 'https:')
			_img.src = url

			for (let index = httpsIndex - 2; index > -1; index--) {
				let temp = realURL.concat(reverseSplitURL[index], '/')
				realURL = temp
			}

			_img.src = realURL
			chooseVer(realURL, _qset.options.sphereRadius, _qset.options.sphereScale)
		}

		_questions = _shuffle(_questions)

		if (_qset.options.flag3D === false) { appendLabels(_questions) }

		// defer such that it is run once the labels are ready in the DOM
		if (_qset.options.flag3D === false) {
			setTimeout(function () {
				_arrangeList()
				return Array.from(document.getElementsByClassName('term')).map((node) =>
					node.classList.add('ease'))
			}, 0)

		} else {
			setTimeout(function () {
				_arrangeList()
				return Array.from(document.getElementsByClassName('term')).map((node) =>
					node.classList.add('ease'))
			}, oneSecond / 2)
		}

		// attach document listeners
		document.addEventListener('touchend', _mouseUpEvent, false)
		document.addEventListener('mouseup', _mouseUpEvent, false)
		document.addEventListener('MSPointerUp', _mouseUpEvent, false)

		document.addEventListener('touchmove', _mouseMoveEvent, false)
		document.addEventListener('MSPointerMove', _mouseMoveEvent, false)
		document.addEventListener('mousemove', _mouseMoveEvent, false)

		// once everything is drawn, set the height of the player
		return Materia.Engine.setHeight()
	}

	function appendLabels() {
		let termList = document.getElementById('termlist')

		for (let question of Array.from(_questions)) {
			if (!question.id) { question.id = 'q' + Math.random() }

			question.mask = 'm' + Math.random()

			const term = document.createElement('div')
			term.id = 'term_' + question.mask
			term.className = 'term'
			term.innerHTML = question.questions[0].text

			term.addEventListener('mousedown', _mouseDownEvent, false)
			term.addEventListener('touchstart', _mouseDownEvent, false)
			term.addEventListener('MSPointerDown', _mouseDownEvent, false)

			let fontSize = (15 - (question.questions[0].text.length / 10))
			if (fontSize < 12) { fontSize = 12 }
			term.style.fontSize = fontSize + 'px'

			// Some legacy qsets store these as strings, which we certainly don't want
			question.options.endPointX = parseInt(question.options.endPointX)
			question.options.endPointY = parseInt(question.options.endPointY)
			question.options.labelBoxX = parseInt(question.options.labelBoxX)
			question.options.labelBoxY = parseInt(question.options.labelBoxY)

			termList.appendChild(term)
		}
	}

	function appendLabels3D() {
		let termList = document.getElementById('termlist')
		let sphereScale = _qset.options.sphereScale

		_questions.forEach((question) => {
			if (!question.id) { question.id = 'q' + Math.random() }

			question.mask = 'm' + Math.random()

			const term = document.createElement('div')
			term.id = 'term_' + question.mask
			term.className = 'term'
			term.innerHTML = question.questions[0].text

			term.addEventListener('mousedown', _mouseDownEvent, false)
			term.addEventListener('touchstart', _mouseDownEvent, false)
			term.addEventListener('MSPointerDown', _mouseDownEvent, false)

			let fontSize = (15 - (question.questions[0].text.length / 10))
			if (fontSize < 12) { fontSize = 12 }
			term.style.fontSize = fontSize + 'px'

			// Some legacy qsets store these as strings, which we certainly don't want
			question.options.endPointX = parseInt(question.options.endPointX)
			question.options.endPointY = parseInt(question.options.endPointY)
			question.options.labelBoxX = parseInt(question.options.labelBoxX)
			question.options.labelBoxY = parseInt(question.options.labelBoxY)

			import('./core3D.js')
				.then((module) => {
					return module.createVertex(
						term.id,
						'dot_' + term.id,
						question.options.vertex.faceIndex,
						question.options.vertex.point,
						question.options.vertex.uv
					)

				}).then((vertex) => {
					renderedSpheresGroup.add(vertex.sphere())

				}).then(() => {
					renderedSpheresGroup.children.forEach((element) => {
						element.scale.set(sphereScale.x, sphereScale.y, sphereScale.z)
					})

				}).catch((err) => {
					console.log(err)
				})

			termList.appendChild(term)
		})

	}

	// https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle
	var _shuffle = function (array) {
		let counter = array.length

		while (counter > 0) {
			const index = Math.floor(Math.random() * counter)
			counter--

			const temp = array[counter]
			array[counter] = array[index]
			array[index] = temp
		}

		return array
	}

	var _drawPreviewBoard = function () {
		// the locations of the dots on the map
		const dots = [[160, 80], [200, 110], [130, 120]]
		const lines = [[166, 78, 100, 20], [200, 110, 150, 90], [130, 120, 80, 140]]

		// the initial board has all dots
		let context = _g('previewimg0').getContext('2d')

		dots.forEach((dot) => {
			_drawDot(dot[0], dot[1], 6, 2, context, 'rgba(0,0,0,' + _anchorOpacityValue + ')',
				'rgba(255,255,255,' + _anchorOpacityValue + ')')
		})

		// each subsequent board has its dot and line
		for (let i = 0; i <= 2; i++) {
			context = _g('previewimg' + (i + 1)).getContext('2d')
			_drawStrokedLine(lines[i][0] - _offsetX, lines[i][1] - _offsetY,
				lines[i][2] - _offsetX, lines[i][3] - _offsetY, '#fff', '#000', context)

			_drawDot(dots[i][0], dots[i][1], 6, 2, context, 'rgba(255,255,255,' + _anchorOpacityValue + ')',
				'rgba(0,0,0,' + _anchorOpacityValue + ')')
		}

		return _g('gotitbtn').addEventListener('click', _hideAlert)
	}

	// arrange the items in the left list
	var _arrangeList = function () {
		let offScreen  // the maximum height the terms can pass before we overflow onto another page

		// const MAX_HEIGHT = 490  // = (48 * 10) + 10 // (heightOfTerm * #OfTerms) + 10
		const MAX_HEIGHT = spacing + (termWidth * numberOfTerms)

		// if we went too far back, go to the 0th page
		if (_curPage < 0) { _curPage = 0 }

		let y
		_qset.options.flag3D === false
			? y = spacing + (-440 * _curPage) : _curPage == 0
				? y = spacing + (termWidth * numberOfTermsRemove)
				: y = spacing + ((-440 + (termWidth * numberOfTermsRemove)) * _curPage)

		// state sentinels
		let maxY = 0
		let found = false

		// move all the terms to their correct location
		for (let question of _questions) {
			const node = _g('term_' + question.mask)

			// if it's not placed, put it in the left list
			if (!node.getAttribute('data-placed')) {
				node.style.transform =
					(node.style.msTransform =
						(node.style.webkitTransform = 'translate(50px,' + y + 'px)'))

				// too high up, put it on the previous page
				if (y < 10) {
					node.style.zIndex = -1
					offScreen = true

					// too far down, put it on the next page
				} else if (y >= MAX_HEIGHT) {
					node.style.zIndex = -1

					// just right goldilocks
				} else {
					node.style.zIndex = ''
					node.style.opacity = 1
					found = true

					question.mask === _questions[_questions.length - 1].mask
						? document.getElementById('nextbtn').style.pointerEvents = 'none'
						: document.getElementById('nextbtn').style.pointerEvents = 'auto'
				}

				listOfTerms.push(node)
				maxY = y
				y += node.getBoundingClientRect().height + spacing  // increments of 48px
			}
		}

		// hide buttons if they should not be visible
		_g('prevbtn').style.opacity = offScreen ? 1 : 0
		_g('nextbtn').style.opacity = maxY >= MAX_HEIGHT ? 1 : 0
		_g('prevbtn').style['z-index'] = offScreen ? '9999' : '0'

		// these covers provide padding to the terms during tweening
		maxY >= MAX_HEIGHT
			? _g('blockbottom').classList.remove('hide')
			: _g('blockbottom').classList.add('hide')

		offScreen
			? _g('blocktop').classList.remove('hide')
			: _g('blocktop').classList.add('hide')

		// if nothing was found, the page is empty and we should go back automagically
		if (!found && (_curPage > 0)) {
			_curPage--
			return _arrangeList()

		} else {
			// no more terms, we're done!
			if (!found && (_curPage === 0)) {
				_g('donearrow').style.opacity = '1'
				_g('checkBtn').classList.add('done')
				return _isPuzzleComplete = true
				// jk, reset the state

			} else {
				_g('donearrow').style.opacity = '0'
				_g('checkBtn').classList.remove('done')
				return _isPuzzleComplete = false
			}
		}
	}

	// when a term is mouse downed
	var _mouseDownEvent = function (e) {
		if ((e == null)) { e = window.event }

		// show ghost term (but keep the opacity at 0)
		_g('ghost').style.display = 'inline-block'

		// set current dragging term
		_curterm = e.target
		_curterm.style.zIndex = ++_zIndex

		// disable easing while it drags
		e.target.className = 'term moving'

		// if it's been placed, remove that association
		if (_curterm.getAttribute('data-placed')) {
			_labelTextsByQuestionId[_curterm.getAttribute('data-placed')] = ''
			_curterm.setAttribute('data-placed', '')
		}

		if (document.getElementById('my3DCanvas')) {
			document.getElementById('my3DCanvas').style.pointerEvents = 'none'
		}


		// don't scroll the page on an iPad
		e.preventDefault()
		if (e.stopPropagation != null) { return e.stopPropagation() }
	}

	// when the widget area has a cursor or finger move
	var _mouseMoveEvent = function (e) {

		// if no term is being dragged, we don't care
		let fadeOutCurMatch, question
		if ((_curterm == null)) { return }

		if ((e == null)) { e = window.event }

		// if it's not a mouse move, it's probably touch
		if (!e.clientX) {
			e.clientX = e.changedTouches[0].clientX
			e.clientY = e.changedTouches[0].clientY
		}

		let x = (e.clientX - 30)
		if (x < 40) { x = 40 } // left window limit
		if (x > 670) { x = 670 }	// right window limit

		let y = (e.clientY - 90)
		if (y < 0) { y = 0 } // top limit
		if (y > 500) { y = 500 } // bottom limit

		// move the current term
		_curterm.style.transform =
			(_curterm.style.msTransform =
				(_curterm.style.webkitTransform = 'translate(' + x + 'px,' + y + 'px)'))

		const _lastID = (_curMatch != null) && (_curMatch.id != null) ? _curMatch.id : 0

		// check proximity against available drop points
		let minDist = Number.MAX_VALUE
		_curMatch = null

		// first look for ones that aren't filled, then try replacing ones with a label filling them
		// this is a two-pass process
		let onlyUnfilled = true
		for (let pass = 1; pass <= 2; pass++) {
			// Using a forEach breaks the code.
			for (question of Array.from(_questions)) {
				// distance formula
				const dist = Math.sqrt(Math.pow((e.clientX - question.options.endPointX - _offsetX - 195), 2)
					+ Math.pow((e.clientY - question.options.endPointY - _offsetY - 50), 2))

				// we want the closest one
				if ((dist < minDist) && (dist < 200)) {
					if (onlyUnfilled && _labelTextsByQuestionId[question.id]) { continue }

					minDist = dist
					_curMatch = question
				}
			}
			// if we didn't find anything, accept filled ones
			if (!_curMatch) { onlyUnfilled = false }
		}

		if ((_curMatch != null) && (_curMatch.id != null) && (_curMatch.id !== _lastID)) {
			const ripple = _g('ripple')
			ripple.style.transform =
				(ripple.style.msTransform =
					(ripple.style.webkitTransform = 'translate(' + (_curMatch.options.endPointX + _offsetX) + 'px,' + (_curMatch.options.endPointY + _offsetY) + 'px)'))
			ripple.className = 'play'
		}

		if (_curMatch && (_labelTextsByQuestionId[_curMatch.id] !== '')) { fadeOutCurMatch = true }

		for (question of Array.from(_questions)) {
			const node = _g('term_' + question.mask)

			if (fadeOutCurMatch && (node.getAttribute('data-placed') === _curMatch.id)) {
				_g('term_' + question.mask).style.opacity = 0.5
				_curterm.style.zIndex = ++_zIndex

			} else {
				_g('term_' + question.mask).style.opacity = 1
			}
		}

		_drawBoard(e.clientX, e.clientY)

		// don't scroll on iPad
		e.preventDefault()
		if (e.stopPropagation != null) { return e.stopPropagation() }
	}

	// when we let go of a term
	var _mouseUpEvent = function (e) {

		let matched  // we don't care if nothing is selected
		if ((_curterm == null)) { return }

		// apply easing (for snap back animation)
		_curterm.className = 'term ease'

		// if it's matched with a dot
		if (_curMatch != null) {
			// used after reset
			matched = true

			// if the label spot already has something there
			if (_labelTextsByQuestionId[_curMatch.id]) {
				// find the node and put it back in the terms list
				for (let question of Array.from(_questions)) {
					const node = _g('term_' + question.mask)

					if (node.getAttribute('data-placed') === _curMatch.id) {
						node.className = 'term ease'
						node.setAttribute('data-placed', '')
						break
					}
				}
			}

			// if it has been placed before, reset the place it was placed
			if (_curterm.getAttribute('data-placed')) {
				_labelTextsByQuestionId[_curterm.getAttribute('data-placed')] = ''
			}
			// set the label key value array to this current answer
			_labelTextsByQuestionId[_curMatch.id] = _curterm.innerHTML

			// move the label to where it belongs
			_curterm.style.webkitTransform =
				(_curterm.style.msTransform =
					(_curterm.style.transform =
						'translate(' + (_curMatch.options.labelBoxX + 210 + _offsetX) + 'px,' + ((_curMatch.options.labelBoxY + _offsetY) - 20) + 'px)'))

			_curterm.className += ' placed'

			// identify this element with the question it is answering
			_curterm.setAttribute('data-placed', _curMatch.id)

		} else {
			// not matched with a dot, reset the place it was placed
			_labelTextsByQuestionId[_curterm.getAttribute('data-placed')] = ''
			_curterm.setAttribute('data-placed', '')
		}

		// rearrange the terms list
		_arrangeList()

		// reset
		_curterm = null
		_curMatch = null

		// render changes
		_drawBoard()

		// keep ghost on screen
		matched ? _g('ghost').style.opacity = 0.5 : _g('ghost').style.opacity = 0

		_g('ghost').className = 'term hide'

		if (document.getElementById('my3DCanvas') != null) {
			document.getElementById('my3DCanvas').style.pointerEvents = 'auto'
		}

		// prevent iPad/etc from scrolling
		return e.preventDefault()
	}

	// draw a dot on the specified canvas context
	var _drawDot = function (x, y, radius, border, context, borderColor, fillColor) {
		context.beginPath()
		context.arc(x, y, radius, 2 * Math.PI, false)
		context.fillStyle = fillColor
		context.fill()
		context.lineWidth = border
		context.strokeStyle = borderColor
		if (_qset.options.flag3D === false) { return context.stroke() }
	}

	// draw a stroked line (one big line, one smaller on top)
	var _drawStrokedLine = function (x1, y1, x2, y2, color1, color2, context) {
		if (context == null) { context = _context }

		Labeling.Draw.drawLine(context, x1 + _offsetX, y1 + _offsetY, x2 + _offsetX, y2 + _offsetY, 6, color1)
		return Labeling.Draw.drawLine(context, x1 + _offsetX, y1 + _offsetY, x2 + _offsetX, y2 + _offsetY, 2, color2)
	}

	// render the canvas frame
	var _drawBoard = function (mouseX, mouseY) {
		// clear any lines outside of the canvas
		if (mouseX == null) { mouseX = 0 }
		if (mouseY == null) { mouseY = 0 }
		_context.clearRect(0, 0, 1000, 1000)

		// draw the asset image; only use shadow if its not graph paper
		if (_qset.options.backgroundTheme !== 'themeGraphPaper') {
			_context.shadowOffsetX = 0
			_context.shadowOffsetY = 0
			_context.shadowBlur = 10
			_context.shadowColor = 'rgba(0, 0, 0, 0.5)'
		}

		if (_qset.options.flag3D === false) {
			_context.drawImage(_img, _qset.options.imageX, _qset.options.imageY,
				(_img.width * _qset.options.imageScale), (_img.height * _qset.options.imageScale)
			)
		}

		_context.shadowColor = ''
		_context.shadowBlur = 0

		// reference the ghost object, and make it invisible
		const ghost = _g('ghost')
		ghost.style.opacity = 0

		return (() => {
			const result = []

			let flag3D = _qset.options.flag3D

			_questions.forEach((question) => {
				var dotBackground, dotBorder

				// if the question has an answer placed, draw a solid line connecting it
				// but only if the label is not replacing one that already exists
				if (_labelTextsByQuestionId[question.id] && !(_curMatch && _labelTextsByQuestionId[_curMatch.id] && (question.id === _curMatch.id))) {
					dotBorder = 'rgba(255,255,255,' + _anchorOpacityValue + ')'
					dotBackground = 'rgba(0,0,0,' + _anchorOpacityValue + ')'

					if (flag3D === false) {
						_drawStrokedLine(question.options.endPointX, question.options.endPointY,
							question.options.labelBoxX, question.options.labelBoxY, '#fff', '#000')

					} else {
						// Same functionality as the function reRenderLines() in the creator
						let vector = uvMapToMousePoint(question.options.vertex.point)
						_drawStrokedLine(vector.x, vector.y, question.options.labelBoxX,
							question.options.labelBoxY, '#fff', '#000')
					}

				} else {
					dotBorder = 'rgba(0,0,0,' + _anchorOpacityValue + ')'
					dotBackground = 'rgba(255,255,255,' + _anchorOpacityValue + ')'
				}

				// if the question has a match dragged near it, draw a ghost line
				if ((_curMatch != null) && (_curMatch.id === question.id)) {
					dotBorder = 'rgba(255,255,255,' + _anchorOpacityValue + ')'
					dotBackground = 'rgba(0,0,0,' + _anchorOpacityValue + ')'

					if (flag3D === false) {
						_drawStrokedLine(question.options.endPointX, question.options.endPointY,
							question.options.labelBoxX, question.options.labelBoxY,
							'rgba(255,255,255,0.2)', 'rgba(0,0,0,0.3)'
						)

					} else {
						// Same functionality as the function reRenderLines() in the creator
						let vector = uvMapToMousePoint(question.options.vertex.point)
						_drawStrokedLine(vector.x, vector.y, question.options.labelBoxX,
							question.options.labelBoxY, 'rgba(255,255,255,0.2)', 'rgba(0,0,0,0.3)'
						)
					}

					// move the ghost label and make it semi-transparent
					ghost.style.webkitTransform =
						(ghost.style.msTransform =
							(ghost.style.transform = 'translate(' + (question.options.labelBoxX + 210 + _offsetX) + 'px,' + (question.options.labelBoxY + _offsetY + 35) + 'px)'))
					ghost.style.opacity = 0.5
					_g('ghost').className = 'term'

					if (flag3D === false) {
						_drawStrokedLine(question.options.endPointX, question.options.endPointY,
							mouseX - _offsetX - 240, mouseY - _offsetY - 80,
							'rgba(255,255,255,1)', 'rgba(0,0,0,1)'
						)

					} else {
						let vector = uvMapToMousePoint(question.options.vertex.point)
						_drawStrokedLine(vector.x, vector.y, mouseX - _offsetX - 240,
							mouseY - _offsetY - 80, 'rgba(255,255,255,1)', 'rgba(0,0,0,1)'
						)
					}
				}

				if (_qset.options.flag3D === false) {
					result.push(_drawDot(question.options.endPointX + _offsetX,
						question.options.endPointY + _offsetY, 9, 3, _context, dotBorder, dotBackground
					))
				}
			})

			return result
		})()
	}

	var _drawAnimation = function () {
		// clear any lines outside of the canvas
		_context.clearRect(0, 0, 1000, 1000)

		// reference the ghost object, and make it invisible
		const ghost = _g('ghost')
		ghost.style.opacity = 0

		return (() => {

			_questions.forEach((question) => {

				// if the question has an answer placed, draw a solid line connecting it
				// but only if the label is not replacing one that already exists
				if (_labelTextsByQuestionId[question.id] && !(_curMatch && _labelTextsByQuestionId[_curMatch.id] && (question.id === _curMatch.id))) {

					// Same functionality as the function reRenderLines() in the creator
					let vector = uvMapToMousePoint(question.options.vertex.point)
					_drawStrokedLine(vector.x, vector.y, question.options.labelBoxX,
						question.options.labelBoxY, '#fff', '#000')
				}

				// if the question has a match dragged near it, draw a ghost line
				if ((_curMatch != null) && (_curMatch.id === question.id)) {

					// // Same functionality as the function reRenderLines() in the creator
					// let vector = uvMapToMousePoint(question.options.vertex.point)
					// _drawStrokedLine(vector.x, vector.y, question.options.labelBoxX,
					// 	question.options.labelBoxY, 'rgba(255,255,255,0.2)', 'rgba(0,0,0,0.3)'
					// )

					// move the ghost label and make it semi-transparent
					ghost.style.webkitTransform =
						(ghost.style.msTransform =
							(ghost.style.transform = 'translate(' + (question.options.labelBoxX + 210 + _offsetX) + 'px,' + (question.options.labelBoxY + _offsetY + 35) + 'px)'))
					ghost.style.opacity = 0.5
					_g('ghost').className = 'term'
				}

			})

		})()
	}


	// show the "are you done?" warning dialog
	const _showAlert = function () {
		_g('alertbox').classList.add('show')
		_g('backgroundcover').classList.add('show')
		_g('confirmbtn').removeEventListener('click', _submitButtonConfirm)
		return _g('confirmbtn').addEventListener('click', _submitButtonConfirm)
	}

	var _submitButtonConfirm = function () {
		_hideAlert()
		return _submitAnswersToMateria()
	}

	// hide the warning dialog
	var _hideAlert = function () {
		_g('alertbox').classList.remove('show')
		_g('backgroundcover').classList.remove('show')
		return _g('previewbox').classList.remove('show')
	}

	// submit questions to Materia. Ask first if they aren't done$
	var _submitAnswers = function () {
		if (!_isPuzzleComplete) { return _showAlert() }
		else { return _submitAnswersToMateria() }
	}

	// submit every question and the placed answer to Materia for scoring
	var _submitAnswersToMateria = function () {
		for (let question of Array.from(_questions)) {
			Materia.Score.submitQuestionForScoring(question.id, _labelTextsByQuestionId[question.id])
		}
		return Materia.Engine.end()
	}

	function chooseVer(assetUrl, sphereRadius, sphereScale) {
		btnSpacer()
		console.log(sphereScale)
		let btnToggleLines = createBtn('toggleLines', 'Toggle Lines', 'btnDiv')
		btnToggleLines.addEventListener('click', hidingLinesBtnEffect, true)
		btnToggleLines.style.top = 55 + 'px'

		let btnCenterCamera = createBtn('centerCamera', 'Center Camera', 'btnDiv')
		btnCenterCamera.style.top = 110 + 'px'

		import('./core3D.js')
			.then((module) => {
				module.newSphereRadius(sphereRadius)
				module.getOBJRender(assetUrl)
				uvMapToMousePoint = module.uvMapToMousePoint
				renderedSpheresGroup = module.renderedSpheresGroup
				highlightSpheresGroup = module.highlightSpheresGroup
				return module

			}).then((module) => {
				btnCenterCamera.addEventListener('click', module.centeringCameraEvent)
				appendLabels3D(_questions)
				startMouseDownFire()

			}).catch((err) => {
				console.log(err)
			})

		let imageCanvas = document.getElementById('image')
		imageCanvas.style.pointerEvents = 'none'
		imageCanvas.style.zIndex = 2

		let blockTop = document.getElementById('blocktop')
		blockTop.style.top = (numberOfTermsRemove * termWidth + spacing) + 'px'
		blockTop.style.height = termWidth + 'px'

		let prevBtn = document.getElementById('prevbtn')
		prevBtn.style.top = (parseInt(blockTop.style.top.replace('px', '')) + 6) + 'px'
	}

	function startMouseDownFire() {
		// _drawBoard()
		// drawAnimation()
		_drawAnimation
		mouseDownFireIntervals = setInterval(_drawAnimation, 4) // 4 ms is the fastest setInterval can trigger.
	}

	function btnSpacer() {
		let btnDiv = document.createElement('div')
		btnDiv.id = 'btnDiv'
		btnDiv.style.zIndex = 1
		btnDiv.style.top = '50px'
		btnDiv.style.width = '195px'
		btnDiv.style.height = '105px'
		btnDiv.style.display = 'inline'
		btnDiv.style.background = 'url(assets/checker.png)'
		document.body.appendChild(btnDiv)
	}

	function createBtn(btnID, btnValue, location) {
		let btn = document.createElement('button')
		btn.id = btnID
		btn.type = 'button'
		btn.innerHTML = btnValue
		btn.className = 'verBtn'
		btn.style.left = '22px'
		btn.style.width = '162px'

		let controlNodeList = document.getElementById(location)
		controlNodeList.insertBefore(btn, controlNodeList.firstChild)

		return btn
	}

	function hidingLinesBtnEffect() {
		let element = document.getElementById('image')
		let btn = document.getElementById('toggleLines')

		if (element.style.zIndex == 2) {
			btn.classList.toggle('orange')
			element.style.display = 'none'
			element.style.zIndex = -1

		} else {
			btn.classList.toggle('orange')
			element.style.display = 'inline'
			element.style.zIndex = 2
		}
	}

	//public
	return {
		manualResize: true,
		start
	}
})()