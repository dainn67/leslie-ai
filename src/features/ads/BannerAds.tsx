import React from "react";
import { View } from "react-native";
import { BannerAd, BannerAdSize, TestIds } from "react-native-google-mobile-ads";
import { AdsConfig, AppConfig } from "../../constants";

const bannerId = AppConfig.devMode ? TestIds.BANNER : AdsConfig.bannerId;

export const BannerAds = () => {
  return (
    <View style={{ alignItems: "center" }}>
      <BannerAd unitId={bannerId} size={BannerAdSize.BANNER} />
    </View>
  );
};
