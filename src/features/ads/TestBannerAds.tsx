import React from "react";
import { View } from "react-native";
import { BannerAd, BannerAdSize, TestIds } from "react-native-google-mobile-ads";
import { AppConfig } from "../../constants";

const bannerId = AppConfig.devMode ? TestIds.BANNER : "ca-app-pub-6011704237608953/2310302283";

export const TestBannerAds = () => {
  return (
    <View style={{ alignItems: "center", marginTop: 20 }}>
      <BannerAd unitId={bannerId} size={BannerAdSize.BANNER} />
    </View>
  );
};
