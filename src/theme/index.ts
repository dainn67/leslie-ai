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
