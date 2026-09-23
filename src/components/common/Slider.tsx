/** @react-native-community/slider → <input type="range"> */

export const Slider = ({
  value,
  onValueChange,
  onSlidingComplete,
  minimumValue = 0,
  maximumValue = 1,
  step = 0,
  disabled,
  className,
  style,
  ...rest
}: any) => (
  <input
    type="range"
    min={minimumValue}
    max={maximumValue}
    step={step || 'any'}
    value={value ?? minimumValue}
    disabled={disabled}
    onChange={(e: any) => onValueChange?.(Number(e.target.value))}
    onMouseUp={(e: any) => onSlidingComplete?.(Number(e.currentTarget.value))}
    onTouchEnd={(e: any) => onSlidingComplete?.(Number(e.currentTarget.value))}
    className={className}
    style={style}
    {...rest}
  />
);

export default Slider;
