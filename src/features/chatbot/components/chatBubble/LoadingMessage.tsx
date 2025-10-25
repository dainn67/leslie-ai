import React, { useEffect, useRef } from "react";
import { Animated, View, StyleSheet, ViewStyle } from "react-native";
import { CustomText } from "../../../../components/text/customText";
import { useAppTheme } from "../../../../theme";
import { MessageType } from "../../../../models";

interface LoadingMessageProps {
  type: MessageType;
  style?: ViewStyle;
}

export const LoadingMessage = ({ type, style }: LoadingMessageProps) => {
  const dots = Array.from({ length: 3 }, () => useRef(new Animated.Value(0)).current);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const { isDarkMode } = useAppTheme();

  useEffect(() => {
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    // Pulse animation for the container
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulseAnimation.start();

    // Start dot animations with staggered timing
    startDotAnimation(0);
    setTimeout(() => {
      startDotAnimation(1);
    }, 200);
    setTimeout(() => {
      startDotAnimation(2);
    }, 400);

    return () => {
      pulseAnimation.stop();
    };
  }, []);

  const startDotAnimation = (index: number) => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(dots[index], {
          toValue: -8,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(dots[index], {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(dots[index], {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();

    return () => {
      animation.stop();
    };
  };

  return (
    <Animated.View
      style={[
        {
          opacity: fadeAnim,
          transform: [{ scale: pulseAnim }],
        },
        style,
      ]}
    >
      <View style={[styles.loadingContainer, { backgroundColor: isDarkMode ? "#222222" : "#f0f0f0" }]}>
        <View style={styles.contentContainer}>
          {type !== MessageType.STREAM_TEXT && (
            <CustomText style={[styles.loadingText, { color: isDarkMode ? "white" : "#65676B" }]}>
              {type === MessageType.QUESTIONS ? "Đang tạo câu hỏi" : "Đang tạo Flashcards"}
            </CustomText>
          )}
          <View style={[styles.dotsContainer, { marginLeft: type !== MessageType.STREAM_TEXT ? 8 : 0 }]}>
            {Array.from({ length: 3 }).map((_, index) => (
              <Animated.View
                key={index}
                style={[
                  styles.dot,
                  {
                    transform: [{ translateY: dots[index] }],
                    backgroundColor: isDarkMode ? "white" : "#65676B",
                  },
                ]}
              />
            ))}
          </View>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    borderRadius: 100,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  contentContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  dotsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginHorizontal: 4,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
});
