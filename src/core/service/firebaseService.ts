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

  async initializeRemoteConfig(): Promise<RemoteConfig | null> {
    // Nếu đã fetch rồi, trả về config đã có
    if (this.remoteConfig) return this.remoteConfig;

    try {
      const config = getRemoteConfig();

      // Set default config values
      setDefaults(config, {
        api_base_url: "https://default.example.com",
        feature_enabled: "false",
      });

      // Set minimum fetch interval to 2 hours
      setConfigSettings(config, {
        minimumFetchIntervalMillis: 2 * 60 * 60 * 1000, // 2 hours
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

      return remoteConfig;
    } catch (e) {
      const message = "Remote Config init failed: " + (e as Error).message;
      console.error(message);
      DiscordService.sendDiscordMessage({ message, type: DiscordWebhookType.ERROR });
      return null;
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
