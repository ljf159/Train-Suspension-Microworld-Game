export const getCanvasScale = (ctx: CanvasRenderingContext2D) => {
  const baseSize = Math.min(ctx.canvas.width, ctx.canvas.height);
  return baseSize / 1000; // 1000 是基准尺寸
}; 