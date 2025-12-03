import React from "react";
import { TouchableOpacity, StyleSheet, Share } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "../../theme";
import { CustomText } from "../../components/text/customText";
import { AppConfig, FirebaseConstants } from "../../constants";
import { FirebaseService } from "../../core/service";
import { useTranslation } from "react-i18next";

export const ShareAppButton = () => {
  const { colors } = useAppTheme();
  const { t } = useTranslation();

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${AppConfig.name} - ${t("drawer_share_app_content")}: https://play.google.com/store/apps/details?id=${AppConfig.androidPackageName}`,
      });
      FirebaseService.logClickEvent(FirebaseConstants.SHARE_APP);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <TouchableOpacity style={styles.button} onPress={handleShare}>
      <Ionicons name="share-social" size={24} color={colors.primary} style={styles.icon} />
      <CustomText style={[styles.label, { color: colors.text }]}>{t("drawer_share_app")}</CustomText>
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
