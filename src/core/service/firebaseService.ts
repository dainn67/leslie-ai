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

export const FirebaseService = {
  logClickEvent: async (name: string, params?: Record<string, any>) => {
    try {
      const analyticsInstance = getAnalytics();
      await logEvent(analyticsInstance, name, params);
    } catch (e) {
      console.error("Analytics event logging failed:", e);
    }
  },

  initializeRemoteConfig: async () => {
    try {
      const config = getRemoteConfig();

      // Set default config values
      setDefaults(config, {
        api_base_url: "https://default.example.com",
        feature_enabled: "false",
      });

      // This sets the minimum interval between Remote Config fetches to 1 hour (in milliseconds).
      // It means Remote Config will not fetch new values from the server more than once every 1 hour.
      setConfigSettings(config, {
        minimumFetchIntervalMillis: 3600000,
        fetchTimeMillis: 60000,
      });

      // ⏱ Limit fetchAndActivate to 3s
      await withTimeout(fetchAndActivate(config), 3000);

      return {
        dify_domain: getValue(config, FirebaseConstants.DIFY_DOMAIN).asString(),
        dify_domain_bak: getValue(config, FirebaseConstants.DIFY_DOMAIN_BAK).asString(),
        show_ads: getValue(config, FirebaseConstants.SHOW_ADS).asBoolean(),
      };
    } catch (e) {
      console.error("Remote Config init failed:", e);
      return { dify_domain: "", dify_domain_bak: "", show_ads: false };
    }
  },
};
