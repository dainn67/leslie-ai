import { ApiClient } from "../../api/apiClient";
import { AppConfig, env } from "../../constants";
import { AsyncStorageService } from "./storageServices/asyncStorageService";

export enum DiscordWebhookType {
  ERROR = "error",
  FEEDBACK = "feedback",
}

export class DiscordService {
  static async sendDiscordMessage({ name, message, type }: { name?: string; message: string; type: DiscordWebhookType }) {
    const username = name ?? (await AsyncStorageService.getUserProgress())?.userName;

    const webhookUrl = env.getDiscordWebhook(DiscordWebhookType.ERROR);

    const title = type === DiscordWebhookType.ERROR ? "App Report" : "App Feedback";
    const subtitle = type === DiscordWebhookType.ERROR ? "Error" : "Feedback";
    const color = type === DiscordWebhookType.ERROR ? 16711680 : 16711680;

    const payload = {
      username: title,
      allowed_mentions: { parse: [] },
      embeds: [
        {
          title: `Username: ${username || "Unknown"}`,
          color: color,
          fields: [
            {
              name: subtitle,
              value: message,
            },
            {
              name: "Version",
              value: `${AppConfig.version} (${AppConfig.buildVersion})`,
            },
          ],
          timestamp: new Date().toISOString(),
        },
      ],
    };

    ApiClient.postData({
      url: webhookUrl,
      body: JSON.stringify(payload),
    });
  }
}
