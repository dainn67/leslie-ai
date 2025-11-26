import React from "react";
import { Image, ImageSourcePropType, StyleSheet, TouchableOpacity, ViewStyle } from "react-native";
import { useAppTheme } from "../../theme";

interface IconButtonProps {
  icon: ImageSourcePropType;
  iconWidth?: number;
  iconHeight?: number;
  iconColor?: string;
  style?: ViewStyle;
  onPress?: () => void;
}

export const IconButton = ({ icon, iconWidth, iconHeight, iconColor, style, onPress }: IconButtonProps) => {
  const { colors } = useAppTheme();
  const styles = getStyles(iconWidth, iconHeight);

  return (
    <TouchableOpacity style={[styles.button, { backgroundColor: colors.backgroundSecondary }, style]} onPress={onPress}>
      <Image
        source={icon}
        style={styles.icon}
        resizeMode="contain"
        onError={(error) => console.log("Image error:", error)}
        tintColor={iconColor}
      />
    </TouchableOpacity>
  );
};

const getStyles = (iconWidth?: number, iconHeight?: number) =>
  StyleSheet.create({
    button: {
      borderRadius: 12,
      padding: 8,
    },
    icon: {
      width: iconWidth ?? 24,
      height: iconHeight ?? 24,
    },
  });
