import { AdEventType, InterstitialAd, RewardedAd, RewardedAdEventType, TestIds } from "react-native-google-mobile-ads";
import { AdsConfig, BaseAppConfig } from "../../../constants";

type RewardCallback = (reward: { type: string; amount: number }) => void;

class AdService {
  private static instance: AdService;

  private rewardedAd;
  private interstitialAd;

  private rewardedAdloaded = false;
  private interstitialAdloaded = false;

  private rewardCallback: RewardCallback | null = null;

  private constructor() {
    const rewardedAdUnitId = BaseAppConfig.devMode ? TestIds.REWARDED : AdsConfig.rewardedId;
    this.rewardedAd = RewardedAd.createForAdRequest(rewardedAdUnitId);
    this.rewardedAd.addAdEventListener(RewardedAdEventType.LOADED, () => (this.rewardedAdloaded = true));
    this.rewardedAd.addAdEventListener(RewardedAdEventType.EARNED_REWARD, (reward) => this.rewardCallback?.(reward));
    this.rewardedAd.load();

    const interstitialAdUnitId = BaseAppConfig.devMode ? TestIds.INTERSTITIAL : AdsConfig.interstitialId;
    this.interstitialAd = InterstitialAd.createForAdRequest(interstitialAdUnitId);
    this.interstitialAd.addAdEventListener(AdEventType.LOADED, () => (this.interstitialAdloaded = true));
    this.interstitialAd.load();
  }

  static getInstance() {
    if (!AdService.instance) {
      AdService.instance = new AdService();
    }
    return AdService.instance;
  }

  async showRewaredAd(callback?: RewardCallback) {
    if (callback) this.rewardCallback = callback;

    if (this.rewardedAdloaded) {
      await this.rewardedAd.show();
    } else {
      console.log("Rewarded ad not loaded yet. Loading now...");
      this.rewardedAd.load();
    }
  }

  async showInterstitialAd() {
    if (this.interstitialAdloaded) {
      await this.interstitialAd.show();
    } else {
      console.log("Interstitial ad not loaded yet. Loading now...");
      this.interstitialAd.load();
    }
  }
}

export const adService = AdService.getInstance();
