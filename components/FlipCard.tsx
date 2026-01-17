import React from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import Animated, {
    interpolate,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from "react-native-reanimated";

export default function FlipCard() {
  const spin = useSharedValue(0);

  const handlePress = () => {
    // If spin is 0, go to 1. If 1, go back to 0.
    spin.value = withTiming(spin.value === 0 ? 1 : 0, { duration: 500 });
  };

  const frontAnimatedStyle = useAnimatedStyle(() => {
    const spinValue = interpolate(spin.value, [0, 1], [0, 180]);
    return {
      transform: [{ perspective: 1000 }, { rotateY: `${spinValue}deg` }],
    };
  });

  const backAnimatedStyle = useAnimatedStyle(() => {
    const spinValue = interpolate(spin.value, [0, 1], [180, 360]);
    return {
      transform: [{ perspective: 1000 }, { rotateY: `${spinValue}deg` }],
    };
  });

  return (
    <Pressable onPress={handlePress} style={styles.container}>
      {/* Front Side */}
      <Animated.View
        style={[styles.card, styles.frontCard, frontAnimatedStyle]}
      >
        <Text style={styles.text}>Hello</Text>
      </Animated.View>

      {/* Back Side */}
      <Animated.View style={[styles.card, styles.backCard, backAnimatedStyle]}>
        <Text style={styles.text}>World</Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    width: 200,
    height: 300,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    backfaceVisibility: "hidden", // This hides the "back" of the view
  },
  frontCard: {
    backgroundColor: "#6200ee",
  },
  backCard: {
    backgroundColor: "#03dac6",
  },
  text: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
  },
});
