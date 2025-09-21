// components/CustomText.tsx
import React from "react";
import { Text, TextProps } from "react-native";

interface CustomTextProps extends TextProps {
  weight?: "Regular" | "Bold" | "Italic" | "Light" | "SemiBold";
  size?: number;
}

export const CustomText: React.FC<CustomTextProps> = ({ style, weight = "Regular", size = 16, children, ...props }) => {
  const fontMap: Record<string, string> = {
    Regular: "Inter-Regular",
    Bold: "Inter-Bold",
    Italic: "Inter-Italic",
    Light: "Inter-Light",
    SemiBold: "Inter-SemiBold",
  };

  return (
    <Text {...props} style={[{ fontFamily: fontMap[weight], fontSize: size }, style]}>
      {children}
    </Text>
  );
};
