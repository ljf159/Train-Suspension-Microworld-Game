export const getElevationColor = (elevation: number, min: number, max: number) => {
  const ratio = (elevation - min) / (max - min || 1);
  const hue = 240 - (ratio * 120); // 从蓝色(240)渐变到绿色(120)
  return `hsl(${hue}, 70%, 50%)`;
};

export const getTextColor = () => '#FFF'; // 直接返回白色 