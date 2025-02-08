export const drawDirectionArrow = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  direction: 'forward' | 'backward',
  angle: number,
  scale: number
) => {
  const arrowSize = 3 * scale;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle + (direction === 'forward' ? 0 : Math.PI));
  
  ctx.beginPath();
  ctx.moveTo(-arrowSize/2, -arrowSize/2);
  ctx.lineTo(arrowSize/2, 0);
  ctx.lineTo(-arrowSize/2, arrowSize/2);
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 2;
  ctx.stroke();
  
  ctx.restore();
};