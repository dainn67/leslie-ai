import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity, StyleSheet } from "react-native";
import { CustomText } from "../../components/text/customText";
import { useAppTheme } from "../../theme";
import { useDialog } from "../../core/providers";
import { useAppDispatch } from "../../hooks/hooks";
import { updateUserProgress } from "../userProgress/userProgressSlice";

export const SetExamDateButton = () => {
  const { colors } = useAppTheme();
  const dialog = useDialog();
  const dispatch = useAppDispatch();

  const handleClick = () => {
    dialog.showDatePicker((date) => {
      if (date) dispatch(updateUserProgress({ examDate: date.getTime() }));
    });
  };

  return (
    <TouchableOpacity style={styles.button} onPress={handleClick}>
      <Ionicons name={"calendar"} size={24} color={colors.primary} style={styles.icon} />
      <CustomText style={[styles.label, { color: colors.text }]}>Đặt Ngày Thi</CustomText>
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
