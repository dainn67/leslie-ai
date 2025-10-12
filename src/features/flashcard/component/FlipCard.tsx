import React, { useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withTiming, interpolate } from "react-native-reanimated";

/**
 * Props interface for the FlipCard component
 * @property {string} front - Text to display on the front of the card
 * @property {string} back - Text to display on the back of the card
 * @property {number} [duration=600] - Animation duration in milliseconds
 * @property {number} [aspectRatio=1.5] - Width to height ratio (default 3:2 = 1.5)
 */
interface FlipCardProps {
  front: string;
  back: string;
  duration?: number;
  width?: number;
  height?: number;
}

/**
 * FlipCard Component
 *
 * A reusable card component that flips with a 3D animation when tapped.
 * The card takes up maximum available space while maintaining the specified aspect ratio.
 *
 * @param {FlipCardProps} props - Component props
 */
export const FlipCard = ({ front, back, duration = 600, width = 200, height = 300 }: FlipCardProps) => {
  // State to track whether the card is currently showing the back side
  const [isFlipped, setIsFlipped] = useState(false);

  // Shared value for animation - represents rotation angle (0 to 180 degrees)
  // useSharedValue creates a value that can be animated on the native thread
  const rotateValue = useSharedValue(0);

  const handleFlip = () => {
    // Toggle the flipped state
    setIsFlipped((prev) => !prev);

    // Animate the rotation value smoothly
    // If currently flipped, rotate back to 0°, otherwise rotate to 180°
    rotateValue.value = withTiming(isFlipped ? 0 : 180, { duration });
  };

  /**
   * Front side animated styles
   * - Rotates from 0° to 180° when flipping
   * - Fades out when rotation exceeds 90°
   * - Hidden on back side to prevent z-index issues
   */
  const frontAnimatedStyle = useAnimatedStyle(() => {
    // Interpolate opacity: fully visible at 0°, invisible at 90°+
    const opacity = interpolate(
      rotateValue.value,
      [0, 90, 180],
      [1, 0, 0] // Front fades out as it rotates past 90°
    );

    return {
      opacity,
      transform: [
        { perspective: 1000 }, // Adds 3D perspective effect
        { rotateY: `${rotateValue.value}deg` }, // Y-axis rotation
      ],
    };
  });

  /**
   * Back side animated styles
   * - Initially rotated 180° (facing backward)
   * - Rotates to 0° relative position when card flips
   * - Fades in when rotation exceeds 90°
   */
  const backAnimatedStyle = useAnimatedStyle(() => {
    // Interpolate opacity: invisible until 90°, then fades in
    const opacity = interpolate(
      rotateValue.value,
      [0, 90, 180],
      [0, 0, 1] // Back fades in as it rotates past 90°
    );

    return {
      opacity,
      transform: [
        { perspective: 1000 }, // Adds 3D perspective effect
        { rotateY: `${rotateValue.value - 180}deg` }, // Back starts at -180° (flipped)
      ],
    };
  });

  return (
    <View style={styles.container}>
      {/* Pressable wrapper to detect tap events */}
      {/* Takes maximum width and maintains aspect ratio for height */}
      <Pressable onPress={handleFlip} style={[styles.cardContainer, { width, height }]}>
        {/* Front side of the card */}
        <Animated.View style={[styles.card, styles.cardFront, frontAnimatedStyle]}>
          <Text style={styles.text}>{front}</Text>
        </Animated.View>

        {/* Back side of the card - positioned absolutely to overlay the front */}
        <Animated.View style={[styles.card, styles.cardBack, backAnimatedStyle]}>
          <Text style={styles.text}>{back}</Text>
        </Animated.View>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  // Main container - takes up full available space
  container: {
    alignItems: "center",
    justifyContent: "center",
  },

  // Container for the flip card - takes maximum width while maintaining aspect ratio
  cardContainer: {
    width: 200,
    height: 300,
  },

  // Base card styles shared by both front and back
  card: {
    width: "100%",
    height: "100%",
    backgroundColor: "#ffffff",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    // Prevents the back of the card from showing during rotation
    backfaceVisibility: "hidden",
  },

  // Front card specific styling
  cardFront: {
    position: "absolute",
    backgroundColor: "#4A90E2", // Blue background for front
  },

  // Back card specific styling
  cardBack: {
    position: "absolute",
    backgroundColor: "#50C878", // Green background for back
  },

  // Text styling for card content
  text: {
    fontSize: 22,
    fontWeight: "600",
    color: "#ffffff",
    textAlign: "center",
    paddingHorizontal: 10,
  },
});
