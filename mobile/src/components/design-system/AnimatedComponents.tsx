import React, { useRef, useEffect } from "react";
import { Animated, type ViewStyle, type StyleProp } from "react-native";

interface FadeInProps {
  children: React.ReactNode;
  duration?: number;
  delay?: number;
  style?: StyleProp<ViewStyle>;
}

export function FadeIn({
  children,
  duration = 300,
  delay = 0,
  style,
}: FadeInProps) {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.timing(opacity, {
        toValue: 1,
        duration,
        useNativeDriver: true,
      }).start();
    }, delay);

    return () => clearTimeout(timer);
  }, [opacity, duration, delay]);

  return <Animated.View style={[{ opacity }, style]}>{children}</Animated.View>;
}

interface SlideUpProps {
  children: React.ReactNode;
  duration?: number;
  delay?: number;
  style?: StyleProp<ViewStyle>;
}

export function SlideUp({
  children,
  duration = 350,
  delay = 0,
  style,
}: SlideUpProps) {
  const translateY = useRef(new Animated.Value(20)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration,
          useNativeDriver: true,
        }),
      ]).start();
    }, delay);

    return () => clearTimeout(timer);
  }, [translateY, opacity, duration, delay]);

  return (
    <Animated.View style={[{ opacity, transform: [{ translateY }] }, style]}>
      {children}
    </Animated.View>
  );
}

interface ScaleInProps {
  children: React.ReactNode;
  duration?: number;
  style?: StyleProp<ViewStyle>;
}

export function ScaleIn({ children, duration = 200, style }: ScaleInProps) {
  const scale = useRef(new Animated.Value(0.95)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
        friction: 8,
        tension: 100,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration,
        useNativeDriver: true,
      }),
    ]).start();
  }, [scale, opacity, duration]);

  return (
    <Animated.View style={[{ opacity, transform: [{ scale }] }, style]}>
      {children}
    </Animated.View>
  );
}

interface StaggerListProps {
  children: React.ReactNode[];
  baseDelay?: number;
  staggerDelay?: number;
  style?: StyleProp<ViewStyle>;
}

export function StaggerList({
  children,
  baseDelay = 50,
  staggerDelay = 80,
  style,
}: StaggerListProps) {
  return (
    <>
      {children.map((child, index) => (
        <FadeIn
          key={index}
          delay={baseDelay + index * staggerDelay}
          style={style}
        >
          {child}
        </FadeIn>
      ))}
    </>
  );
}
