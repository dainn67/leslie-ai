import React, { useState } from "react";
import { TouchableOpacity, View, StyleSheet, ViewStyle, TextStyle, StyleProp, ActivityIndicator } from "react-native";
import { CustomText } from "../text/customText";
import { useAppTheme } from "../../theme";

interface MainButtonProps {
  title: string;
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  onPress: () => void;
}

// Component MainButton
const MainButton = ({ title, onPress, disabled = false, loading = false, style, textStyle }: MainButtonProps) => {
  const [isPressed, setIsPressed] = useState(false);
  const [pressedTime, setPressedTime] = useState(0);

  const handlePress = () => {
    const now = Date.now();
    if (now - pressedTime < 500) return;

    onPress();
    setPressedTime(now);
  };

  const handlePressIn = () => setIsPressed(true);
  const handlePressOut = () => setIsPressed(false);

  const text = title.replaceAll("**", "").replace(/<[^>]*>/g, "");

  // Get passed in border radius
  const flattenedStyle = StyleSheet.flatten(style || {});
  const borderRadius = flattenedStyle?.borderRadius ?? 8;

  const { colors } = useAppTheme();

  const containerStyles = [{ borderRadius }];

  const buttonStyles = [
    styles.button,
    {
      backgroundColor: disabled ? colors.secondary : colors.primary,
      opacity: isPressed ? 0.9 : 1,
      transform: isPressed ? [{ scale: 0.98 }] : [],
      borderRadius,
    },
    style,
  ];

  const textStyles = [styles.text, textStyle];

  return (
    <View style={containerStyles}>
      <TouchableOpacity
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        style={buttonStyles}
        activeOpacity={0.8}
      >
        {loading ? <ActivityIndicator color="#4A4A4A" /> : <CustomText style={textStyles}>{text}</CustomText>}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  button: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    minHeight: 44,
  },
  text: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
});

export default MainButton;
