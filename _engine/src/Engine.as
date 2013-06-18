/* See the file "LICENSE.txt" for the full license governing this code. */
package
{
	import com.gskinner.motion.GTween;
	import flash.display.BlendMode;
	import flash.display.InteractiveObject;
	import flash.display.MovieClip;
	import flash.display.SimpleButton;
	import flash.display.Sprite;
	import flash.events.Event;
	import flash.events.KeyboardEvent;
	import flash.events.MouseEvent;
	import flash.filters.BitmapFilter;
	import flash.filters.BitmapFilterQuality;
	import flash.filters.BlurFilter;
	import flash.filters.DropShadowFilter;
	import flash.filters.GlowFilter;
	import flash.geom.Point;
	import flash.text.TextField;
	import flash.utils.Dictionary;
	import nm.events.StandardEvent;
	import nm.gameServ.common.Question;
	import nm.gameServ.engines.EngineCore;
	import nm.ui.AlertWindow;
	import nm.ui.TweeningDragDropBankList;
	public class Engine extends EngineCore
	{
		protected static const CURRENT_WIDGET_VERSION:uint = 2;
		protected static const LABEL_FONT:String = "Rockwell";
		protected static const SPEED_OF_TWEENS:Number = 0.6;
		protected static const SPEED_OF_LABEL_BANK_TWEENS:Number = 0.1;
		protected static const NO_ENDPOINT_MATCHED:int = -1;
		protected static const STACKED_LABEL_OFFSET:Number = 6.0;
		protected static const HORIZONTAL_LINE_PADDING:Number = 30;
		protected static const VERTICAL_LINE_PADDING:Number = 30;
		protected static const LABEL_WIDTH:int = 150;
		protected static const LABEL_HEIGHT:int = 30;
		protected static const EXTRA_LABEL_BANK_SPACE:Number = 10.0;
		protected static const MATCH_DISTANCE_FOR_NEW_MATCHES:Number = 100.0;
		protected static const MATCH_DISTANCE_FOR_ALREADY_MATCHED:Number = 68.0;
		protected var _screen:LabelingScreen; //this comes from the SWC
		// parallel arrays of Points for the labels and the endpoints
		protected var _labelBoxLocations:Array      = []; //where the labels go in their correct location
		protected var _labelQuestionIds:Array       = [];
		protected var _labelEndPointClips:Array     = []; //end point graphics, parallel _labels
		protected var _labels:Array                 = []; //array of labels, parallel to _labelEndPointClips
		protected var _labelToEndpointMatches:Array = []; //labels indices to endpoint indeces
		protected var _labelBank:TweeningDragDropBankList;
		// the label box the user is currently dragging
		protected var _curDraggingLabelBoxClip:MovieClip;
		protected var _doneWarningPopup:AlertWindow = null;
		protected var _dupeWarningPopup:AlertWindow = null;
		protected var topHeader:MovieClip;
		protected var _pageUpButton:SimpleButton;
		protected var _pageDownButton:SimpleButton;
		// we dont want to change which endpoint the label is pointing to while tweening it
		// this is a hack fix for a bug that happend while doing that
		protected var HACK_disregardNextEVENT_LABEL_MOVED:Boolean = false;
		protected var _isTweening:Boolean = false;
		protected var _tweeningLabel:LabelingLabel = null;
		protected var _curTween:GTween = null;
		protected var _hasUserClosedShowDoneButtonMessage:Boolean = false;
		protected var _solidColorBackgroundClip:MovieClip;
		protected var _doneButtonHelperMessage:MovieClip;
		//offsets to make the new version of Labeling compatible with older qsets
		protected var _oldVersionXOffset:Number;
		protected var _oldVersionYOffset:Number;
		private var _topEndPoints:Dictionary = new Dictionary(true);
		private var _labelsOnPoint:Dictionary = new Dictionary(true);
		private var _labelTextsByQuestionId:Object = new Object();
		public function Engine():void
		{
			_screen = new LabelingScreen();
			addChild(_screen);
			init();
			super();
		}
		protected function init():void
		{
			_screen.topHeader.doneButton.addEventListener(MouseEvent.CLICK, gameOver, false, 0, true);
			_screen.labelBankPageUp.addEventListener(MouseEvent.CLICK, labelBankPageUp, false, 0, true);
			_screen.labelBankPageDown.addEventListener(MouseEvent.CLICK, labelBankPageDown, false, 0, true);
			// re-parent buttons to keep them in front of stuff
			_pageUpButton   = _screen.labelBankPageUp;
			_pageDownButton = _screen.labelBankPageDown;
			_screen.removeChild(_screen.labelBankPageUp);
			_screen.removeChild(_screen.labelBankPageDown);
			addChild(_pageUpButton);
			addChild(_pageDownButton);
			_pageUpButton.tabEnabled   = false;
			_pageDownButton.tabEnabled = false;
			_screen.labelBankArea.visible           = false;
			_screen.doneButtonHelperMessage.visible = false;
		}
		protected override function startEngine():void
		{
			super.startEngine();
			var qq:* = EngineCore.qSetData;
			_screen.topHeader.titleLabel.text = inst.name;
			_screen.topHeader.titleLabel.selectable = false;
			topHeader = _screen.topHeader;
			_screen.removeChild(topHeader);
			this.addChild(topHeader);
			initLabels();
			getImageAssetSprite(EngineCore.qSetData.assets[0], initLabelImage);
			// set the background behind the image
			switch(EngineCore.qSetData.options["backgroundTheme"])
			{
				case "themeSolidColor":
					showSolidColorTheme( Number(EngineCore.qSetData.options["backgroundColor"]));
					break;
				case "themeGraphPaper":
					showGraphPaperTheme();
					break;
				case "themeCorkBoard":
				default:
					showCorkBoardTheme();
					break;
			}
			alert("Instructions: Label this image.","Drag terms from the terms list to the points on the image.",1);
		}
		protected function initLabels():void
		{
			_labelBank = new TweeningDragDropBankList(this);
			_labelBank.setTweenStyle(SPEED_OF_LABEL_BANK_TWEENS, customTween);
			_labelBank.setArea( _screen.labelBankArea.x, _screen.labelBankArea.y, _screen.labelBankArea.width, _screen.labelBankArea.height);
			_oldVersionXOffset = 195;
			_oldVersionYOffset = 40;
			if(EngineCore.qSetData.options.version && EngineCore.qSetData.options.version >= CURRENT_WIDGET_VERSION)
			{
				_oldVersionXOffset = 0;
				_oldVersionYOffset = 0;
			}
			var orderedQuestions:Array = EngineCore.qSetData.items[0].items;
			var questions:Array = [];
			while (orderedQuestions.length > 0) {
				questions.push(orderedQuestions.splice(Math.round(Math.random() * (orderedQuestions.length - 1)), 1)[0]);
			}
			for(var i:int =0; i< questions.length; i++)
			{
				addLabel(questions[i]);
			}
			for(var key:Object in _topEndPoints)
			{
				_labelsOnPoint[key] = new Array();
				_topEndPoints[key]=makeGhostForEndPoint(LabelEndpoint(key));
			}
		}
		protected function makeGhostForEndPoint(ep:LabelEndpoint):Sprite
		{
			var currentX:Number = ep.x;
			var currentY:Number = ep.y;
			var ghostHolder:Sprite = new Sprite();
			addChild(ghostHolder);
			ghostHolder.x = currentX;
			ghostHolder.y = currentY;
			var ghosts:Array = [];
			for(var i:uint = 0; i<_labelEndPointClips.length; i++)
			{
				if(_labelEndPointClips[i].x == currentX
					&& _labelEndPointClips[i].y == currentY)
				{
					ghosts.push(i);
				}
			}
			var lines:DottedLine = new DottedLine(0,4,3);
			var boxes:DashedBorder = new DashedBorder(0xFFFFFF,1,2,3);
			for(i = 0; i < ghosts.length; i++)
			{
				var l:Point = _labelBoxLocations[ghosts[i]];
				var startingBoxCenterX:Number = (l.x-currentX) + (LABEL_WIDTH/2);
				var startingBoxCenterY:Number = (l.y-currentY) + (LABEL_HEIGHT/2);
				var horizontalStraightLineLength:Number = LABEL_WIDTH/2 + HORIZONTAL_LINE_PADDING;
				var verticalStraightLineLength:Number   = LABEL_HEIGHT/2 + VERTICAL_LINE_PADDING;
				var xDifference:Number = -startingBoxCenterX;
				var yDifference:Number = -startingBoxCenterY;
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
				linePoints.push(0,0);
				lines.moveTo(linePoints[0], linePoints[1]);
				for(var j:int = 2; j< linePoints.length; j+=2)
				{
					lines.lineTo(linePoints[j], linePoints[j+1]);
				}
				lines.moveTo(linePoints[0], linePoints[1]);
				boxes.curvedBox(linePoints[0]-LABEL_WIDTH/2,linePoints[1]-LABEL_HEIGHT/2,LABEL_WIDTH,LABEL_HEIGHT,5);
			}
			var dotMask:Sprite = new Sprite();
			dotMask.graphics.copyFrom(boxes.graphics);
			//following two lines are basically used to erase all the dots beneath the ghost labels
			ghostHolder.blendMode = BlendMode.LAYER;
			dotMask.blendMode = BlendMode.ERASE;
			ghostHolder.addChild(lines);
			ghostHolder.addChild(dotMask);
			ghostHolder.addChild(boxes);
			lines.filters = [new GlowFilter(0xFFFFFF,1,2,2)];
			ghostHolder.alpha = .5;
			ghostHolder.visible = false;
			/*re-add the endpoint so it's on top of all other endpoints in that location
			and so that it appears over the associated ghost labels*/
			addChild(ep);
			return ghostHolder;
		}
		protected function addLabel(q:*):void
		{
			//set the label test to a no-whitespace version of the qset's text
			var text:String = q.questions[0].text.replace(/^([\s|\t|\n]+)?(.*)([\s|\t|\n]+)?$/gm, "$2");
			// ============ MAKE LABEL =========================
			var l:LabelingLabel = new LabelingLabel();
			MovieClip(l.labelBox.getChildAt(0)).gotoAndStop("unfixed");
			l.tabEnabled = l.tabChildren = l.hasEndPoint = l.allowDraggingEndpoint = false;
			// store it in our label info arrays
			_labels.push(l);
			_labelToEndpointMatches.push(NO_ENDPOINT_MATCHED);
			addChild(l);
			HACK_keepStuffInFront();
			showLabelAsInBank(l, text, false);
			// need to call setStageArea on the label
			l.setStageArea(_screen.width, _screen.ImageArea.height, 0, _screen.ImageArea.y);
			// events found in LabelingLabelBaseClass
			l.addEventListener("EVENT_START_DRAG", labelStartDrag, false, 0, true);
			l.addEventListener("EVENT_END_DRAG", labelEndDrag, false, 0, true);
			l.addEventListener("EVENT_LABEL_MOVED", labelMoved, false, 0, true);
			_labelBoxLocations.push(new Point(Number(q.options.labelBoxX)+_oldVersionXOffset, Number(q.options.labelBoxY)+_oldVersionYOffset));
			// ============ MAKE ENDPOINT =========================
			var endPoint:Point = new Point(Number(q.options.endPointX)+_oldVersionXOffset, Number(q.options.endPointY)+_oldVersionYOffset);
			//check to see if there are any more endpoints at this x/y location
			var endPointExists:Boolean = false;
			for each (var ep:MovieClip in _labelEndPointClips)
			{
				if(ep.x == endPoint.x && ep.y == endPoint.y)
				{
					endPointExists = true;
					break;
				}
			}
			var endPointClip:MovieClip = addLabelEndpoint(endPoint);
			_labelEndPointClips.push(endPointClip);
			//since we only want the topmost endpoint in a location to be listening for mouse events
			if(!endPointExists)
			{
				endPointClip.addEventListener(MouseEvent.MOUSE_OVER, ghostLabels,false,0,true);
				endPointClip.addEventListener(MouseEvent.MOUSE_OUT, unGhostLabels,false,0,true);
				//give it a boolean just as a placeholder
				_topEndPoints[endPointClip] = true;
			}
			l.setEndpointLocation(endPointClip.x,endPointClip.y);
			_labelQuestionIds.push(q.id);
			_labelTextsByQuestionId[q.id] = '';
			// this blur filter makes it so text will alpha tween
			l.getTextField().filters = [new BlurFilter(0,0,0)];
		}
		protected function labelStartDrag(e:Event):void
		{
			// if this label was previously tweening, clean up the tween
			//  this is a bugfix for if they do 2 rapid clicks and drag
			if(_isTweening)
			{
				// NOTE: _tweeningLabel should not be null if _isTweening
				cancelTweenForLabel(_tweeningLabel);
			}
			var l:LabelingLabel = e.target as LabelingLabel;
			if(_labelToEndpointMatches[getLabelIndex(l)] < 0)
			{
				MovieClip(l.labelBox.getChildAt(0)).gotoAndStop("unfixed");
			}
			else
			{
				findTopEndPoint(l.endPointX,l.endPointY).dispatchEvent(new MouseEvent(MouseEvent.MOUSE_OVER));
			}
			setChildIndex(l, numChildren-1); // move the label to the front
			HACK_keepStuffInFront();
			l.useStraightLines(true);
			_labelBank.tryStoppingTweensForClip(l.labelBox);
			// NOTE: we need to do this or there can be a bug when they yank labels off
			//  the label bank really fast
			// I think this fixes that bug
			if( _labelBank.itemIsMember(l.labelBox) )
			{
				_labelBank.makeRoomForItem(l.labelBox);
			}
			_curDraggingLabelBoxClip = l.labelBox;
		}
		protected function HACK_keepStuffInFront():void
		{
			setChildIndex(topHeader, numChildren - 1);
			setChildIndex(_pageUpButton, numChildren - 1);
			setChildIndex(_pageDownButton, numChildren - 1);
		}
		protected function labelEndDrag(e:Event):void
		{
			var label:LabelingLabel = (e.target as LabelingLabel);
			label.useStraightLines(false);
			setLabelDisplayType(label);
			moveLabelToEndpointLabelPosition(label);
			checkToShowOrHideDoneButtonHelperMessage();
			_curDraggingLabelBoxClip = null;
			var top:MovieClip = findTopEndPoint(label.endPointX,label.endPointY);
			top.dispatchEvent(new MouseEvent(MouseEvent.MOUSE_OUT));
			if(_labelToEndpointMatches[getLabelIndex(label)] < 0) return;
			for(var i:int = 0; i < _labelsOnPoint[top].length; i++)
			{
				if(_labelsOnPoint[top][i] != label && label.fullText == _labelsOnPoint[top][i].fullText)
				{
					showDupeWarning();
					_labelsOnPoint[top].splice(i,1);
					//move the offending label back into the term list
					var bankPoint:Point = new Point(10,mouseY);
					label.dispatchEvent(new Event("EVENT_START_DRAG"));
					//forcefully remove the connection between the endpoint and the label
					top.dispatchEvent(new MouseEvent(MouseEvent.MOUSE_OUT));
					_labelToEndpointMatches[getLabelIndex(label)] = NO_ENDPOINT_MATCHED;
					startTweening(label, bankPoint, 0);
					label.addEventListener("EVENT_LABEL_MOVED", labelMoved, false, 0, true);
					label.drawLineTo(null);
					MovieClip(label.labelBox.getChildAt(0)).gotoAndStop("unfixed");
				}
			}
		}
		protected function moveLabelToEndpointLabelPosition(l:LabelingLabel):void
		{
			var endpointIndex:int = getMatchedEndpointIndex(l);
			if(endpointIndex != NO_ENDPOINT_MATCHED)
			{
				var numLabelsAtEndpoint:int = numMatchesToEndpointIndex(endpointIndex);
				var boxLocation:Point = _labelBoxLocations[endpointIndex];
				var offset:Number = (numLabelsAtEndpoint-1) * STACKED_LABEL_OFFSET;
				startTweening(l, boxLocation, offset);
			}
		}
		protected function startTweening(l:LabelingLabel, p:Point, o:Number):void
		{
			var g:GTween = new GTween(l.labelBox, SPEED_OF_TWEENS,
				{x:p.x - o, y:p.y - o},
				{ease:customTween});
			g.dispatchEvents = true;
			g.addEventListener(Event.COMPLETE, tweenComplete);
			_isTweening = true;
			_tweeningLabel = l;
			//stop listening to move events while tweening
			l.removeEventListener("EVENT_LABEL_MOVED", labelMoved);
			//NOTE: only doing 1 tween at a time to keep things simple
			if(_curTween != null)
			{
				finishTweenNow();
			}
			_curTween = g;
		}
		// made using the easing explorer found at http://www.madeinflex.com/img/entries/2007/05/customeasingexplorer.html
		protected static function customTween(t:Number, b:Number, c:Number, d:Number):Number
		{
			var ts:Number = (t/=d)*t;
			var tc:Number = ts*t;
			return b+c*(0*tc*ts + -1*ts*ts + 4*tc + -6*ts + 4*t);
		}
		protected function tweenComplete(e:Event):void
		{
			var l:LabelingLabel = (e.target as GTween).target.parent as LabelingLabel;
			HACK_disregardNextEVENT_LABEL_MOVED = true;
			// this should make it not think that the label has moved,
			//  and make us not need the HACK_disregardNextEVENT_LABEL_MOVED
			l.setLabelLocation(l.labelBox.x, l.labelBox.y);
			if(!l.hasEventListener("EVENT_LABEL_MOVED")) l.addEventListener("EVENT_LABEL_MOVED", labelMoved, false, 0, true);
			if(_dupeWarningPopup != null)
			{
				_labelBank.makeRoomForItem(l.labelBox);
				l.dispatchEvent(new Event("EVENT_END_DRAG"));
				matchToClosestLabel(l, mouseX, mouseY);
			}
			_isTweening = false;
			_curTween.removeEventListener(Event.COMPLETE, tweenComplete);
			_curTween = null;
		}
		// cancels a tween for a label
		// called if they re-click a dropped label before its tween finishes
		protected function cancelTweenForLabel(l:LabelingLabel):void
		{
			HACK_disregardNextEVENT_LABEL_MOVED = true; // bugfix
			_curTween.removeEventListener(Event.COMPLETE, tweenComplete);
			_curTween.paused = true;
			l.setLabelLocation(l.labelBox.x, l.labelBox.y);
			l.addEventListener("EVENT_LABEL_MOVED", labelMoved, false, 0, true);
			_isTweening = false;
			_curTween = null;
		}
		// finishes the curTween now
		protected function finishTweenNow():void
		{
			HACK_disregardNextEVENT_LABEL_MOVED = true; // bugfix
			_curTween.removeEventListener(Event.COMPLETE, tweenComplete);
			_curTween.end();
			_curTween.addEventListener("EVENT_LABEL_MOVED", labelMoved, false, 0, true);
			_curTween = null;
			_isTweening = false;
		}
		protected function labelMoved(e:Event):void
		{
			// HACK CODE bugfix -> stops an unwanted move event
			if(HACK_disregardNextEVENT_LABEL_MOVED)
			{
				HACK_disregardNextEVENT_LABEL_MOVED = false;
				return;
			}
			var curLabel:LabelingLabel = (e.target as LabelingLabel);
			// TODO: no deadzone check needed if it is not matched
			if(_dupeWarningPopup == null && curLabel.hasDraggedPastDeadZone())
			{
				matchToClosestLabel(curLabel, mouseX, mouseY);
			}
			// only do this if its the one we are currently dragging
			if( curLabel.labelBox == _curDraggingLabelBoxClip )
			{
				if(isLabelLocationInMediaBank(curLabel))
				{
					_labelBank.makeRoomForItem(curLabel.labelBox);
				}
				else
				{
					_labelBank.cancelMakeRoomForItem();
				}
			}
		}
		protected function setLabelDisplayType(label:LabelingLabel):void
		{
			var wasInBank:Boolean =  isLabelMarkedAsInLabelBank(label);
			var isNowInBank:Boolean =  isLabelLocationInMediaBank(label);
			if( wasInBank && ! isNowInBank )
			{
				// we were in media bank, but bn now we are not
				showLabelAsOnPlayArea(label);
			}
			else if( /*! wasInBank &&*/ isNowInBank)
			{
				showLabelAsInBank(label); // this could be happening too often?
			}
		}
		protected function showLabelAsOnPlayArea(label:LabelingLabel, text:String = null):void
		{
			if(text == null)
			{
				text = label.fullText;
			}
			label.setStaticWidthSingleLineLabelText(text, _screen.labelBankArea.width, LABEL_FONT , 14);
			// remove it from the bank
			var labelIndex:int = getLabelIndex(label);
			_labelBank.removeItem(label.labelBox);
			checkPageButtonVisibility();
		}
		protected function showLabelAsInBank(label:LabelingLabel, text:String = null, fixLabelBankAfter:Boolean = true):void
		{
			if(text == null)
			{
				text = label.fullText;
			}
			label.setStaticWidthMultilineLabelText(text, _screen.labelBankArea.width, LABEL_FONT , 14);
			_labelBank.addItem(label.labelBox);
			checkPageButtonVisibility();
		}
		// check where the label thinks it currently is
		// if in media bank, return true
		// else return false
		protected function isLabelMarkedAsInLabelBank(label:LabelingLabel):Boolean
		{
			// labels in the bank are multiline
			return label.isMultilineLabelText
		}
		// check the distance from the label bank
		// if we are far enough away to not be in the bank, return false
		// else return true
		protected function isLabelLocationInMediaBank(label:LabelingLabel):Boolean
		{
			// this can be based on distance from _screen.labelBankArea
			//const LABEL_BANK_AREA_DISTANCE:Number = 12;
			// note : label bank is on the left side of the screen,
			// we will only be checking the distance they go to the left
			// if it is currently in a match, dont move it back to the bank
			if(getMatchedEndpointIndex(label) != NO_ENDPOINT_MATCHED)
			{
				return false;
			}
			var labelMidpoint:Number = label.labelBox.x + label.labelBox.width/2.0;
			var labelBankRightSideX:Number = _screen.labelBankArea.x + _screen.labelBankArea.width + EXTRA_LABEL_BANK_SPACE;
			if(labelMidpoint < labelBankRightSideX)
			{
				return true;
			}
			return false;
		}
		protected function matchToClosestLabel(curLabel:LabelingLabel, destX:Number, destY:Number):void
		{
			// need to check if the label is in the labeling bank
			if( isLabelLocationInMediaBank(curLabel) )
			{
				return; // early return if it is in the label bank
			}
			// distances for when matches will jump to endpoints
			//draw a line to the closest endpoint
			var labelCenterX:Number = destX;
			var labelCenterY:Number = destY;
			var minimumDistance:Number = 99999.99;
			var closestEndpoint:MovieClip;
			//NOTE: just trying them all
			//there probably wont be enough labels to need to do something faster?
			var curMatchedEndpointIndex:int = getMatchedEndpointIndex(curLabel);
			var matchDistance:Number;
			if(curMatchedEndpointIndex != NO_ENDPOINT_MATCHED)
			{
				matchDistance = MATCH_DISTANCE_FOR_ALREADY_MATCHED;
			}
			else
			{
				matchDistance = MATCH_DISTANCE_FOR_NEW_MATCHES;
			}
			for(var i:int =0; i< _labelEndPointClips.length; i++)
			{
				var endX:Number;
				var endY:Number;
				var d:Number;
				if( i == curMatchedEndpointIndex)
				{
					endX = _labelEndPointClips[i].x //+ _labelEndPointClips[i].width/2.0;
					endY = _labelEndPointClips[i].y //+ _labelEndPointClips[i].height/2.0;
					d = distance(labelCenterX,labelCenterY,endX, endY);
					if( d < minimumDistance && d <= MATCH_DISTANCE_FOR_NEW_MATCHES)
					{
						minimumDistance = d;
						closestEndpoint = _labelEndPointClips[i];
					}
				}
				else if( ! numMatchesToEndpointIndex(i) >= 1)
				{
					endX = _labelEndPointClips[i].x //+ _labelEndPointClips[i].width/2.0;
					endY = _labelEndPointClips[i].y //+ _labelEndPointClips[i].height/2.0;
					d = distance(labelCenterX,labelCenterY,endX, endY);
					if( d < minimumDistance && d <= matchDistance)
					{
						minimumDistance = d;
						closestEndpoint = _labelEndPointClips[i];
					}
				}
			}
			matchLabelToEndpoint(curLabel, closestEndpoint);
		}
		protected static function distance( x1:Number, y1:Number, x2:Number, y2:Number):Number
		{
			var xDist:Number = x1 - x2;
			var yDist:Number = y1 - y2;
			return Math.sqrt(xDist*xDist + yDist*yDist);
		}
		protected function matchLabelToEndpoint(label:LabelingLabel, endPoint:MovieClip):void
		{
			var endpointIndex:int = getEndpointIndex(endPoint);
			var oldEndpointIndex:int = _labelToEndpointMatches[getLabelIndex(label)];
			var oldEndpoint:MovieClip = _labelEndPointClips[oldEndpointIndex];
			if(_labelToEndpointMatches[getLabelIndex(label)] != endpointIndex)
			{
				// hide the old selected label
				if(_labelToEndpointMatches[getLabelIndex(label)] != NO_ENDPOINT_MATCHED)
				{
					if(numMatchesToEndpointIndex(oldEndpointIndex) <= 1)
					{
						// only show it deselected if it has no labels going to it
						oldEndpoint.gotoAndStop(1);
						MovieClip(label.labelBox.getChildAt(0)).gotoAndStop("unfixed");
					}
				}
				// only play the selected anim if it is not already selected?
				// or
				if(endPoint)
				{
					endPoint.gotoAndPlay("selected");
					MovieClip(label.labelBox.getChildAt(0)).gotoAndStop("fixed");
				}
				label.drawLineTo(endPoint);
				// set the text for the new end point
				_labelToEndpointMatches[getLabelIndex(label)] = endpointIndex;
				var qid:String = _labelQuestionIds[endpointIndex];
				if(qid != null) _labelTextsByQuestionId[qid] = label.fullText;
				// clear the text for the old end point
				var oldQid:String = _labelQuestionIds[oldEndpointIndex];
				if(oldQid != null) _labelTextsByQuestionId[oldQid] = '';
				var top:MovieClip;
				if(oldEndpoint)
				{
					top = findTopEndPoint(oldEndpoint.x,oldEndpoint.y);
					top.dispatchEvent(new MouseEvent(MouseEvent.MOUSE_OUT));
					_labelsOnPoint[top].splice(_labelsOnPoint[top].indexOf(label),1);
				}
				if(endPoint)
				{
					top = findTopEndPoint(endPoint.x,endPoint.y);
					top.dispatchEvent(new MouseEvent(MouseEvent.MOUSE_OVER));
					_labelsOnPoint[top].push(label);
				}
			}
		}
		protected function findTopEndPoint(x:Number,y:Number):MovieClip
		{
			for(var key:Object in _topEndPoints)
			{
				if(Math.round(key.x) == Math.round(x) && Math.round(key.y) == Math.round(y))
				{
					return MovieClip(key);
				}
			}
			return null;
		}
		// return the number of labels connected to a single endpoint
		protected function numMatchesToEndpointIndex(index:int):int
		{
		 	var count:int =0;
		 	for(var i:int =0; i< _labelToEndpointMatches.length; i++)
		 	{
		 		if(_labelToEndpointMatches[i] == index)
				{
					count++;
				}
		 	}
		 	return count;
		}
		protected function endPointIsMatched(endPoint:MovieClip):Boolean
		{
			var index:int = getEndpointIndex(endPoint);
			for(var i:int =0; i< _labelToEndpointMatches.length; i++)
			{
				if(_labelToEndpointMatches[i] == index)
				{
					return true;
				}
			}
			return false;
		}
		// get the index of the endpoint that the label is connected to
		protected function getMatchedEndpointIndex(l:LabelingLabel):int
		{
			var index:int = getLabelIndex(l);
			if( index != -1)
			{
				return(_labelToEndpointMatches[index])
			}
			return NO_ENDPOINT_MATCHED;
		}
		// get the index of the label in the labels array
		protected function getLabelIndex(label:LabelingLabel):int
		{
			if(label == null) return -1;
			return _labels.indexOf(label);
		}
		protected function getEndpointIndex(end:MovieClip):int
		{
			if( end == null) return -1;
			return _labelEndPointClips.indexOf(end);
		}
		protected function addLabelEndpoint(point:Point):MovieClip
		{
			var l:LabelEndpoint = new LabelEndpoint();
			addChild(l);
			l.x = point.x;
			l.y = point.y;
			return l;
		}
		protected function ghostLabels(e:MouseEvent):void
		{
			_topEndPoints[e.currentTarget].visible = true;
		}
		protected function unGhostLabels(e:MouseEvent):void
		{
			_topEndPoints[e.currentTarget].visible = false;
		}
		protected function initLabelImage(s:*):void
		{
			s.x = Number(EngineCore.qSetData.options.imageX);
			s.y = Number(EngineCore.qSetData.options.imageY);
			s.scaleX = Number(EngineCore.qSetData.options.imageScale);
			s.scaleY = Number(EngineCore.qSetData.options.imageScale);
			// for the cork board theme, we show a white background thing
			if(EngineCore.qSetData.options["backgroundTheme"] == "themeCorkBoard")
			{
				var w:MovieClip = new MovieClip();
				w.graphics.beginFill(0xffffff);
				w.graphics.drawRect(s.x,s.y,s.width,s.height);
				_screen.ImageArea.addChild(w);
				w.tabEnabled = false;
				w.filters = [myDropShadowFilter()];
			}
			_screen.ImageArea.addChild(s);
			s.tabEnabled = false;
		}
		protected function myDropShadowFilter():BitmapFilter
		{
			var color:Number     = 0x000000;
			var angle:Number     = 90; //45
			var alpha:Number     = 0.8;
			var blurX:Number     = 5;
			var blurY:Number     = 3;
			var distance:Number  = 3;
			var strength:Number  = 0.65;
			var inner:Boolean    = false;
			var knockout:Boolean = false;
			var quality:Number   = BitmapFilterQuality.HIGH;
            return new DropShadowFilter(distance, angle, color, alpha, blurX, blurY, strength, quality, inner, knockout);
        }
		protected function labelBankPageUp(e:Event):void
		{
			_labelBank.tryGotoPreviousPage();
			checkPageButtonVisibility();
		}
		protected function labelBankPageDown(e:Event):void
		{
			_labelBank.tryGotoNextPage();
			checkPageButtonVisibility();
		}
		protected function checkPageButtonVisibility():void
		{
			_pageUpButton.visible   = _labelBank.canGoToPreviousPage();
			_pageDownButton.visible = _labelBank.canGoToNextPage();
		}
		protected function isAllLabelsMatched():Boolean
		{
			for(var i:int = 0; i < _labelToEndpointMatches.length; i++)
			{
				if(_labelToEndpointMatches[i] == NO_ENDPOINT_MATCHED)
				{
					return false;
				}
			}
			return true;
		}
		public function gameOver(e:MouseEvent = null):void
		{
			if(!allEndpointsLabeld())
			{
				showDoneWarning();
			}
			else
			{
				gameOverConfirmed();
			}
		}
		protected function allEndpointsLabeld():Boolean
		{
			for(var i:int =0; i< _labelQuestionIds.length; i++)
			{
				var userAnswerIndex:int = _labelToEndpointMatches[i];
				if(userAnswerIndex == NO_ENDPOINT_MATCHED)
				{
					return false;
				}
			}
			return true;
		}
		protected function showDoneWarning():void
		{
			removeDoneWarning();
			_doneWarningPopup = alert("Not All Labels Placed", "Are you sure you want to leave the game without placing all the labels?") as AlertWindow;
			_doneWarningPopup._x = (stage.stageWidth - _doneWarningPopup.width)/2;
			_doneWarningPopup._y = (stage.stageHeight - _doneWarningPopup.height)/2;
			_doneWarningPopup.addEventListener("dialogClick", warningChoiceMade, false, 0, true);
		}
		protected function removeDoneWarning():void
		{
			if(_doneWarningPopup != null)
			{
				_doneWarningPopup.destroy();
				_doneWarningPopup.removeEventListener("dialogClick", warningChoiceMade);
				_doneWarningPopup = null;
			}
		}
		protected function showDupeWarning():void
		{
			removeDupeWarning();
			_dupeWarningPopup = alert("Duplicate Labels", "Duplicate labels can not be attached to the same spot.", 1) as AlertWindow;
			_dupeWarningPopup._x = (stage.stageWidth - _dupeWarningPopup.width)/2;
			_dupeWarningPopup._y = (stage.stageHeight - _dupeWarningPopup.height)/2;
			_dupeWarningPopup.addEventListener("dialogClick", removeDupeWarning, false, 0, true);
		}
		protected function removeDupeWarning(e:StandardEvent = null):void
		{
			if(_dupeWarningPopup != null)
			{
				_dupeWarningPopup.destroy();
				_dupeWarningPopup.removeEventListener("dialogClick", removeDupeWarning);
				_dupeWarningPopup = null;
			}
		}
		protected function warningChoiceMade(e:StandardEvent):void
		{
			removeDoneWarning();
			if(e.result)
			{
				gameOverConfirmed();
			}
		}
		protected function gameOverConfirmed():void
		{
			for(var q:String in _labelTextsByQuestionId)
			{
				scoring.submitQuestionForScoring(q, _labelTextsByQuestionId[q]);
			}
			end();
		}
		protected function checkToShowOrHideDoneButtonHelperMessage():void
		{
			if(allEndpointsLabeld())
			{
				showDoneButtonHelperMessage();
			}
		}
		protected function showDoneButtonHelperMessage():void
		{
			if(_doneButtonHelperMessage == null)
			{
				// take it off the _screen movie clip to put it in front of everything
				_doneButtonHelperMessage = _screen.doneButtonHelperMessage;
				_screen.removeChild(_screen.doneButtonHelperMessage);
				addChild(_doneButtonHelperMessage);
			}
			_doneButtonHelperMessage.visible = true;
			_doneButtonHelperMessage.closeButton.addEventListener(MouseEvent.CLICK, hideDoneButtonHelperMessage, false, 0, true);
		}
		protected function hideDoneButtonHelperMessage(e:Event = null):void
		{
			if(e != null) // they clicked it
			{
				_hasUserClosedShowDoneButtonMessage = true;
			}
			if(_doneButtonHelperMessage != null)
			{
				_doneButtonHelperMessage.visible = false;
			}
		}
		protected function showGraphPaperTheme():void
		{
			if(_solidColorBackgroundClip != null)
			{
				_solidColorBackgroundClip.visible = false;
			}
			_screen.corkBoardBackground.visible = false;
			_screen.graphPaperBackground.visible = true;
			_screen.graphPaperBackground.tabEnabled = false;
		}
		protected function showCorkBoardTheme():void
		{
			if(_solidColorBackgroundClip != null)
			{
				_solidColorBackgroundClip.visible = false;
			}
			_screen.corkBoardBackground.visible = true;
			_screen.corkBoardBackground.tabEnabled = false;
			_screen.graphPaperBackground.visible = false;
		}
		protected function showSolidColorTheme(color:int):void
		{
			if(_solidColorBackgroundClip == null)
			{
				_solidColorBackgroundClip   = new MovieClip();
				_solidColorBackgroundClip.x = _screen.corkBoardBackground.x;
				_solidColorBackgroundClip.y = _screen.corkBoardBackground.y;
				_screen.addChild(_solidColorBackgroundClip);
				_screen.setChildIndex(_solidColorBackgroundClip, _screen.getChildIndex(_screen.corkBoardBackground));
			}
			_solidColorBackgroundClip.visible = true;
			_solidColorBackgroundClip.tabEnabled = false;
			_solidColorBackgroundClip.graphics.clear();
			_solidColorBackgroundClip.graphics.beginFill(color);
			_solidColorBackgroundClip.graphics.drawRect(0,0,_screen.corkBoardBackground.width,_screen.corkBoardBackground.height);
			_solidColorBackgroundClip.graphics.endFill();
			_screen.corkBoardBackground.visible = false;
			_screen.graphPaperBackground.visible = false;
		}
	}
}