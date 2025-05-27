import React from 'react';
import { Animated, Easing } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';

export default function HalfColorSpinner({ size = 48 }) {
  const rotateAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, [rotateAnim]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const r = size / 2 - 4;
  const cx = size / 2;
  const cy = size / 2;

  return (
    <Animated.View style={{ transform: [{ rotate: spin }] }}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <G>
          {/* Left half - white */}
          <Circle
            cx={cx}
            cy={cy}
            r={r}
            stroke="#fff"
            strokeWidth={6}
            strokeDasharray={`${Math.PI * r}, ${Math.PI * r}`}
            strokeDashoffset={0}
            fill="none"
            rotation={-90}
            origin={`${cx},${cy}`}
          />
          {/* Right half - yellow */}
          <Circle
            cx={cx}
            cy={cy}
            r={r}
            stroke="#FFD600"
            strokeWidth={6}
            strokeDasharray={`${Math.PI * r}, ${Math.PI * r}`}
            strokeDashoffset={-Math.PI * r}
            fill="none"
            rotation={90}
            origin={`${cx},${cy}`}
          />
        </G>
      </Svg>
    </Animated.View>
  );
}