import { useColorScheme } from "react-native";
import { RootState } from "../app/store";
import { darkColors, lightColors } from "./colors";
import { useAppSelector } from "../hooks/hooks";

export const useAppTheme = () => {
  const systemScheme = useColorScheme();

  const themeMode = useAppSelector((state: RootState) => state.theme.mode);

  const getEffectiveScheme = () => {
    if (themeMode === "light") {
      return systemScheme;
    }
    return themeMode;
  };

  const currentScheme = getEffectiveScheme();
  const colors = currentScheme === "dark" ? darkColors : lightColors;

  return {
    colors,
    isDarkMode: currentScheme === "dark",
    themeMode,
  };
};

// Common color utilities for reusable styling
export const getAnswerColors = (colors: typeof lightColors | typeof darkColors) => ({
  correct: {
    background: colors.successLight,
    border: colors.success,
    text: colors.success,
  },
  wrong: {
    background: colors.errorLight,
    border: colors.error,
    text: colors.error,
  },
  info: {
    background: colors.infoLight,
    border: colors.info,
    text: colors.info,
  },
});

export type AppColors = typeof lightColors | typeof darkColors;
