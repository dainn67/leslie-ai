import React, { useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withTiming, interpolate } from "react-native-reanimated";
import { IconButton } from "../../../components/buttons";
import { AppIcons } from "../../../constants";
import { useAppTheme } from "../../../theme";

interface FlipCardProps {
  front: string;
  back: string;
  duration?: number;
  width?: number;
  height?: number;
  flipped?: boolean;
  bookmarked?: boolean;
  onFlip?: () => void;
  onBookmark?: () => void;
}

export const FlipCard = ({
  front,
  back,
  duration = 600,
  width = 200,
  height = 300,
  flipped = false,
  bookmarked = false,
  onFlip,
  onBookmark,
}: FlipCardProps) => {
  const [isFlipped, setIsFlipped] = useState(flipped);
  const { colors } = useAppTheme();

  const rotateValue = useSharedValue(flipped ? 180 : 0);

  const handleFlip = () => {
    setIsFlipped((prev) => !prev);
    rotateValue.value = withTiming(isFlipped ? 0 : 180, { duration });
    onFlip?.();
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
      <Pressable
        pointerEvents="box-none"
        onPress={handleFlip}
        style={[styles.cardContainer, { width, height, backgroundColor: "red" }]}
      >
        <Animated.View style={[styles.card, styles.cardFront, frontAnimatedStyle]}>
          <IconButton
            icon={bookmarked ? AppIcons.bookmarked : AppIcons.bookmark}
            style={styles.saveButton}
            onPress={onBookmark}
          />

          <Text style={styles.text}>{front}</Text>
        </Animated.View>

        <Animated.View pointerEvents="box-none" style={[styles.card, styles.cardBack, backAnimatedStyle]}>
          <IconButton
            icon={bookmarked ? AppIcons.bookmarked : AppIcons.bookmark}
            style={styles.saveButton}
            onPress={onBookmark}
          />
          <Text style={styles.text}>{back}</Text>
        </Animated.View>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  cardContainer: {
    width: 200,
    height: 300,
  },
  card: {
    width: "100%",
    height: "100%",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backfaceVisibility: "hidden",
  },
  cardFront: {
    position: "absolute",
    backgroundColor: "#4A90E2",
  },
  cardBack: {
    position: "absolute",
    backgroundColor: "#50C878",
  },
  saveButton: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  text: {
    fontSize: 22,
    fontWeight: "600",
    color: "#ffffff",
    textAlign: "center",
    paddingHorizontal: 10,
  },
});
