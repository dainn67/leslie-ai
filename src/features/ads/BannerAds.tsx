import React, { useState } from "react";
import { View } from "react-native";
import { BannerAd, BannerAdSize, TestIds } from "react-native-google-mobile-ads";
import { AdsConfig, BaseAppConfig } from "../../constants";
import { useAppSelector } from "../../hooks/hooks";

const bannerId = BaseAppConfig.devMode ? TestIds.BANNER : AdsConfig.bannerId;

export const BannerAds = () => {
  const [adLoaded, setAdLoaded] = useState(false);

  const handleAdLoaded = () => {
    setAdLoaded(true);
  };

  const handleAdFailedToLoad = () => {
    setAdLoaded(false);
  };

  const showAds = useAppSelector((state) => state.appConfig.showAds);

  if (!showAds) return <></>;

  return (
    <View style={{ alignItems: "center", height: adLoaded ? undefined : 0 }}>
      <BannerAd
        unitId={bannerId}
        size={BannerAdSize.BANNER}
        onAdLoaded={handleAdLoaded}
        onAdFailedToLoad={handleAdFailedToLoad}
      />
    </View>
  );
};
