export type CanvasDrawer = (
  ctx: CanvasRenderingContext2D,
  minElevation: number,
  maxElevation: number
) => void;