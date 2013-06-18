package
{
	import flash.display.MovieClip;
	import flash.display.Sprite;
	import flash.events.Event;
	import flash.events.MouseEvent;
	public class EndPoint extends Sprite
	{
		public static const ENDPOINT_EMPTY:String = "ENDPOINT_EMPTY";
		public static const ENDPOINT_DRAGGING:String = "ENDPOINT_DRAGGING";
		public static const ENDPOINT_RELEASED:String = "ENDPOINT_RELEASED";
		public static const ENDPOINT_APPEND:String = "ENDPOINT_APPEND";
		public static const PRELINK_LINK_RADIUS:int = 7;
		public static const PRELINK_BREAK_RADIUS:int = 14;
		public static const ENDPOINT_DOT_RADIUS:Number = 5.0;
		public static const FOUND_DUPES:String = "FOUND_DUPES";
		private const APPEND_DOT_RADIUS:Number = 10;
		private const INNER_COLOR:uint = 0x333333;
		private const OUTER_COLOR:uint = 0xFFFFFF;
		private const HORIZONTAL_LINE_PADDING:Number = 30;
		private const VERTICAL_LINE_PADDING:Number = 30;
		public var labels:Array = new Array();
		private var _lineDrawingClip:Sprite = new Sprite();
		private var _stageWidth:int;
		private var _stageHeight:int;
		private var _topEdge:int;
		private var _leftEdge:int;
		private var _animationClip:LabelEndpoint;
		public var attached:Boolean = false;
		public var newDestinationEndPoint:EndPoint;
		private var _appendButton:Sprite;
		private var _invisArea:Sprite;
		private var _moving:Boolean = false;
		public function EndPoint(x:int, y:int, label:LabelingLabel, s:MovieClip)
		{
			super();
			_stageWidth = s.width;
			_stageHeight = s.height;
			_topEdge = s.y;
			_leftEdge = s.x;
			_animationClip = new LabelEndpoint();
			this.addChild(_animationClip);
			_animationClip.visible = false;
			this.x = x;
			this.y = y;
			this.addChild(_lineDrawingClip);
			addLabel(label);
			_lineDrawingClip.buttonMode = true;
			_lineDrawingClip.addEventListener(MouseEvent.MOUSE_DOWN, onMouseDown, false, 0, true);
			this.addEventListener(MouseEvent.MOUSE_OUT, onMouseOut, false, 0, true);
			_appendButton = new Sprite();
			_appendButton.graphics.beginFill(0x006600);
			_appendButton.graphics.drawCircle(0,0,APPEND_DOT_RADIUS+2);
			_appendButton.graphics.endFill();
			_appendButton.graphics.beginFill(0x00CC00);
			_appendButton.graphics.drawCircle(0,0,APPEND_DOT_RADIUS);
			_appendButton.graphics.endFill();
			_appendButton.graphics.beginFill(0xFFFFFF);
			_appendButton.graphics.lineStyle(4,0xFFFFFF);
			_appendButton.graphics.moveTo(0,-APPEND_DOT_RADIUS/2);
			_appendButton.graphics.lineTo(0,APPEND_DOT_RADIUS/2);
			_appendButton.graphics.moveTo(-APPEND_DOT_RADIUS/2,0);
			_appendButton.graphics.lineTo(APPEND_DOT_RADIUS/2,0);
			_appendButton.graphics.endFill();
			this.addChild(_appendButton);
			_appendButton.y = APPEND_DOT_RADIUS*2+5;
			_appendButton.visible = false;
			_appendButton.buttonMode = true;
			//invisible cone to catch mouseover between endpoint and append button
			_invisArea = new Sprite();
			_invisArea.graphics.beginFill(0xFF0000,0);
			_invisArea.graphics.moveTo(-ENDPOINT_DOT_RADIUS/2,0);
			_invisArea.graphics.lineTo(-APPEND_DOT_RADIUS*2,_appendButton.y+APPEND_DOT_RADIUS);
			_invisArea.graphics.lineTo(APPEND_DOT_RADIUS*2,_appendButton.y+APPEND_DOT_RADIUS);
			_invisArea.graphics.lineTo(ENDPOINT_DOT_RADIUS/2,0);
			_invisArea.graphics.lineTo(-ENDPOINT_DOT_RADIUS/2,0);
			_invisArea.graphics.endFill();
			this.addChild(_invisArea);
			this.setChildIndex(_invisArea,0);
			_invisArea.visible = false;
		}
		public function redrawLine():void
		{
			_lineDrawingClip.graphics.clear();
			_lineDrawingClip.graphics.lineStyle(0,0,0);
			_lineDrawingClip.graphics.beginFill(OUTER_COLOR);
			_lineDrawingClip.graphics.drawCircle(0,0, ENDPOINT_DOT_RADIUS + 2.0);
			_lineDrawingClip.graphics.endFill();
			drawLines(OUTER_COLOR,6);
			drawLines(INNER_COLOR,2);
			_lineDrawingClip.graphics.lineStyle(0,0,0);
			_lineDrawingClip.graphics.beginFill(INNER_COLOR);
			_lineDrawingClip.graphics.drawCircle(0,0,ENDPOINT_DOT_RADIUS);
		}
		protected function drawLines(color:uint,size:int):void
		{
			var numLabels:int = labels.length;
			for each(var l:LabelingLabel in labels)
			{
				var startingBoxCenterX:Number = (l.labelBox.x-this.x)+ (l.labelBox.width/2);
				var startingBoxCenterY:Number = (l.labelBox.y-this.y) + (l.labelBox.height/2);
				var horizontalStraightLineLength:Number = l.labelBox.width/2 + HORIZONTAL_LINE_PADDING;
				var verticalStraightLineLength:Number = l.labelBox.height/2 + VERTICAL_LINE_PADDING;
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
				_lineDrawingClip.graphics.moveTo(linePoints[0], linePoints[1]);
				_lineDrawingClip.graphics.lineStyle(size,color,1.0,true);
				for(var j:int = 2; j< linePoints.length; j+=2)
				{
					_lineDrawingClip.graphics.lineTo(linePoints[j], linePoints[j+1]);
				}
				_lineDrawingClip.graphics.moveTo(linePoints[0], linePoints[1]);
			}
		}
		protected function onMouseOver(e:MouseEvent):void
		{
			if(_moving) return;
			_invisArea.visible = true;
			_appendButton.visible = true;
			_appendButton.addEventListener(MouseEvent.CLICK, appendButtonClick, false, 0, true);
			this.removeEventListener(MouseEvent.MOUSE_OVER, onMouseOver);
			this.addEventListener(MouseEvent.MOUSE_OUT, onMouseOut, false, 0, true);
		}
		protected function onMouseOut(e:MouseEvent):void
		{
			_invisArea.visible = false;
			_appendButton.visible = false;
			if(_appendButton.hasEventListener(MouseEvent.CLICK))
			{
				_appendButton.removeEventListener(MouseEvent.CLICK, appendButtonClick);
			}
			this.removeEventListener(MouseEvent.MOUSE_OUT, onMouseOut);
			this.addEventListener(MouseEvent.MOUSE_OVER, onMouseOver, false, 0, true);
		}
		protected function appendButtonClick(e:MouseEvent):void
		{
			this.dispatchEvent(new Event(ENDPOINT_APPEND));
			_appendButton.removeEventListener(MouseEvent.CLICK, appendButtonClick);
		}
		protected function onMouseDown(e:MouseEvent):void
		{
			_moving = true;
			e.stopPropagation();
			stage.addEventListener(Event.ENTER_FRAME, moveEndpoint,false,0,true);
			stage.addEventListener(MouseEvent.MOUSE_UP, stopDraggingEndpoint,false,0,true);
			dispatchEvent(new Event(ENDPOINT_DRAGGING));
			onMouseOut(new MouseEvent(MouseEvent.MOUSE_OUT));
		}
		protected function moveEndpoint(e:Event):void
		{
			if(attached) return;
			this.x = this.parent.mouseX;
			this.y = this.parent.mouseY;
			if(this.x < _leftEdge)
			{
				this.x = _leftEdge;
			}
			else if(this.x > _stageWidth+_leftEdge)
			{
				this.x = _stageWidth+_leftEdge;
			}
			if(this.y < _topEdge)
			{
				this.y = _topEdge;
			}
			else if(this.y > _stageHeight+_topEdge)
			{
				this.y = _stageHeight+_topEdge;
			}
			redrawLine();
		}
		protected function stopDraggingEndpoint(e:Event):void
		{
			_moving = false;
			stage.removeEventListener(Event.ENTER_FRAME, moveEndpoint);
			stage.removeEventListener(MouseEvent.MOUSE_UP, stopDraggingEndpoint);
			for each(var l:LabelingLabel in labels)
			{
				l.setEndpointLocation(this.x,this.y);
			}
			dispatchEvent(new Event(ENDPOINT_RELEASED));
		}
		protected function startDraggingLabel(e:Event):void
		{
			stage.addEventListener(MouseEvent.MOUSE_MOVE, moveLabel, false, 0, true);
			stage.addEventListener(LabelingLabelBaseClass.EVENT_END_DRAG, stopDraggingLabel, false, 0, true);
		}
		protected function stopDraggingLabel(e:Event):void
		{
			stage.removeEventListener(MouseEvent.MOUSE_MOVE, moveLabel);
			stage.removeEventListener(LabelingLabelBaseClass.EVENT_END_DRAG, stopDraggingLabel);
		}
		protected function moveLabel(e:MouseEvent):void
		{
			redrawLine();
		}
		public function addLabel(l:LabelingLabel):void
		{
			labels.push(l);
			l.creatorEndPoint = this;
			l.addEventListener(LabelingLabelBaseClass.EVENT_START_DRAG, startDraggingLabel, false, 0, true);
			l.addEventListener(LabelingLabelBaseClass.EVENT_CLOSE_BUTTON_CLICK, seedRemoveLabel, false, 0, true);
			redrawLine();
		}
		/*
		for some reason the listeners on labels that are split from endpoints are
		not fully removed, despite explicitly removing those listeners
		so this makes sure events from removed labels are ignored
		*/
		protected function seedRemoveLabel(e:Event):void
		{
			var l:LabelingLabel = LabelingLabel(e.target);
			if(labels.indexOf(l) > -1)
			{
				removeLabel(l);
			}
		}
		public function removeLabel(l:LabelingLabel):void
		{
			//disassociate this endpoint from the given label completely
			l.creatorEndPoint = null;
			l.removeEventListener(LabelingLabelBaseClass.EVENT_START_DRAG, startDraggingLabel);
			l.removeEventListener(LabelingLabelBaseClass.EVENT_CLOSE_BUTTON_CLICK, removeLabel);
			labels.splice(labels.indexOf(l),1);
			//redraw the line or destroy this endpoint if it has no labels attached to it
			if(labels.length>0)
			{
				redrawLine();
			}
			else
			{
				_lineDrawingClip.removeEventListener(MouseEvent.MOUSE_DOWN, onMouseDown);
				this.removeEventListener(MouseEvent.MOUSE_OVER, onMouseOver);
				this.removeEventListener(MouseEvent.MOUSE_OUT, onMouseOut);
				dispatchEvent(new Event(ENDPOINT_EMPTY));
			}
		}
		//functions for visualizing a combination between two endpoints as an example
		public function preLink(ep:EndPoint):void
		{
			newDestinationEndPoint = ep;
			_animationClip.visible = true;
			_animationClip.gotoAndPlay("selected");
			attached = true;
			redrawLine();
		}
		public function breakPreLink():void
		{
			newDestinationEndPoint = null;
			_animationClip.visible = false;
			attached = false;
		}
		//pass all of this endpoint's labels to the endpoint it's being combined with
		public function combineEndPoints(callback:Function):void
		{
			while(labels.length > 0)
			{
				var l:LabelingLabel = labels[labels.length-1];
				var ok:Boolean = true
				for each(var otherL:LabelingLabel in newDestinationEndPoint.labels)
				{
					if(otherL.fullText == l.fullText)
					{
						ok = false;
						break;
					}
				}
				removeLabel(l)
				if(ok)
				{
					newDestinationEndPoint.addLabel(l);
				}
				else
				{
					this.dispatchEvent(new Event(FOUND_DUPES));
					callback(l.labelBox.x+(l.labelBox.width/2),l.labelBox.y+(l.labelBox.height*2),l);
				}
			}
		}
		//functions called externally to position appended labels next to the last added label
		public function get lastLabelX():Number
		{
			return labels[labels.length-1].labelBox.x;
		}
		public function get lastLabelY():Number
		{
			return labels[labels.length-1].labelBox.y;
		}
	}
}