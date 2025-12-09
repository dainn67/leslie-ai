import { notificationService, ttsService } from "..";

export class AppService {
  static async init() {
    await notificationService.init();
    ttsService.init();
  }
}
