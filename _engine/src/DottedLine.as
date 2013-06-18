package
{
	import flash.display.Sprite;
	public class DottedLine extends Sprite
	{
		private var _color:uint;
		private var _diam:Number;
		private var _gap:Number;
		private var _curX:Number;
		private var _curY:Number;
		/**
		 * Dotted line object.
		 * @param c - Color of dots.
		 * @param d - Diameter of dots.
		 * @param g - Gap between dots.
		 * */
		public function DottedLine(c:uint=0x333333,d:Number=2,g:Number=-1)
		{
			_color = c;
			_diam = d;
			if(g > 0)
			{
				_gap = d+g;
			}
			else
			{
				_gap = d*2;
			}
		}
		public function moveTo(x:Number, y:Number):void
		{
			graphics.moveTo(x,y);
			_curX = x;
			_curY = y;
		}
		public function lineTo(x:Number, y:Number):void
		{
			graphics.beginFill(_color);
			var run:Number = (x-_curX);
			var rise:Number = (y-_curY);
			var distance:Number = Math.sqrt(run*run+rise*rise);
			var angRad:Number = Math.atan(rise/run);
			var stepX:Number = Math.cos(angRad) * _gap;
			var stepY:Number = Math.abs(Math.sin(angRad) * _gap);
			var numSteps:int = Math.round(distance/_gap);
			if(x<_curX) stepX *= -1;
			if(y<_curY) stepY *= -1;
			for(var i:int = 0; i < numSteps; i++)
			{
				moveTo(_curX+stepX,_curY+stepY);
				graphics.drawCircle(_curX,_curY,_diam/2);
			}
			graphics.endFill();
		}
	}
}