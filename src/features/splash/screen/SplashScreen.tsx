import React from "react";
import { View, Image, StyleSheet } from "react-native";
import { CustomText } from "../../../components/text/customText";
import { AppConfig } from "../../../constants/appConfig";
import { useAppTheme } from "../../../theme";
import { LoadingMessage } from "../../chatbot/components";
import { MessageType } from "../../../models";
import { AppIcons } from "../../../constants";

export const SplashScreen = () => {
  const { colors } = useAppTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Image source={AppIcons.logo} style={styles.logo} resizeMode="contain" />
      <CustomText style={[styles.appName, { color: colors.text }]}>{AppConfig.name}</CustomText>
      <LoadingMessage type={MessageType.STREAM_TEXT} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 20,
    elevation: 8,
  },
  appName: {
    marginVertical: 16,
    fontSize: 24,
    fontWeight: "bold",
  },
});
