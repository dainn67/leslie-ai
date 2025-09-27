import React from "react";
import { View } from "react-native";
import { useAppTheme } from "../../../theme";

export const Divider = () => {
  const { colors } = useAppTheme();

  return (
    <View
      style={{
        height: 1,
        backgroundColor: colors.grey,
        marginVertical: 12,
        marginHorizontal: 16,
      }}
    />
  );
};
