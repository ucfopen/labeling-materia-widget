/* See the file "LICENSE.txt" for the full license governing this code. */
package
{
	import flash.display.MovieClip;
	import flash.events.Event;
	import flash.events.KeyboardEvent;
	import flash.events.MouseEvent;
	import flash.filters.BitmapFilter;
	import flash.filters.BitmapFilterQuality;
	import flash.filters.DropShadowFilter;
	import flash.geom.Rectangle;
	import flash.text.TextField;
	import flash.text.TextFieldAutoSize;
	import flash.text.TextFormat;
	import flash.ui.Keyboard;
	/**
	* This is the base class for a symbol in a swf that has:
	* labelBox MovieClip,
	*	labelBox has a child MovieClip named labelbox which is the actual labelBox graphics.
	*	This is done to make scaling easier.
	* endPoint MovieClip
	*/
	public class LabelingLabelBaseClass extends MovieClip
	{
		public static const EVENT_MOUSE_OVER_LABEL:String = "EVENT_MOUSE_OVER_LABEL";
		public static const EVENT_MOUSE_OUT_LABEL:String = "EVENT_MOUSE_OUT_LABEL";
		public static const EVENT_LABEL_MOVED:String = "EVENT_LABEL_MOVED";
		public static const EVENT_LABEL_CLICK:String = "EVENT_LABEL_CLICK";
		public static const EVENT_LABEL_DOUBLE_CLICK:String = "EVENT_LABEL_DOUBLE_CLICK";
		public static const EVENT_START_DRAG:String = "EVENT_START_DRAG";
		public static const EVENT_END_DRAG:String = "EVENT_END_DRAG";
		public static const EVENT_CLOSE_BUTTON_CLICK:String = "EVENT_CLOSE_BUTTON_CLICK";
		public static const EVENT_SPLIT_BUTTON_CLICK:String = "EVENT_SPLIT_BUTTON_CLICK";
		protected static const HORIZONTAL_LINE_PADDING:Number = 30;
		protected static const VERTICAL_LINE_PADDING:Number = 30;
		protected static const LABEL_OUTER_PADDING_HORIZONTAL_X2:Number = 10;
		protected static const LABEL_OUTER_PADDING_VERTICAL_X2:Number = 10;
		protected static const AMOUNT_NOT_SET:Number = -1;
		protected const DEADZONE_DISTANCE:Number = 30.0;
		protected var theStageWidth:Number = AMOUNT_NOT_SET;
		protected var theStageHeight:Number = AMOUNT_NOT_SET;
		protected var theStageX:Number = 0;
		protected var theStageY:Number = 0;
		protected var _labelX:Number;
		protected var _labelY:Number;
		// set this to true if we are using it in the creator
		// it will be false if we are using it in game
		public var usingInCreator:Boolean = false;
		public var creatorEndPoint:Object;
		// from the FLA:
		public var labelBox:MovieClip;
		public var deleteButton:MovieClip;
		public var splitButton:MovieClip;
		protected var _deadzoneComparePointX:Number;
		protected var _deadzoneComparePointY:Number;
		protected var _isMovedPastDeadzone:Boolean = true;
		protected var _labelText:TextField;
		protected var _resizeText:Boolean = false; // if true, text will be resize to fit the label
		protected var _minFontSize:Number = 10;
		protected var _maxFontSize:Number = 20;
		protected var _drawEndpointAndLine:Boolean = true;
		protected var _fullText:String = "";
		protected var _lineDrawingClip:MovieClip;
		protected var _allowDraggingEndpoint:Boolean = true;
		protected var _isDeleteButtonShowing:Boolean = true;
		protected var _isSplitButtonShowing:Boolean = true;
		protected var _isItAClick:Boolean = false;
		protected var _currentDraggingClip:MovieClip;
		protected var _isLabelDragging:Boolean = false; // if we are currently dragging the label
		protected var _isDraggingEndpoint:Boolean = false;
		protected var _labelTextFormat:TextFormat;
		protected var _curFont:String = null;
		protected var _useStraightLines:Boolean = false;
		public function getTextField():TextField
		{
			return _labelText;
		}
		public function get fullText():String
		{
			return _fullText;
		}
		public function set allowDraggingEndpoint(allowIt:Boolean):void
		{
			if(allowIt && !_allowDraggingEndpoint)
			{
				_lineDrawingClip.buttonMode = true;
				_lineDrawingClip.addEventListener(MouseEvent.MOUSE_DOWN, startDragLineDrawing, false, 0, true);
			}
			else if( _allowDraggingEndpoint && ! allowIt)
			{
				_lineDrawingClip.buttonMode = false;
				_lineDrawingClip.removeEventListener(MouseEvent.MOUSE_DOWN, startDragLineDrawing);
			}
			_allowDraggingEndpoint == allowIt;
		}
		public function LabelingLabelBaseClass():void
		{
			_lineDrawingClip = new MovieClip();
			_lineDrawingClip.mouseEnabled = false;
			this.addChild(_lineDrawingClip);
			setChildIndex(_lineDrawingClip, 0);
			labelBox.addEventListener(MouseEvent.MOUSE_DOWN, mouseDownLabel, false, 0, true);
			addEventListener(Event.ADDED_TO_STAGE, initMouseUpListener, false, 0, true);
			deleteButton.addEventListener(MouseEvent.MOUSE_OVER, mouseIsOver, false, 0, true);
			deleteButton.addEventListener(MouseEvent.MOUSE_OUT, mouseIsOut, false, 0, true);
			splitButton.addEventListener(MouseEvent.MOUSE_OVER, mouseIsOver, false, 0, true);
			splitButton.addEventListener(MouseEvent.MOUSE_OUT, mouseIsOut, false, 0, true);
			labelBox.addEventListener(MouseEvent.MOUSE_OVER, mouseIsOver, false, 0, true);
			labelBox.addEventListener(MouseEvent.MOUSE_OUT, mouseIsOut, false, 0, true);
			labelBox.doubleClickEnabled = true;
			labelBox.addEventListener(MouseEvent.DOUBLE_CLICK, doubleClick, false, 0, true);
			_lineDrawingClip.buttonMode = true;
			_lineDrawingClip.addEventListener(MouseEvent.MOUSE_DOWN, startDragLineDrawing, false, 0, true);
			this.addEventListener(MouseEvent.MOUSE_UP, stopDraggingCurClip, false, 0, true);
			this.addEventListener(Event.ENTER_FRAME, enteredFrame, false, 0, true);
			labelBox.mouseChildren = false;
			labelBox.buttonMode = true;
			var dropShadowFilter:BitmapFilter = myDropShadowFilter();
			this.filters = [dropShadowFilter];
			deleteButton.addEventListener(MouseEvent.CLICK, deleteButtonClick, false, 0, true);
			splitButton.addEventListener(MouseEvent.CLICK, splitButtonClick, false, 0, true);
			hideDeleteButton(false);
			hideSplitButton(false);
		}
		protected function deleteButtonClick(e:Event):void
		{
			dispatchEvent(new Event(EVENT_CLOSE_BUTTON_CLICK));
		}
		protected function splitButtonClick(e:Event):void
		{
			dispatchEvent(new Event(EVENT_SPLIT_BUTTON_CLICK));
		}
		public function get isDeleteButtonShowing():Boolean
		{
			return _isDeleteButtonShowing;
		}
		public function get isSplitButtonShowing():Boolean
		{
			return _isSplitButtonShowing;
		}
		public function showDeleteButton(animate:Boolean = true):void
		{
			if(_isDeleteButtonShowing == true)
			{
				return;
			}
			_isDeleteButtonShowing = true;
			positionDeleteButton();
			if(animate)
			{
				deleteButton.gotoAndPlay("showAnimate");
			}
			else
			{
				deleteButton.gotoAndPlay("showing");
			}
		}
		public function showSplitButton(animate:Boolean = true):void
		{
			if(_isDeleteButtonShowing == true)
			{
				return;
			}
			_isSplitButtonShowing = true;
			positionSplitButton();
			if(animate)
			{
				splitButton.gotoAndPlay("showAnimate");
			}
			else
			{
				splitButton.gotoAndPlay("showing");
			}
		}
		protected function positionDeleteButton():void
		{
			deleteButton.x = labelBox.x + labelBox.width;
			deleteButton.y = labelBox.y;
		}
		protected function positionSplitButton():void
		{
			splitButton.x = labelBox.x + labelBox.width - splitButton.width;
			splitButton.y = labelBox.y;
		}
		public function hideDeleteButton(animate:Boolean = true):void
		{
			if(_isDeleteButtonShowing == false)
			{
				return; // already hidden
			}
			_isDeleteButtonShowing = false;
			if(animate)
			{
				deleteButton.gotoAndPlay("hideAnimate");
			}
			else
			{
				deleteButton.gotoAndPlay("hidden");
			}
		}
		public function hideSplitButton(animate:Boolean = true):void
		{
			if(_isSplitButtonShowing == false)
			{
				return;
			}
			_isSplitButtonShowing = false;
			if(animate)
			{
				splitButton.gotoAndPlay("hideAnimate");
			}
			else
			{
				splitButton.gotoAndPlay("hidden");
			}
		}
		protected function initMouseUpListener(e:Event = null):void
		{
			removeEventListener(Event.ADDED_TO_STAGE, initMouseUpListener);
			stage.addEventListener(MouseEvent.MOUSE_UP, mouseUpLabel, false, 0, true);
		}
		public function hasDraggedPastDeadZone():Boolean
		{
			return _isMovedPastDeadzone;
		}
		// called on mouse down on a label -> they will be dragging it
		protected function startDeadzoneCheck():void
		{
			if(_isMovedPastDeadzone)
			{
				_deadzoneComparePointX = labelBox.x;
				_deadzoneComparePointY = labelBox.y;
				_isMovedPastDeadzone = false;
			}
		}
		// called on when the label is moving
		protected function checkDeadzone():void
		{
			if(! _isMovedPastDeadzone)
			{
				if(distance(_deadzoneComparePointX,_deadzoneComparePointY, labelBox.x, labelBox.y)
					> DEADZONE_DISTANCE)
				{
					_isMovedPastDeadzone = true;
				}
			}
		}
		protected function distance(x1:Number, y1:Number, x2:Number, y2:Number):Number
		{
			var xDist:Number = x1 - x2;
			var yDist:Number = y1 - y2;
			return Math.sqrt(xDist*xDist + yDist*yDist);
		}
		protected function doubleClick(e:Event):void
		{
			dispatchEvent(new Event(EVENT_LABEL_DOUBLE_CLICK, true));
		}
		protected function mouseIsOver(e:Event):void
		{
			dispatchEvent(new Event(EVENT_MOUSE_OVER_LABEL, true));
		}
		protected function mouseIsOut(e:Event):void
		{
			dispatchEvent(new Event(EVENT_MOUSE_OUT_LABEL, true));
		}
		public function mouseDownLabel(e:MouseEvent = null):void
		{
			_isItAClick = true; // will be set to false if it is actually a drag
			if(e == null)
			{
				_currentDraggingClip = labelBox;
			}
			else
			{
				// NOTE: i think it will always be the label,
				// so i dont think this else is needed
				_currentDraggingClip = e.target as MovieClip;
			}
			_isLabelDragging = true;
			//labelBox.labelBox.gotoAndStop("dragging");
			shadowTweenOut();
			dragAClip(_currentDraggingClip);
			startDeadzoneCheck();
		}
		protected function shadowTweenOut():void
		{
			var dropShadowFilter:BitmapFilter = myDropShadowFilterAlternate();
			this.filters = [dropShadowFilter];
		}
		protected function shadowTweenBack():void
		{
			var dropShadowFilter:BitmapFilter = myDropShadowFilter();
			this.filters = [dropShadowFilter];
		}
		public function setStageArea(w:Number,h:Number,tx:Number = 0, ty:Number = 0):void
		{
			theStageWidth = w;
			theStageHeight = h;
			theStageX = tx;
			theStageY = ty;
		}
		public function get isMultilineLabelText():Boolean
		{
			return _labelText.wordWrap == true;
		}
		public function dragAClip(c:MovieClip):void
		{
			if(theStageWidth == AMOUNT_NOT_SET)
			{
				theStageWidth = stage.stageWidth;
			}
			if(theStageHeight == AMOUNT_NOT_SET)
			{
				theStageHeight =  stage.stageHeight;
			}
			var r:Rectangle =
				new Rectangle(theStageX,theStageY,theStageWidth - c.width, theStageHeight-c.height);
			c.startDrag(false, r);
			if( c == labelBox)
			{
				c.alpha = 0.8;
			}
			dispatchEvent(new Event(EVENT_START_DRAG, true));
		}
		protected function mouseUpLabel(e:MouseEvent):void
		{
			if(_isLabelDragging)
			{
				if(_isItAClick)
				{
					dispatchEvent(new Event(EVENT_LABEL_CLICK, true));
					_isItAClick = false;
				}
				shadowTweenBack();
				labelBox.stopDrag();
				labelBox.alpha = 1.0;
				_isLabelDragging = false;
			}
			if( _isDraggingEndpoint)
			{
				stopDraggingEndpoint();
			}
		}
		protected function startDragLineDrawing(e:MouseEvent):void
		{
			// were not going to actually drag anything
			// just start pointing the line's end dot at the mouse location
			_isDraggingEndpoint = true;
			stage.addEventListener( MouseEvent.MOUSE_MOVE, moveEndpoint, false, 0, true);
		}
		protected function moveEndpoint(e:MouseEvent):void
		{
			_endPointX = mouseX;
			_endPointY = mouseY;
			if(_endPointX < 0)
			{
				_endPointX = theStageX;
			}
			else if(_endPointX > theStageX + theStageWidth)
			{
				_endPointX = theStageX + theStageWidth;
			}
			if(_endPointY < 0)
			{
				_endPointY = theStageY;
			}
			else if(_endPointY > theStageY + theStageHeight)
			{
				_endPointY = theStageY + theStageHeight;
			}
			redrawLine();
		}
		protected function stopDraggingEndpoint():void
		{
			_isDraggingEndpoint = false;
			if(stage != null)
			{
				stage.removeEventListener( MouseEvent.MOUSE_MOVE, moveEndpoint);
			}
		}
		protected function startDragging(e:MouseEvent):void
		{
			_currentDraggingClip = e.target as MovieClip;
			dragAClip(_currentDraggingClip);
		}
		protected function stopDraggingCurClip(e:MouseEvent):void
		{
			if(_currentDraggingClip != null)
			{
				_currentDraggingClip.stopDrag();
				dispatchEvent(new Event(EVENT_END_DRAG, true));
				_currentDraggingClip = null;
			}
		}
		protected function enteredFrame(e:Event):void
		{
			if(stage == null)
			{
				return;
			}
			if(_labelX != labelBox.x || _labelY != labelBox.y )
			{
				_isItAClick = false;
				dispatchEvent(new Event(EVENT_LABEL_MOVED, true));
				redrawLine();
				checkDeadzone();
				positionDeleteButton();
				positionSplitButton();
			}
			_labelX = labelBox.x;
			_labelY = labelBox.y;
		}
		public function setLabelLocation(lx:Number, ly:Number):void
		{
			// set the label location without doing all the dragging related stuff
			 labelBox.x = lx;
			 labelBox.y = ly;
			 // so we don't get a label moved event
			 _labelX = lx;
			 _labelY = ly;
		}
		public function setLabelText(s:String, font:String = null, fontSize:Number = 12, autoSizeIt:Boolean = false):void
		{
			if( _labelText == null)
			{
				_labelText = new TextField();
				_labelText.selectable = false;
				labelBox.addChild(_labelText);
			}
			_curFont = font;
			_labelTextFormat = new TextFormat(font, 30);
			_labelText.setTextFormat(_labelTextFormat);
			_fullText = s;
			_labelText.text = s;
			_labelText.wordWrap = false;
			_labelText.autoSize = TextFieldAutoSize.LEFT;
			if(autoSizeIt)
			{
				setLabelSize(_labelText.width + LABEL_OUTER_PADDING_HORIZONTAL_X2,
						 	_labelText.height + LABEL_OUTER_PADDING_VERTICAL_X2);
			}
			checkForResizeText();
		}
		// similar to setStaticWidthMultilineLabelText but wordWrap is false, and we check for resize text
		public function setStaticWidthSingleLineLabelText(s:String, staticWidth:Number, font:String = null, fontSize:Number = 12):void
		{
			if( _labelText == null)
			{
				_labelText = new TextField();
				_labelText.selectable = false;
				labelBox.addChild(_labelText);
			}
			_curFont = font;
			_fullText = s;
			_labelText.text = s;
			_labelText.wordWrap = false;
			//_labelText.width = staticWidth -LABEL_OUTER_PADDING_HORIZONTAL_X2 ;
			_labelTextFormat = new TextFormat(font, fontSize);
			_labelText.setTextFormat(_labelTextFormat);
			_labelText.autoSize = TextFieldAutoSize.LEFT;
			//setLabelSize(_labelText.width + LABEL_OUTER_PADDING_HORIZONTAL_X2,
						// 	_labelText.height + LABEL_OUTER_PADDING_VERTICAL_X2);
			labelBox.labelBox.width = staticWidth;
			labelBox.labelBox.height = _labelText.height + LABEL_OUTER_PADDING_VERTICAL_X2;
			_resizeText = true;
			checkForResizeText();
		}
		protected function checkForResizeText():void
		{
			if(_resizeText)
			{
				const PADDING:Number = 10.0;
				var bounds:Rectangle = new Rectangle(0, 0,
													 labelBox.labelBox.width - PADDING,
													 labelBox.labelBox.height - PADDING);
				makeTextFit(_labelText, bounds,
							_maxFontSize,
							_minFontSize);
				// center the text on the label?
				centerTheLabelText();
			}
		}
		// this is used for the labels in the label bank
		// it lets the text go multiline and expands the label height to fit it all
		public function setStaticWidthMultilineLabelText(s:String, staticWidth:Number, font:String = null, fontSize:Number = 12):void
		{
			if( _labelText == null)
			{
				_labelText = new TextField();
				_labelText.selectable = false;
				labelBox.addChild(_labelText);
			}
			_fullText = s;
			_labelText.text = s;
			_labelText.wordWrap = true;
			_labelText.width = staticWidth -LABEL_OUTER_PADDING_HORIZONTAL_X2 ;
			_labelTextFormat = new TextFormat(font, fontSize);
			_labelText.setTextFormat(_labelTextFormat);
			_labelText.autoSize = TextFieldAutoSize.LEFT;
			_curFont = font;
			labelBox.labelBox.width =staticWidth;
			labelBox.labelBox.height = _labelText.height + LABEL_OUTER_PADDING_VERTICAL_X2;
			centerTheLabelText();
		}
		public function set hasEndPoint(hasEnd:Boolean):void
		{
			if(!hasEnd)
			{
				stopDraggingEndpoint();
			}
			_drawEndpointAndLine = hasEnd;
			redrawLine();
		}
		public function setLabelSize(w:Number, h:Number):void
		{
			labelBox.labelBox.width = w;
			labelBox.labelBox.height = h;
			checkForResizeText();
			centerTheLabelText();
		}
		protected function centerTheLabelText():void
		{
			_labelText.x =(labelBox.labelBox.width - _labelText.textWidth)/2.0;
			_labelText.y =(labelBox.labelBox.height - _labelText.textHeight)/2.0;
			redrawLine();
		}
		public function doResizeFontToFit(enable:Boolean, minFontSize:Number, maxFontSize:Number):void
		{
			_resizeText = enable; // resize the text
			_minFontSize = minFontSize;
			_maxFontSize = maxFontSize;
		}
		public function get labelText():String
		{
			return _labelText.text;
		}
		public function get endPointX():Number
		{
			return _endPointX;
		}
		public function get endPointY():Number
		{
			return _endPointY;
		}
		protected var _endPointX:Number = 0.0, _endPointY:Number = 0.0;
		// set a clip to draw the a line to
		// set clip to null to resume the previous line style
		public function drawLineTo(clip:MovieClip):void
		{
			_drawEndpointAndLine = true;
//			_alternateEndPointClip = clip;
			if(clip == null)
			{
				_drawEndpointAndLine = false;
			}
			else
			{
				// HACK CODE: the -15 was to fix it in the engine
				// not sure exactly whats going on
				_endPointX = clip.x + clip.width/2.0 - 15;
				_endPointY = clip.y + clip.height/2.0 - 15;
			}
			redrawLine();
		}
		public function useStraightLines(useIt:Boolean):void
		{
			var doRedraw:Boolean = false;
			if(useIt != _useStraightLines)
			{
				doRedraw = true;
			}
			_useStraightLines = useIt;
			if(doRedraw)
			{
				redrawLine();
			}
		}
		// draws the line between the labelBox and the endPoint
		public function redrawLine():void
		{
			if(usingInCreator) return;
			_lineDrawingClip.graphics.clear();
			var drawEndPoint:Boolean = false;
			const ENDPOINT_DOT_RADIUS:Number = 5.0;
			const START_POINT_DOT_RARIUS:Number = 3.0;
			if(_drawEndpointAndLine)
			{
				var startingBoxCenterX:Number =  labelBox.x + (labelBox.width/2);
				var startingBoxCenterY:Number = labelBox.y + (labelBox.height/2);
				if(_useStraightLines)
				{
					// the white circles
					_lineDrawingClip.graphics.lineStyle(0,0,0);
					_lineDrawingClip.graphics.beginFill(0xffffff);
					// draw a circle to make the endpoint look right
					_lineDrawingClip.graphics.drawCircle(_endPointX,
														_endPointY,
														ENDPOINT_DOT_RADIUS + 2.0);
					_lineDrawingClip.graphics.beginFill(0xffffff);
					_lineDrawingClip.graphics.drawCircle(mouseX,
														mouseY,
														START_POINT_DOT_RARIUS +2.0);
					// the white line
					_lineDrawingClip.graphics.lineStyle(6,0xffffff,1.0,true);
					_lineDrawingClip.graphics.moveTo(_endPointX,_endPointY);
					//_lineDrawingClip.graphics.lineTo(startingBoxCenterX,startingBoxCenterY);
					_lineDrawingClip.graphics.lineTo(mouseX,mouseY);
					// the black line
					_lineDrawingClip.graphics.lineStyle(2,0x333333,1.0,true);
					_lineDrawingClip.graphics.moveTo(_endPointX,_endPointY);
					//_lineDrawingClip.graphics.lineTo(startingBoxCenterX,startingBoxCenterY);
					_lineDrawingClip.graphics.lineTo(mouseX,mouseY);
					// start point
					_lineDrawingClip.graphics.lineStyle(0,0,0);
					_lineDrawingClip.graphics.beginFill(0x333333);
					// draw a circle to make the endpoint look right
					_lineDrawingClip.graphics.drawCircle(_endPointX,
														_endPointY,
														ENDPOINT_DOT_RADIUS);
					_lineDrawingClip.graphics.beginFill(0x333333);
					_lineDrawingClip.graphics.drawCircle(mouseX,
														mouseY,
														START_POINT_DOT_RARIUS);
				}
				else
				{
					var horizontalStraightLineLength:Number = labelBox.width/2 + HORIZONTAL_LINE_PADDING;
					var verticalStraightLineLength:Number = labelBox.height/2 + VERTICAL_LINE_PADDING;
					// difference should be based on box edges, not cetner point
					var xDifference:Number = _endPointX - startingBoxCenterX;
					var yDifference:Number = _endPointY - startingBoxCenterY;
					var curDrawPositionX:Number = startingBoxCenterX;
					var curDrawPositionY:Number = startingBoxCenterY;
					var linePoints:Array = [];
					linePoints.push(curDrawPositionX,curDrawPositionY);
					if(Math.abs(xDifference) > Math.abs(yDifference))
					{
						if(xDifference > 0)
						{
							curDrawPositionX += horizontalStraightLineLength;
						}
						else
						{
							curDrawPositionX -= horizontalStraightLineLength;
						}
					}
					else
					{
						if(yDifference > 0)
						{
							curDrawPositionY += verticalStraightLineLength;
						}
						else
						{
							curDrawPositionY -= verticalStraightLineLength;
						}
					}
					linePoints.push(curDrawPositionX,curDrawPositionY);
					linePoints.push(_endPointX,_endPointY);
					_lineDrawingClip.graphics.lineStyle(0,0,0);
					_lineDrawingClip.graphics.beginFill(0xffffff);
					// draw a circle to make the endpoint look right
					_lineDrawingClip.graphics.drawCircle(linePoints[linePoints.length-2],
														linePoints[linePoints.length-1],
														ENDPOINT_DOT_RADIUS + 2.0);
					_lineDrawingClip.graphics.endFill();
					_lineDrawingClip.graphics.moveTo(linePoints[0], linePoints[1]);
					_lineDrawingClip.graphics.lineStyle(6,0xffffff,1.0,true);
					var i:int
					for(i = 2; i< linePoints.length; i+=2)
					{
						_lineDrawingClip.graphics.lineTo(linePoints[i], linePoints[i+1]);
					}
					_lineDrawingClip.graphics.lineStyle(2,0x333333,1.0,true);
					_lineDrawingClip.graphics.moveTo(linePoints[0], linePoints[1]);
					for(i = 2; i< linePoints.length; i+=2)
					{
						_lineDrawingClip.graphics.lineTo(linePoints[i], linePoints[i+1]);
					}
					_lineDrawingClip.graphics.lineStyle(0,0,0);
					_lineDrawingClip.graphics.beginFill(0x333333);
					// draw a circle to make the endpoint look right
					_lineDrawingClip.graphics.drawCircle(linePoints[linePoints.length-2],
														linePoints[linePoints.length-1],
														ENDPOINT_DOT_RADIUS);
				}
			}
		}
		public function setEndpointLocation(theX:Number, theY:Number):void
		{
			_endPointX = theX;
			_endPointY = theY;
		}
		public function setLabelBoxLocation(theX:Number, theY:Number):void
		{
			labelBox.x = theX;
			labelBox.y = theY;
		}
		private function myDropShadowFilter():BitmapFilter
		{
            var color:Number = 0x000000;
            var angle:Number = 90; //45
            var alpha:Number = 0.8;
            var blurX:Number = 8;
            var blurY:Number = 8;
            var distance:Number = 8;
            var strength:Number = 0.65;
            var inner:Boolean = false;
            var knockout:Boolean = false;
            var quality:Number = BitmapFilterQuality.HIGH;
            return new DropShadowFilter(distance, angle, color, alpha,
                                        blurX, blurY, strength, quality,
                                        inner, knockout);
        }
		private function myDropShadowFilterAlternate():BitmapFilter
		{
			var color:Number = 0x000000;
            var angle:Number = 90; //45
            var alpha:Number = 0.8;
            var blurX:Number = 10;
            var blurY:Number = 10;
            var distance:Number = 16;
            var strength:Number = 0.34;
            var inner:Boolean = false;
            var knockout:Boolean = false;
            var quality:Number = BitmapFilterQuality.HIGH;
            return new DropShadowFilter(distance, angle, color, alpha,
                                        blurX, blurY, strength, quality,
                                        inner, knockout);
		}
		// NOTE: this is currently for a single line of text
		protected function makeTextFit(theTextField:TextField, area:Rectangle,
										maxFontSize:Number, minFontSize:Number):void
		{
			var curSize:Number = maxFontSize;
			var format:TextFormat = new TextFormat(_curFont);
			format.size = curSize;
			theTextField.setTextFormat( format);
			theTextField.defaultTextFormat = format;
			theTextField.autoSize = TextFieldAutoSize.LEFT;
			const SHRINK_AMOUNT:Number = 0.5;
			while (theTextField.textWidth  > area.width || theTextField.textHeight > area.height)
			{
				if(curSize - SHRINK_AMOUNT < minFontSize) break;
				var newFormat:TextFormat = new TextFormat(_curFont);
				curSize -= SHRINK_AMOUNT;
				newFormat.size = curSize;
				theTextField.setTextFormat(newFormat);
				theTextField.defaultTextFormat = newFormat;
			}
			if(theTextField.textWidth  > area.width)
			{
				shrinkTextToWidth(theTextField, area.width);
				theTextField.text = theTextField.text.substring(0,theTextField.text.length-3);
				theTextField.appendText('...');
			}
		}
		protected function shrinkTextToWidth(theTextField:TextField, areaWidth:Number):void
		{
			var textString:String = theTextField.text;
			theTextField.text = '';
			for(var i:int =0; i< textString.length; i++)
			{
				var s:String = theTextField.text;
				theTextField.appendText(textString.charAt(i));
				if(theTextField.textWidth  > areaWidth)
				{
					theTextField.text = s;
					break;
				}
			}
		}
	}
}