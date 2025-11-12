import React from "react";
import { TouchableOpacity, StyleSheet } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { Ionicons } from "@expo/vector-icons";
import { RootState } from "../../app/store";
import { toggleTheme } from "../theme/themeSlice";
import { useAppTheme } from "../../theme";
import { CustomText } from "../../components/text/customText";
import { FirebaseConstants } from "../../constants";
import { FirebaseService } from "../../core/service";
import { useTranslation } from "react-i18next";

export const ThemeToggleButton = () => {
  const dispatch = useDispatch();
  const themeMode = useSelector((state: RootState) => state.theme.mode);
  const { colors } = useAppTheme();
  const { t } = useTranslation();

  const handleToggle = () => {
    dispatch(toggleTheme());

    FirebaseService.logEvent(FirebaseConstants.TOGGLE_THEME, {
      theme: themeMode,
    });
  };

  const getIconName = () => {
    return themeMode === "dark" ? "sunny" : "moon";
  };

  const getLabel = () => {
    return themeMode === "dark" ? t("drawer_theme_lightmode") : t("drawer_theme_darkmode");
  };

  return (
    <TouchableOpacity style={styles.button} onPress={handleToggle}>
      <Ionicons name={getIconName()} size={24} color={colors.primary} style={styles.icon} />
      <CustomText style={[styles.label, { color: colors.text }]}>{getLabel()}</CustomText>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  icon: {
    marginRight: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
  },
});
