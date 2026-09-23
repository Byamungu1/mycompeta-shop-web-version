/** expo-linear-gradient → CSS linear-gradient */

const toStops = (colors: string[], locations?: number[]) => {
  if (!colors?.length) return 'transparent, transparent';
  if (!locations || locations.length !== colors.length) return colors.join(', ');
  return colors.map((c, i) => `${c} ${Math.round(locations[i] * 100)}%`).join(', ');
};

const angleFromPoints = (start?: { x: number; y: number }, end?: { x: number; y: number }) => {
  if (!start || !end) return '180deg';
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const angle = (Math.atan2(dx, -dy) * 180) / Math.PI;
  return `${Math.round(angle)}deg`;
};

export const LinearGradient = ({
  colors,
  locations,
  start,
  end,
  children,
  className,
  style,
  ...rest
}: any) => (
  <div
    className={className}
    style={{
      display: 'flex',
      backgroundImage: `linear-gradient(${angleFromPoints(start, end)}, ${toStops(
        colors || [],
        locations
      )})`,
      ...style,
    }}
    {...rest}
  >
    {children}
  </div>
);

export default { LinearGradient };
