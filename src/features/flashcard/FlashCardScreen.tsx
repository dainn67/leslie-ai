import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { AppBar } from "../../components/AppBar";
import { FirebaseService } from "../../core/service";
import { FirebaseConstants } from "../../constants";
import { useNavigation } from "@react-navigation/native";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import { RootStackParamList } from "../../app/RootNavigator";

export const FlashCardScreen = () => {
  const navigation = useNavigation<DrawerNavigationProp<RootStackParamList, "Main">>();

  const handleOpenDrawer = () => {
    FirebaseService.logEvent(FirebaseConstants.OPEN_MENU);
    navigation.openDrawer();
  };

  return (
    <>
      <AppBar
        title={"Flash Card"}
        leftIcon={<Ionicons name="menu" size={24} color="white" />}
        onLeftPress={handleOpenDrawer}
      />
    </>
  );
};
