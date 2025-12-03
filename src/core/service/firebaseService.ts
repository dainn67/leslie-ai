import analytics from "@react-native-firebase/analytics";
import remoteConfig from "@react-native-firebase/remote-config";
import { withTimeout } from "../../utils";

export const FirebaseService = {
  logEvent: async (name: string, params?: Record<string, any>) => {
    try {
      await analytics().logEvent(name, params);
    } catch (e) {
      console.error("Analytics event logging failed:", e);
    }
  },

  initializeRemoteConfig: async () => {
    try {
      const config = remoteConfig();

      // Set default config values
      config.setDefaults({
        api_base_url: "https://default.example.com",
        feature_enabled: "false",
      });

      // This sets the minimum interval between Remote Config fetches to 1 hour (in milliseconds).
      // It means Remote Config will not fetch new values from the server more than once every 1 hour.
      config.setConfigSettings({
        minimumFetchIntervalMillis: 3600000,
        fetchTimeMillis: 60000,
      });

      // ⏱ Limit fetchAndActivate to 3s
      await withTimeout(config.fetchAndActivate(), 3000);

      return {
        dify_domain: config.getValue("dify_domain").asString(),
        dify_domain_bak: config.getValue("dify_domain_bak").asString(),
      };
    } catch (e) {
      console.error("Remote Config init failed:", e);
      return { dify_domain: "", dify_domain_bak: "" };
    }
  },
};
