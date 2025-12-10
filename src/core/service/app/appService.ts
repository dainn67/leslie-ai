import { firebaseService, notificationService, ttsService } from "..";
import { BaseAppConfig } from "../../../constants";
import { compareVersions } from "../../../utils";

export class AppService {
  static init() {
    // Init data
    notificationService.init();
    ttsService.init();

    // Check min app version
    const minUsableVersion = firebaseService.getRemoteConfig()?.min_usable_version;
    const currentVersion = BaseAppConfig.version;
    if (currentVersion && minUsableVersion && compareVersions(currentVersion, minUsableVersion) < 0) {
      return {
        requireUpdate: true,
      };
    }

    return {
      requireUpdate: false,
    };
  }
}
