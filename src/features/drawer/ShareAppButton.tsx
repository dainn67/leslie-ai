import React from "react";
import { TouchableOpacity, StyleSheet, Share } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { DrawerContentComponentProps } from "@react-navigation/drawer";
import { useAppTheme } from "../../theme";
import { CustomText } from "../../components/text/customText";
import { AppConfig, FirebaseConstants } from "../../constants";
import { FirebaseService } from "../../core/service";

interface ShareAppButtonProps {
  navigation: DrawerContentComponentProps["navigation"];
}

export const ShareAppButton = ({ navigation }: ShareAppButtonProps) => {
  const { colors } = useAppTheme();

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Thử ${AppConfig.name} - Trợ lý ôn thi JLPT thông minh: https://play.google.com/store/apps/details?id=${AppConfig.androidPackageName}`,
      });
      FirebaseService.logEvent(FirebaseConstants.SHARE_APP);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <TouchableOpacity style={styles.button} onPress={handleShare}>
      <Ionicons name="share-social" size={24} color={colors.primary} style={styles.icon} />
      <CustomText style={[styles.label, { color: colors.text }]}>Chia Sẻ Ứng Dụng</CustomText>
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
