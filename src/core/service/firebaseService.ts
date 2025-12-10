import { getAnalytics, logEvent } from "@react-native-firebase/analytics";
import {
  getRemoteConfig,
  setDefaults,
  setConfigSettings,
  fetchAndActivate,
  getValue,
} from "@react-native-firebase/remote-config";
import { withTimeout } from "../../utils";
import { FirebaseConstants } from "../../constants";
import { DiscordService, DiscordWebhookType } from ".";

export interface RemoteConfig {
  dify_domain: string;
  dify_domain_bak: string;
  show_ads: boolean;
  min_usable_version: string;
}

class FirebaseService {
  private static instance: FirebaseService;
  private remoteConfig: RemoteConfig | null = null;
  private hasFetched: boolean = false;

  private constructor() {}

  static getInstance(): FirebaseService {
    if (!FirebaseService.instance) {
      FirebaseService.instance = new FirebaseService();
    }
    return FirebaseService.instance;
  }

  async logClickEvent(name: string, params?: Record<string, any>): Promise<void> {
    try {
      const analyticsInstance = getAnalytics();
      await logEvent(analyticsInstance, name, params);
    } catch (e) {
      console.error("Analytics event logging failed:", e);
    }
  }

  async initializeRemoteConfig(): Promise<RemoteConfig> {
    // Nếu đã fetch rồi, trả về config đã có
    if (this.hasFetched && this.remoteConfig) {
      return this.remoteConfig;
    }

    try {
      const config = getRemoteConfig();

      // Set default config values
      setDefaults(config, {
        api_base_url: "https://default.example.com",
        feature_enabled: "false",
      });

      // Set minimum fetch interval to 0 để có thể fetch ngay khi gọi
      // Nhưng chỉ fetch một lần nhờ flag hasFetched
      setConfigSettings(config, {
        minimumFetchIntervalMillis: 0,
        fetchTimeMillis: 60000,
      });

      // ⏱ Limit fetchAndActivate to 3s
      await withTimeout(fetchAndActivate(config), 3000);

      const remoteConfig: RemoteConfig = {
        dify_domain: getValue(config, FirebaseConstants.DIFY_DOMAIN).asString(),
        dify_domain_bak: getValue(config, FirebaseConstants.DIFY_DOMAIN_BAK).asString(),
        show_ads: getValue(config, FirebaseConstants.SHOW_ADS).asBoolean(),
        min_usable_version: getValue(config, FirebaseConstants.MIN_USABLE_VERSION).asString(),
      };

      // Store remote config in singleton instance
      this.remoteConfig = remoteConfig;
      this.hasFetched = true;

      return remoteConfig;
    } catch (e) {
      console.error("Remote Config init failed:", (e as Error).message);
      DiscordService.sendDiscordMessage({
        message: `Remote Config init failed: ${(e as Error).message}`,
        type: DiscordWebhookType.ERROR,
      });
      this.remoteConfig = { dify_domain: "", dify_domain_bak: "", show_ads: false, min_usable_version: "" };
      this.hasFetched = true; // Đánh dấu đã fetch để tránh retry liên tục
      return this.remoteConfig;
    }
  }

  getRemoteConfig(): RemoteConfig | null {
    return this.remoteConfig;
  }

  isRemoteConfigInitialized(): boolean {
    return this.remoteConfig !== null;
  }
}

// Export singleton instance
export const firebaseService = FirebaseService.getInstance();
