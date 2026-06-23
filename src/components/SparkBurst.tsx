// SparkBurst — fires a one-shot radial burst of amber dots from screen center
// whenever the `play` prop transitions from false → true (or its `nonce`
// changes). We pre-build the spark array on mount so each particle runs an
// independent Reanimated animation on the UI thread.

import * as Haptics from "expo-haptics";
import React, { useEffect, useMemo, useRef } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { colors, fonts, radius, spacing, typeScale } from "@/src/utils/theme";

interface SparkBurstProps {
  // Increment this to (re)trigger the burst. We don't use a boolean because
  // toggling true→true won't replay.
  nonce: number;
  onDismiss?: () => void;
}

const N = 22;
const DURATION = 1100;

interface SparkProps {
  angle: number;
  distance: number;
  size: number;
  delay: number;
  nonce: number;
}

const Spark: React.FC<SparkProps> = ({ angle, distance, size, delay, nonce }) => {
  const progress = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    cancelAnimation(progress);
    cancelAnimation(opacity);
    progress.value = 0;
    opacity.value = 0;
    opacity.value = withTiming(1, { duration: 80 });
    progress.value = withTiming(1, {
      duration: DURATION,
      easing: Easing.out(Easing.cubic),
    });
    const t = setTimeout(() => {
      opacity.value = withTiming(0, { duration: 350 });
    }, DURATION - 350 + delay);
    return () => clearTimeout(t);
  }, [nonce, delay, progress, opacity]);

  const style = useAnimatedStyle(() => {
    const tx = Math.cos(angle) * distance * progress.value;
    const ty = Math.sin(angle) * distance * progress.value;
    return {
      opacity: opacity.value,
      transform: [
        { translateX: tx },
        { translateY: ty },
        { scale: 1 - progress.value * 0.4 },
      ],
    };
  });

  return (
    <Animated.View
      style={[
        styles.spark,
        { width: size, height: size, borderRadius: size / 2 },
        style,
      ]}
    />
  );
};

export const SparkBurst: React.FC<SparkBurstProps> = ({ nonce, onDismiss }) => {
  // Stable geometry so Reanimated worklets don't see prop churn.
  const sparks = useMemo(
    () =>
      Array.from({ length: N }).map((_, i) => ({
        angle: (Math.PI * 2 * i) / N + (Math.random() - 0.5) * 0.2,
        distance: 110 + Math.random() * 70,
        size: 6 + Math.random() * 8,
        delay: Math.random() * 80,
      })),
    [],
  );

  const messageOpacity = useSharedValue(0);
  const messageScale = useSharedValue(0.92);
  const lastNonce = useRef(0);

  useEffect(() => {
    if (nonce === 0 || nonce === lastNonce.current) return;
    lastNonce.current = nonce;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
      () => {},
    );
    messageOpacity.value = 0;
    messageScale.value = 0.92;
    messageOpacity.value = withTiming(1, { duration: 180 });
    messageScale.value = withTiming(1, {
      duration: 280,
      easing: Easing.out(Easing.back(1.4)),
    });
    const t = setTimeout(() => {
      messageOpacity.value = withTiming(0, { duration: 380 });
      const t2 = setTimeout(() => onDismiss?.(), 420);
      return () => clearTimeout(t2);
    }, 1400);
    return () => clearTimeout(t);
  }, [nonce, messageOpacity, messageScale, onDismiss]);

  const messageStyle = useAnimatedStyle(() => ({
    opacity: messageOpacity.value,
    transform: [{ scale: messageScale.value }],
  }));

  if (nonce === 0) return null;

  return (
    <Pressable
      style={styles.overlay}
      onPress={onDismiss}
      pointerEvents="box-only"
      testID="spark-burst"
    >
      <View style={styles.center} pointerEvents="none">
        {sparks.map((s, i) => (
          <Spark
            key={`${nonce}-${i}`}
            angle={s.angle}
            distance={s.distance}
            size={s.size}
            delay={s.delay}
            nonce={nonce}
          />
        ))}
        <Animated.View style={[styles.message, messageStyle]}>
          <Text style={styles.messageEyebrow}>ALL CLEAR</Text>
          <Text style={styles.messageTitle}>Beautifully done.</Text>
        </Animated.View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  center: {
    width: 1,
    height: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  spark: {
    position: "absolute",
    backgroundColor: colors.brandPrimary,
    shadowColor: colors.brandPrimary,
    shadowOpacity: 0.9,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
  },
  message: {
    position: "absolute",
    alignItems: "center",
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: "rgba(10,10,12,0.78)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(212,175,55,0.45)",
  },
  messageEyebrow: {
    color: colors.brandPrimary,
    fontFamily: fonts.textBold,
    fontSize: typeScale.xs,
    letterSpacing: 2.4,
  },
  messageTitle: {
    color: colors.onSurface,
    fontFamily: fonts.display,
    fontSize: typeScale.xl,
    fontStyle: "italic",
    marginTop: 4,
  },
});
