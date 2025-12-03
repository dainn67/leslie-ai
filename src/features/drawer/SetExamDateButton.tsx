import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity, StyleSheet } from "react-native";
import { CustomText } from "../../components/text/customText";
import { useAppTheme } from "../../theme";
import { useDialog } from "../../core/providers";
import { useAppDispatch } from "../../hooks/hooks";
import { updateUserProgress } from "../userProgress/userProgressSlice";
import { FirebaseService } from "../../core/service";
import { FirebaseConstants } from "../../constants";
import { useTranslation } from "react-i18next";

export const SetExamDateButton = () => {
  const { colors } = useAppTheme();
  const { t } = useTranslation();

  const dialog = useDialog();
  const dispatch = useAppDispatch();

  const handleClick = () => {
    dialog.showDatePicker((date) => {
      if (date) {
        FirebaseService.logClickEvent(FirebaseConstants.UPDATE_EXAM_DATE, { date: date.getTime() });
        dispatch(updateUserProgress({ examDate: date.getTime() }));
      }
    });
  };

  return (
    <TouchableOpacity style={styles.button} onPress={handleClick}>
      <Ionicons name={"calendar"} size={24} color={colors.primary} style={styles.icon} />
      <CustomText style={[styles.label, { color: colors.text }]}>{t("drawer_set_exam_date")}</CustomText>
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
