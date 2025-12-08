import React from "react";
import { View } from "react-native";
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

  const handleOpenDrawer = () => {
    firebaseService.logClickEvent(FirebaseConstants.OPEN_MENU);
    navigation.openDrawer();
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <AppBar title={"Dev Screen"} leftIcon={<Ionicons name="menu" size={24} color="white" />} onLeftPress={handleOpenDrawer} />
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <CustomText>Api url: {apiService.apiBaseUrl}</CustomText>
        <CustomText>Show ads: {showAds ? "Yes" : "No"}</CustomText>
        <CustomText>Remote config: {JSON.stringify(firebaseService.getRemoteConfig())}</CustomText>
      </View>
    </SafeAreaView>
  );
};
