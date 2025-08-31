import React from "react";
import { TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { DrawerContentComponentProps } from "@react-navigation/drawer";
import { useAppTheme } from "../../theme";
import { CustomText } from "../../components/text/customText";
import { useDialog } from "../../core/providers";
import { useAppDispatch } from "../../hooks/hooks";
import { clearUserProgress } from "../userProgress/userProgressSlice";
import { clearAllTables } from "../../storage/database/tables";
import { clearChat } from "../chatbot/slice/chatbotSlice";

interface ResetProgressButtonProps {
  navigation: DrawerContentComponentProps["navigation"];
}

export const ResetProgressButton = ({ navigation }: ResetProgressButtonProps) => {
  const { colors } = useAppTheme();
  const dispatch = useAppDispatch();
  const dialog = useDialog();

  const handleToggle = () => {
    dialog.showConfirm("Xoá hết tiến trình của bạn ?", () => {
      clearAllTables();
      dispatch(clearUserProgress());
      dispatch(clearChat({}));
      // Đóng drawer sau khi xác nhận
      navigation.closeDrawer();
      navigation.navigate("ChatbotScreen");
    });
  };

  return (
    <TouchableOpacity style={styles.button} onPress={handleToggle}>
      <Ionicons name={"trash"} size={24} color={colors.primary} style={styles.icon} />
      <CustomText style={[styles.label, { color: colors.text }]}>Xoá Dữ Liệu</CustomText>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "grey",
  },
  icon: {
    marginRight: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
  },
});
