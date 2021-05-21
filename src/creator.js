/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
Namespace('Labeling').Creator = (function () {
	// variables for local use
	let _context, _img, _offsetY, _qset;
	let _title = (_qset = null);

	// canvas, context, and image to render to it
	let _canvas = (_context = (_img = null));

	// offset for legacy support
	const _offsetX = (_offsetY = 0);

	//Anchor tag opacity class modifier
	let _anchorOpacity = ' ';

	// store image dimensions in case the user cancels the resize
	let _lastImgDimensions = {};

	// track if the user is "getting started" or well on their way
	let _gettingStarted = false;

	const _defaultLabel = '[label title]';

	const initNewWidget = function (widget, baseUrl) {
		// $('#image').hide();
		document.querySelector('#image').hidden = true;

		// $('#chooseimage').show();
		document.querySelector('#chooseimage').hidden = false;

		// prompt the user for a widget title
		// $('#titlebox').addClass('show');
		document.querySelector('#titlebox').classList.add("show");

		// $('#backgroundcover').addClass('show');
		document.querySelector('#backgroundcover').classList.add("show");

		// hide the canvas so we can interact with it
		// $('#canvas').css('display', 'none');
		document.querySelector('#canvas').style.display = 'none';

		_gettingStarted = true;

		// make a scaffold qset object
		_qset = {};
		_qset.options = {};
		_qset.options.backgroundTheme = 'themeCorkBoard';
		_qset.options.backgroundColor = 2565927;

		creatorVer();

		// set up the creator, shared between new and existing
		return _setupCreator();
	};

	function creatorVer() {
		document.querySelector('#ver2D').addEventListener('click', event => {
			document.querySelector('#pickVer').remove();
		});
	}

	var _setupCreator = function () {
		// set background and header title
		_setBackground();

		// get canvas context
		_canvas = document.getElementById('canvas');
		_context = _canvas.getContext('2d');

		_img = new Image();

		// set up event handlers
		// $('.graph').click(function () {
		// 	_qset.options.backgroundTheme = 'themeGraphPaper';
		// 	return _setBackground();
		// });
		document.querySelector('.graph').addEventListener('click', event => {
			_qset.options.backgroundTheme = 'themeGraphPaper';
			return _setBackground();
		});


		// $('.cork').click(function () {
		// 	_qset.options.backgroundTheme = 'themeCorkBoard';
		// 	return _setBackground();
		// });
		document.querySelector('.cork').addEventListener('click', event => {
			_qset.options.backgroundTheme = 'themeCorkBoard';
			return _setBackground();
		});

		// Color Wheel
		$('.backgroundtile.color').click(function () {
			if (_qset.options.backgroundTheme !== 'themeSolidColor') {
				_qset.options.backgroundTheme = 'themeSolidColor';
				_setBackground();
			}

			$("#colorpicker").spectrum("show");
			$('.sp-coloropt').click(function (e) {
				if ((e != null) && (e.target != null)) {
					let color = e.target.style.backgroundColor.split(',');
					color = parseInt(parseInt(color[0].substring(4)).toString(16) + parseInt(color[1]).toString(16) + parseInt(color[2]).toString(16), 16);
					_qset.options.backgroundTheme = 'themeSolidColor';
					_qset.options.backgroundColor = color;
					return _setBackground();
				}
			});
			return false;
		});

		// document.querySelector('.backgroundtile.color').addEventListener('click', event => {
		// 	if (_qset.options.backgroundTheme !== 'themeSolidColor') {
		// 		_qset.options.backgroundTheme = 'themeSolidColor';
		// 		_setBackground();
		// 	}
		// });

		$('#opaque-toggle').change(function () {
			_anchorOpacity = ' ';
			const dots = $(document).find('.dot');
			let i = 0;
			return (() => {
				const result = [];
				while (i < dots.length) {
					$(dots[i]).removeClass('frosted transparent');
					result.push(i++);
				}
				return result;
			})();
		});

		$('#frosted-toggle').change(function () {
			_anchorOpacity = ' frosted';
			const dots = $(document).find('.dot');
			let i = 0;
			return (() => {
				const result = [];
				while (i < dots.length) {
					$(dots[i]).removeClass('transparent').addClass('frosted');
					result.push(i++);
				}
				return result;
			})();
		});

		$('#transparent-toggle').change(function () {
			_anchorOpacity = ' transparent';
			const dots = $(document).find('.dot');
			let i = 0;
			return (() => {
				const result = [];
				while (i < dots.length) {
					$(dots[i]).removeClass('frosted').addClass('transparent');
					result.push(i++);
				}
				return result;
			})();
		});

		$('#btnMoveResize').click(function () {
			_resizeMode(true);

			if (_qset.options.backgroundTheme === "themeGraphPaper") {
				$('.resizable').addClass('dark');
			} else {
				$('.resizable').removeClass('dark');
			}

			return _lastImgDimensions = {
				width: $('#imagewrapper').width(),
				height: $('#imagewrapper').height(),
				left: $('#imagewrapper').position().left,
				top: $('#imagewrapper').position().top
			};
		});

		$('#btnMoveResizeCancel').click(function () {
			_resizeMode(false);
			$('#imagewrapper').width(_lastImgDimensions.width);
			$('#imagewrapper').height(_lastImgDimensions.height);
			$('#imagewrapper').css('left', _lastImgDimensions.left + 'px');
			return $('#imagewrapper').css('top', _lastImgDimensions.top + 'px');
		});

		$('#btnMoveResizeDone').click(() => _resizeMode(false));

		$('#btnChooseImage').click(() => Materia.CreatorCore.showMediaImporter());

		$('#btn-enter-title').click(function () {
			Materia.CreatorCore.showMediaImporter();
			return true;
		});

		$('#title').click(_showMiniTitleEditor);
		$('#header .link').click(_showMiniTitleEditor);

		window.setTitle = function (title) {
			if (title == null) { title = document.getElementById("title").textContent; }
			title = title.replace(/</g, '').replace(/>/g, '');
			$('#titlebox').removeClass('show');
			$('#titlechanger').removeClass('show');
			$('#backgroundcover').removeClass('show');
			return $('#title').html((title || 'My labeling widget'));
		};

		document.getElementById('canvas').addEventListener('click', _addTerm, false);

		// update background
		return $('#colorpicker').spectrum({
			move: _updateColorFromSelector,
			cancelText: '',
			chooseText: 'Done'
		});
	};


	var _showMiniTitleEditor = function () {
		$('#titlechanger').addClass('show');
		$('#backgroundcover').addClass('show');
		return $('#titletxt').val($('#title').html()).focus();
	};

	const _makeDraggable = () => // drag all sides of the image for resizing
		$('#imagewrapper').draggable({
			drag(event, ui) {
				return ui;
			}
		}).resizable({
			aspectRatio: true,
			handles: 'n, e, s, w, ne, nw, se, sw'
		});

	// sets resize mode on and off, and sets UI accordingly
	var _resizeMode = function (isOn) {
		$('#terms').css('display', isOn ? 'none' : 'block');
		$('#canvas').css('display', isOn ? 'none' : 'block');
		$('#maincontrols').css('display', isOn ? 'none' : 'block');
		$('#resizecontrols').css('display', isOn ? 'block' : 'none');
		if (isOn) {
			$('#imagewrapper').addClass('resizable');
			$('#controlcover').addClass('show');
			$('#btnMoveResizeCancel').css('display', 'block');
			return $('#btnMoveResizeDone').css('display', 'block');
		} else {
			$('#imagewrapper').removeClass('resizable');
			$('#controlcover').removeClass('show');
			$('#btnMoveResizeCancel').css('display', 'none');
			return $('#btnMoveResizeDone').css('display', 'none');
		}
	};

	// set background color, called from the spectrum events
	var _updateColorFromSelector = function (color) {
		_qset.options.backgroundTheme = 'themeSolidColor';
		_qset.options.backgroundColor = parseInt(color.toHex(), 16);
		return _setBackground();
	};

	// sets background from the qset
	var _setBackground = function () {
		let background;
		$('.backgroundtile').removeClass('show');

		// set background
		switch (_qset.options.backgroundTheme) {
			case 'themeGraphPaper':
				background = 'url(assets/labeling-graph-bg.png)';
				$('.graph').addClass('show');
				break;
			case 'themeCorkBoard':
				background = 'url(assets/labeling-cork-bg.jpg)';
				$('.cork').addClass('show');
				break;
			default:
				// convert to hex and zero pad the background, which is stored as an integer
				background = '#' + ('000000' + _qset.options.backgroundColor.toString(16)).substr(-6);
				$('.color').addClass('show');
				$('#curcolor').css('background', background);
		}

		return $('#board').css('background', background);
	};

	const initExistingWidget = function (title, widget, qset, version, baseUrl) {
		_qset = qset;

		_setupCreator();
		_makeDraggable();

		// get asset url from Materia API (baseUrl and all)
		const url = Materia.CreatorCore.getMediaUrl(_qset.options.image.id);

		// render the image inside of the imagewrapper
		$('#image').attr('src', url);
		$('#image').attr('data-imgid', _qset.options.image.id);

		// load the image resource via JavaScript for rendering later
		_img.src = url;
		_img.onload = function () {
			$('#imagewrapper').css('height', (_img.height * _qset.options.imageScale));
			return $('#imagewrapper').css('width', (_img.width * _qset.options.imageScale));
		};

		// set the resizable image wrapper to the size and pos from qset
		$('#imagewrapper').css('left', (_qset.options.imageX));
		$('#imagewrapper').css('top', (_qset.options.imageY));

		// set the title from the qset
		$('#title').html(title);
		_title = title;

		// add qset terms to the list
		// legacy support:
		let questions = qset.items;
		if ((questions[0] != null) && questions[0].items) {
			questions = questions[0].items;
		}
		return Array.from(questions).map((item) =>
			_makeTerm(item.options.endPointX, item.options.endPointY, item.questions[0].text, item.options.labelBoxX, item.options.labelBoxY, item.id));
	};

	// draw lines on the board
	const _drawBoard = function () {
		// clear the board area
		_context.clearRect(0, 0, 1000, 1000);

		// iterate every term and read dot attributes
		return (() => {
			const result = [];
			for (let term of Array.from($('.term'))) {
				const dotx = parseInt(term.getAttribute('data-x'));
				const doty = parseInt(term.getAttribute('data-y'));

				// read label position from css
				const labelx = parseInt(term.style.left);
				const labely = parseInt(term.style.top);

				// drawLine handles the curves and such; run it for inner
				// and outer stroke
				Labeling.Draw.drawLine(_context, dotx + _offsetX, doty + _offsetY, labelx + _offsetX, labely + _offsetY, 6, '#fff');
				result.push(Labeling.Draw.drawLine(_context, dotx + _offsetX, doty + _offsetY, labelx + _offsetX, labely + _offsetY, 2, '#000'));
			}
			return result;
		})();
	};

	// Add term to the list, called by the click event
	var _addTerm = function (e) {
		// draw a dot on the canvas for the question location
		_makeTerm(e.pageX - document.getElementById('frame').offsetLeft - document.getElementById('board').offsetLeft, e.pageY - 50);

		$('#help_adding').css('display', 'none');
		$('#boardcover').css('display', 'none');
		$('#imagewrapper').removeClass('faded');

		return setTimeout(function () {
			$('#help_moving').css('display', 'block');
			$('#btnMoveResize').css('display', 'block');
			return $('#btnChooseImage').css('display', 'block');
		}
			, 400);
	};

	// generate a term div
	var _makeTerm = function (x, y, text, labelX = null, labelY = null, id) {
		if (text == null) { text = _defaultLabel; }
		if (id == null) { id = ''; }
		const dotx = x;
		const doty = y;

		const term = document.createElement('div');
		term.id = 'term_' + Math.random(); // fake id for linking with dot
		term.innerHTML = "<div class='label-input' contenteditable='true' onkeypress='return (this.innerText.length <= 400)'>" + text + "</div><div class='delete'></div>";
		term.className = 'term';

		// if we're generating a generic one, decide on a position
		if ((labelX === null) || (labelY === null)) {
			y = (y - 200);

			const labelAreaHalfWidth = 500 / 2;
			const labelAreaHalfHeight = 500 / 2;

			const labelStartOffsetX = 70;
			const labelStartOffsetY = 50;

			if (x < labelAreaHalfWidth) {
				x -= labelStartOffsetX;

				if (y < labelAreaHalfHeight) {
					y += labelStartOffsetY;
				} else {
					y -= labelStartOffsetY;
				}
			} else {
				x += labelStartOffsetX;

				if (y < labelAreaHalfHeight) {
					y += labelStartOffsetY;
				} else {
					y -= labelStartOffsetY;
				}
			}

			if (y < 150) {
				y = 150;
			}

			if (x > 450) {
				x = 450;
			}
			if (x < 100) {
				x = 100;
			}
		} else {
			x = labelX;
			y = labelY;
		}

		// set term location and dot attribute
		term.style.left = x + 'px';
		term.style.top = y + 'px';
		term.setAttribute('data-x', dotx);
		term.setAttribute('data-y', doty);
		term.setAttribute('data-id', id);

		$('#terms').append(term);

		const dot = document.createElement('div');
		dot.className = 'dot' + _anchorOpacity;
		dot.style.left = dotx + 'px';
		dot.style.top = doty + 'px';
		dot.setAttribute('data-termid', term.id);
		dot.id = "dot_" + term.id;

		$('#terms').append(dot);

		// edit on click
		term.onclick = function () {
			term.childNodes[0].focus();
			document.execCommand('selectAll', false, null);
			if (term.childNodes[0].innerHTML === _defaultLabel) { return term.childNodes[0].innerHTML = ''; }
		};

		// resize text on change
		term.childNodes[0].onkeyup = _termKeyUp;
		// set initial font size
		term.childNodes[0].onkeyup({ target: term.childNodes[0] });

		// enter key press should stop editing
		term.childNodes[0].onkeydown = _termKeyDown;

		// check if blank when the text is cleared
		term.childNodes[0].onblur = _termBlurred;

		// clean up pasted content to make sure we don't accidentally get invisible html garbage
		term.childNodes[0].onpaste = _termPaste;

		// make delete button remove it from the list
		term.childNodes[1].onclick = function () {
			term.parentElement.removeChild(term);
			dot.parentElement.removeChild(dot);
			return _drawBoard();
		};

		// make the term movable
		$(term).draggable({
			drag(event, ui) {
				if (ui.position.left < 20) {
					ui.position.left = 20;
				}
				if (ui.position.left > 460) {
					ui.position.left = 460;
				}
				if (ui.position.top > 505) {
					ui.position.top = 505;
				}
				if (ui.position.top < 20) {
					ui.position.top = 20;
				}
				_drawBoard();
				return ui;
			}
		});
		// make the dot movable
		$(dot).draggable({
			drag: _dotDragged
		});
		setTimeout(function () {
			term.childNodes[0].focus();
			return document.execCommand('selectAll', false, null);
		}
			, 10);

		return _drawBoard();
	};

	// When typing on a term, resize the font accordingly
	var _termKeyUp = function (e) {
		if ((e == null)) { e = window.event; }
		let fontSize = (16 - (e.target.innerHTML.length / 10));
		if (fontSize < 12) { fontSize = 12; }
		return e.target.style.fontSize = fontSize + 'px';
	};

	// When typing on a term, resize the font accordingly
	var _termKeyDown = function (e) {
		if ((e == null)) { e = window.event; }

		// Enter key
		// block adding line returns
		// consider Enter Key to mean 'done editing'
		if (e.keyCode === 13) {
			// Defocus
			e.target.blur();
			window.getSelection().removeAllRanges(); // needed for contenteditable blur
			// put event in a sleeper hold
			if (e.stopPropagation != null) { e.stopPropagation(); }
			e.preventDefault();
			return false;
		}

		// Escape
		if (e.keyCode === 27) {
			if (e.target.innerHTML.length < 1) {
				$(document.getElementById('dot_' + e.target.parentElement.id)).remove();
				$(e.target.parentElement).remove();
				return _drawBoard();
			} else {
				// Defocus
				e.target.blur();
				return window.getSelection().removeAllRanges(); // needed for contenteditable blur
			}
		}
	};

	// If the term is blank, put dummy text in it
	var _termBlurred = function (e) {
		if ((e == null)) { e = window.event; }
		if (e.target.innerHTML === '') { return e.target.innerHTML = _defaultLabel; }
	};

	// Convert anything on the clipboard into pure text before pasting it into the label
	var _termPaste = function (e) {
		let clipboardArgument, clipboardData, input;
		if (e == null) { e = window.event; }
		e.preventDefault();

		// contenteditable divs will insert an empty <br/> when they're empty, this checks for and removes them on paste
		if (e.target.tagName === 'BR') {
			input = e.target.parentElement;
			e.target.parentElement.removeChild(e.target);
		} else {
			input = e.target;
		}
		// ie11 has different arguments for clipboardData and makes it a method of window instead of the paste event
		if (e.clipboardData != null) {
			({
				clipboardData
			} = e);
			clipboardArgument = 'text/plain';
		} else {
			({
				clipboardData
			} = window);
			clipboardArgument = 'Text';
		}

		const sel = window.getSelection();
		if (sel.rangeCount) {
			const range = sel.getRangeAt(0);
			range.deleteContents();

			const newText = clipboardData.getData(clipboardArgument);
			const newNode = document.createTextNode(newText);
			range.insertNode(newNode);

			const newRange = document.createRange();
			newRange.selectNodeContents(newNode);
			newRange.collapse(false);

			sel.removeAllRanges();
			return sel.addRange(newRange);
		}
	};


	// a dot has been dragged, lock it in place if its within 10px
	var _dotDragged = function (event, ui) {
		let minDist = 9999;
		let minDistEle = null;

		for (let dot of Array.from($('.dot'))) {
			if (dot === event.target) {
				continue;
			}
			const dist = Math.sqrt(Math.pow((ui.position.left - $(dot).position().left), 2) + Math.pow((ui.position.top - $(dot).position().top), 2));
			if (dist < minDist) {
				minDist = dist;
				minDistEle = dot;
			}
		}

		// less than 10px away, put the dot where the other one is
		// this is how duplicates are supported
		if (minDist < 10) {
			ui.position.left = $(minDistEle).position().left;
			ui.position.top = $(minDistEle).position().top;
		}

		const term = document.getElementById(event.target.getAttribute('data-termid'));
		term.setAttribute('data-x', ui.position.left);
		term.setAttribute('data-y', ui.position.top);

		return _drawBoard();
	};

	// called from Materia creator page
	const onSaveClicked = function (mode) {
		if (mode == null) { mode = 'save'; }
		if (!_buildSaveData()) {
			return Materia.CreatorCore.cancelSave('Widget needs a title and at least one term.');
		}
		return Materia.CreatorCore.save(_title, _qset);
	};

	const onSaveComplete = (title, widget, qset, version) => true;

	// called from Materia creator page
	// place the questions in an arbitrary location to be moved
	const onQuestionImportComplete = items => Array.from(items).map((item) =>
		_makeTerm(150, 300, item.questions[0].text, null, null, item.id));

	// generate the qset
	var _buildSaveData = function () {
		if ((_qset == null)) { _qset = {}; }
		if ((_qset.options == null)) { _qset.options = {}; }

		const words = [];

		_qset.assets = [];
		_qset.rand = false;
		_qset.name = '';
		_title = $('#title').html();
		let _okToSave = (_title != null) && (_title !== '') ? true : false;

		const items = [];

		const dots = $('.term');
		for (let dot of Array.from(dots)) {
			const item = {};
			const label = dot.childNodes[0].innerHTML;

			const answer = {
				text: label,
				value: 100,
				id: ''
			};
			item.answers = [answer];
			item.assets = [];
			const question =
				{ text: label };
			item.questions = [question];
			item.type = 'QA';
			item.id = dot.getAttribute('data-id') || '';
			item.options = {
				labelBoxX: parseInt(dot.style.left.replace('px', '')),
				labelBoxY: parseInt(dot.style.top.replace('px', '')),
				endPointX: parseInt(dot.getAttribute('data-x')),
				endPointY: parseInt(dot.getAttribute('data-y'))
			};

			items.push(item);
		}

		_qset.items = items;

		if (items.length < 1) {
			_okToSave = false;
		}

		let _anchorOpacityValue = 1.0;
		if (_anchorOpacity.indexOf('frosted') > -1) {
			_anchorOpacityValue = 0.5;
		} else if (_anchorOpacity.indexOf('transparent') > -1) {
			_anchorOpacityValue = 0.0;
		}

		_qset.options = {
			backgroundTheme: _qset.options.backgroundTheme,
			backgroundColor: _qset.options.backgroundColor,
			imageScale: $('#imagewrapper').width() / _img.width,
			image: {
				id: $('#image').attr('data-imgid'),
				materiaType: "asset"
			},
			imageX: $('#imagewrapper').position().left,
			imageY: $('#imagewrapper').position().top,
			opacity: _anchorOpacityValue
		};

		_qset.version = "2";

		return _okToSave;
	};

	// called from Materia creator page
	// loads and sets appropriate data for loading image
	const onMediaImportComplete = function (media) {
		$('#canvas').css('display', 'block');

		const url = Materia.CreatorCore.getMediaUrl(media[0].id);
		$('#chooseimage').hide();
		$('#image').show();
		$('#image').attr('src', url);
		$('#image').attr('data-imgid', media[0].id);
		_img.src = url;
		_img.onload = function () {
			let height, width;
			const iw = $('#imagewrapper');
			if (_img.width > _img.height) {
				width = 570;
				iw.css('width', width);
				iw.css('height', ((_img.height * iw.width()) / _img.width));
			} else {
				height = 470;
				iw.css('height', height);
				iw.css('width', ((_img.width * iw.height()) / _img.height));
			}

			$('#imagewrapper').css('left', (600 / 2) - (iw.width() / 2));
			return $('#imagewrapper').css('top', (550 / 2) - (iw.height() / 2));
		};



		_makeDraggable();

		return true;
	};

	// Public members
	return {
		initNewWidget,
		initExistingWidget,
		onSaveClicked,
		onMediaImportComplete,
		onQuestionImportComplete,
		onSaveComplete
	};
})();
