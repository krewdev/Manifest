import React, { useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, ViewStyle } from 'react-native';

export const MagicButton: React.FC<{ title: string; onPress: () => void; style?: ViewStyle; disabled?: boolean }>
  = ({ title, onPress, style, disabled }) => {
  const scale = useRef(new Animated.Value(1)).current;
  const glow = useRef(new Animated.Value(0)).current;

  const animateIn = () => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, speed: 20, bounciness: 6 }),
      Animated.timing(glow, { toValue: 1, duration: 150, useNativeDriver: false }),
    ]).start();
  };
  const animateOut = () => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 14, bounciness: 6 }),
      Animated.timing(glow, { toValue: 0, duration: 250, useNativeDriver: false }),
    ]).start();
  };

  const shadowColor = glow.interpolate({ inputRange: [0, 1], outputRange: ['rgba(164,0,255,0.0)', 'rgba(164,0,255,0.55)'] });

  return (
    <Animated.View style={[styles.wrap, { transform: [{ scale }], shadowColor }, style]}>
      <Pressable onPress={onPress} onPressIn={animateIn} onPressOut={animateOut} disabled={disabled} style={[styles.button, disabled && { opacity: 0.6 }]}>
        <Text style={styles.text}>{title}</Text>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    shadowOpacity: 0.45,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 20,
    elevation: 12,
    borderRadius: 16,
  },
  button: {
    backgroundColor: '#6a00ff',
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 16,
    alignItems: 'center',
  },
  text: { color: '#fff', fontWeight: '700' },
});

export default MagicButton;


