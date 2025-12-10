import { firebaseService, notificationService, ttsService } from "..";
import { BaseAppConfig } from "../../../constants";
import { compareVersions } from "../../../utils";
import * as Network from "expo-network";

export class AppService {
  static async init() {
    // Init data
    notificationService.init();
    ttsService.init();

    // Check internet connection
    const networkState = await Network.getNetworkStateAsync();
    const internetConnection = networkState.isConnected;

    // Check min app version
    const minUsableVersion = firebaseService.getRemoteConfig()?.min_usable_version;
    const currentVersion = BaseAppConfig.version;
    const requireUpdate = currentVersion && minUsableVersion && compareVersions(currentVersion, minUsableVersion) < 0;

    return {
      requireUpdate,
      internetConnection,
    };
  }
}
