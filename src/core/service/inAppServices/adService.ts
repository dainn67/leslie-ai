import { RewardedAd, RewardedAdEventType, TestIds } from "react-native-google-mobile-ads";
import { AdsConfig, AppConfig } from "../../../constants";

type RewardCallback = (reward: { type: string; amount: number }) => void;

class AdService {
  private static instance: AdService;
  private rewardedAd;
  private loaded = false;
  private rewardCallback: RewardCallback | null = null;

  private constructor() {
    const adUnitId = AppConfig.devMode ? TestIds.REWARDED : AdsConfig.rewardedId;

    this.rewardedAd = RewardedAd.createForAdRequest(adUnitId);

    // Add events
    this.rewardedAd.addAdEventListener(RewardedAdEventType.LOADED, () => {
      this.loaded = true;
    });

    this.rewardedAd.addAdEventListener(RewardedAdEventType.EARNED_REWARD, (reward) => {
      if (this.rewardCallback) {
        this.rewardCallback(reward);
      }
    });

    this.rewardedAd.load(); // Initial load
  }

  static getInstance() {
    if (!AdService.instance) {
      AdService.instance = new AdService();
    }
    return AdService.instance;
  }

  async show(callback?: RewardCallback) {
    if (callback) this.rewardCallback = callback;

    if (this.loaded) {
      await this.rewardedAd.show();
    } else {
      console.log("Rewarded ad not loaded yet. Loading now...");
      this.rewardedAd.load();
    }
  }
}

export const adService = AdService.getInstance();
