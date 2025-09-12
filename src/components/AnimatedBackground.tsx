import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme/colors';

export const AnimatedBackground: React.FC<{ intensity?: number }> = ({ intensity = 1 }) => {
  const rotateA = useRef(new Animated.Value(0)).current;
  const rotateB = useRef(new Animated.Value(0)).current;
  const translate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loopRotate = (val: Animated.Value, duration: number) => {
      Animated.loop(
        Animated.timing(val, {
          toValue: 1,
          duration,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    };

    loopRotate(rotateA, 48000);
    loopRotate(rotateB, 62000);

    Animated.loop(
      Animated.sequence([
        Animated.timing(translate, { toValue: 1, duration: 14000, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(translate, { toValue: 0, duration: 14000, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ])
    ).start();
  }, [rotateA, rotateB, translate]);

  const rotateAInterpolate = rotateA.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const rotateBInterpolate = rotateB.interpolate({ inputRange: [0, 1], outputRange: ['360deg', '0deg'] });
  const translateInterpolate = translate.interpolate({ inputRange: [0, 1], outputRange: [-40, 40] });

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Animated.View style={[styles.blob, { transform: [{ rotate: rotateAInterpolate }, { translateX: translateInterpolate }], opacity: 0.35 * intensity }]}>
        <LinearGradient colors={[colors.brandIndigo, colors.brandViolet, colors.brandMagenta]} style={styles.gradient} />
      </Animated.View>
      <Animated.View style={[styles.blob, { transform: [{ rotate: rotateBInterpolate }, { translateY: translateInterpolate }], opacity: 0.28 * intensity }]}>
        <LinearGradient colors={[colors.brandCyan, colors.brandIndigo]} style={styles.gradient} />
      </Animated.View>
      <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(11,2,20,0.35)' }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  blob: {
    position: 'absolute',
    width: 600,
    height: 600,
    borderRadius: 300,
    top: -150,
    left: -150,
  },
  gradient: {
    flex: 1,
    borderRadius: 300,
  },
});

export default AnimatedBackground;


