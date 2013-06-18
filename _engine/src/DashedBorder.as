package
{
	import flash.display.Sprite;
	public class DashedBorder extends Sprite
	{
		private var _color:uint;
		private var _thickness:Number;
		private var _length:Number;
		private var _gap:Number;
		private var _curX:Number;
		private var _curY:Number;
		/**
		 * Dashed border object.
		 * @param c - Color of drawn shapes.
		 * @param t - Thickness of border line segments.
		 * @param l - Length of border line segments.
		 * @param g - Gap between border line segments.
		 * */
		public function DashedBorder(c:uint = 0xFFFFFF,t:Number=2,l:Number=2,g:Number=-1)
		{
			_color = c;
			_thickness = t;
			_length = l;
			if(g > 0)
			{
				_gap = g;
			}
			else
			{
				_gap = l;
			}
		}
		public function moveTo(x:Number, y:Number):void
		{
			graphics.moveTo(x,y);
			_curX = x;
			_curY = y;
		}
		public function horizontalLineTo(x:Number):void
		{
			var stepX:Number = _length;
			var gapX:Number = _gap;
			if(x<_curX)
			{
				stepX *= -1;
				gapX *= -1;
			}
			var numSteps:int = Math.abs(x-_curX)/(_length+_gap);
			for(var i:int = 0; i<=numSteps; i++)
			{
				graphics.lineTo(_curX+stepX,_curY);
				moveTo(_curX+stepX+gapX,_curY);
			}
			moveTo(x,_curY);
		}
		public function verticalLineTo(y:Number):void
		{
			var stepY:Number = _length;
			var gapY:Number = _gap;
			if(y<_curY)
			{
				stepY *= -1;
				gapY *= -1;
			}
			var numSteps:int = Math.abs(y-_curY)/(_length+_gap);
			for(var i:int = 0; i<=numSteps; i++)
			{
				graphics.lineTo(_curX,_curY+stepY);
				moveTo(_curX,_curY+stepY+gapY);
			}
			moveTo(_curX,y);
		}
		public function curveTo(cx:Number, cy:Number, ax:Number, ay:Number):void
		{
			graphics.curveTo(cx,cy,ax,ay);
			_curX = ax;
			_curY = ay;
		}
		/**
		 * Generates a rounded rectangle.
		 * @param x - X location of top left corner.
		 * @param y - Y location of top left corner.
		 * @param w - Width of rounded rectangle.
		 * @param h - Height of rounded rectangle.
		 * @param r - Radius of rounded corners.
		 * */
		public function curvedBox(x:Number, y:Number, w:Number,h:Number,r:Number):void
		{
			//reset the line style and draw the background first
			graphics.lineStyle();
			graphics.beginFill(_color);
			graphics.drawRoundRect(x+_thickness,y+_thickness,w-_thickness,h-_thickness,r,r);
			graphics.endFill();
			//now draw the border
			graphics.lineStyle(_thickness,0x000000,1,true);
			moveTo(x+r,y);
			horizontalLineTo(x+w-r);
			curveTo(x+w,y,x+w,y+r);
			verticalLineTo(y+h-r);
			curveTo(x+w,y+h,x+w-r,y+h);
			horizontalLineTo(x+r);
			curveTo(x,y+h,x,y+h-r);
			verticalLineTo(y+r);
			curveTo(x,y,x+r,y);
		}
	}
}