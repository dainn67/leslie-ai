import React from "react";
import { View, StyleSheet } from "react-native";
import { CustomText } from "../../../components/text/customText";
import { AppBar } from "../../../components/AppBar";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import { FirebaseConstants } from "../../../constants";
import { DrawerParamList } from "../../../core/app/DrawerNavigator";
import { apiService, firebaseService } from "../../../core/service";
import { useAppSelector } from "../../../hooks/hooks";

export const DevScreen = () => {
  const navigation = useNavigation<DrawerNavigationProp<DrawerParamList, "DevScreen">>();
  const showAds = useAppSelector((state) => state.appConfig.showAds);
  const remoteConfig = firebaseService.getRemoteConfig();

  const handleOpenDrawer = () => {
    firebaseService.logClickEvent(FirebaseConstants.OPEN_MENU);
    navigation.openDrawer();
  };

  const InfoRow = ({ label, value }: { label: string; value: string }) => (
    <View style={styles.row}>
      <CustomText style={styles.label}>{label}</CustomText>
      <CustomText style={styles.value} selectable={true}>
        {value}
      </CustomText>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <AppBar title={"Dev Screen"} leftIcon={<Ionicons name="menu" size={24} color="white" />} onLeftPress={handleOpenDrawer} />
      <View style={styles.content}>
        <InfoRow label="API URL" value={apiService.apiBaseUrl} />
        <InfoRow label="Show Ads" value={showAds ? "Yes" : "No"} />
        <InfoRow label="Dify Domain" value={remoteConfig?.dify_domain || "N/A"} />
        <InfoRow label="Dify Domain Bak" value={remoteConfig?.dify_domain_bak || "N/A"} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 8,
    gap: 8,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: "rgba(0, 0, 0, 0.03)",
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    flex: 1,
  },
  value: {
    fontSize: 14,
    textAlign: "right",
    flex: 2,
    opacity: 0.7,
  },
});
