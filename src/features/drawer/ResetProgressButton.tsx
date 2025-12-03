import React from "react";
import { TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { DrawerContentComponentProps } from "@react-navigation/drawer";
import { useAppTheme } from "../../theme";
import { CustomText } from "../../components/text/customText";
import { useDialog } from "../../core/providers";
import { useAppDispatch, useAppSelector } from "../../hooks/hooks";
import { clearUserProgress } from "../userProgress/userProgressSlice";
import { clearChat } from "../chatbot/slice/chatbotSlice";
import { FirebaseConstants } from "../../constants";
import { AsyncStorageService, clearDatabase, FirebaseService } from "../../core/service";
import { useTranslation } from "react-i18next";

interface ResetProgressButtonProps {
  navigation: DrawerContentComponentProps["navigation"];
}

export const ResetProgressButton = ({ navigation }: ResetProgressButtonProps) => {
  const { colors } = useAppTheme();
  const { t } = useTranslation();
  const dialog = useDialog();
  const userProgress = useAppSelector((state) => state.userProgress.userProgress);
  const dispatch = useAppDispatch();

  const handleToggle = () => {
    dialog.showConfirm(t("drawer_reset_progress_title"), () => {
      clearDatabase();
      dispatch(clearUserProgress({ userName: userProgress.userName }));
      setTimeout(() => {
        AsyncStorageService.clearData();
        dispatch(clearChat({}));
        FirebaseService.logClickEvent(FirebaseConstants.RESET_PROGRESS);

        navigation.closeDrawer();
        navigation.navigate("ChatbotScreen");
      }, 200);
    });
  };

  return (
    <TouchableOpacity style={styles.button} onPress={handleToggle}>
      <Ionicons name={"trash"} size={24} color={colors.primary} style={styles.icon} />
      <CustomText style={[styles.label, { color: colors.text }]}>{t("drawer_reset_progress")}</CustomText>
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
