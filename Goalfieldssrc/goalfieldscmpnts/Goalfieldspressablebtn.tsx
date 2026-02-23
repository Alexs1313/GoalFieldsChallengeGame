import React, { useRef } from 'react';
import {
  Animated,
  type Insets,
  Pressable,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

type GoalfieldsPressableBtnProps = {
  onPress: () => void;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
  hitSlop?: number | Insets;
  pressScale?: number;
  pressDownOffset?: number;
};

const Goalfieldspressablebtn: React.FC<GoalfieldsPressableBtnProps> = ({
  onPress,
  children,
  style,
  disabled = false,
  hitSlop,
  pressScale = 0.97,
  pressDownOffset = 2,
}) => {
  const scale = useRef(new Animated.Value(1)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  const animateTo = (nextScale: number, nextTranslateY: number) => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: nextScale,
        speed: 25,
        bounciness: 4,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: nextTranslateY,
        speed: 25,
        bounciness: 4,
        useNativeDriver: true,
      }),
    ]).start();
  };

  return (
    <Pressable
      hitSlop={hitSlop}
      onPress={onPress}
      onPressIn={() => animateTo(pressScale, pressDownOffset)}
      onPressOut={() => animateTo(1, 0)}
      disabled={disabled}
      style={style}
    >
      <Animated.View style={{ transform: [{ translateY }, { scale }] }}>
        {children}
      </Animated.View>
    </Pressable>
  );
};

export default Goalfieldspressablebtn;
