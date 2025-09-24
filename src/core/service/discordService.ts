import Constants from "expo-constants";
import { ApiClient } from "../../api/apiClient";
import { AppConfig } from "../../constants";
import { AsyncStorageService } from "./storageServices/asyncStorageService";

const { DISCORD_ERROR_WEBHOOKS, DISCORD_FEEDBACK_WEBHOOKS } = Constants.expoConfig?.extra ?? {};

export enum DiscordWebhookType {
  ERROR = "error",
  FEEDBACK = "feedback",
}

export class DiscordService {
  static async sendDiscordMessage({ name, message, type }: { name?: string; message: string; type: DiscordWebhookType }) {
    console.log(message);

    const username = name ?? (await AsyncStorageService.getUserProgress())?.userName;

    const webhookUrl = type === DiscordWebhookType.ERROR ? DISCORD_ERROR_WEBHOOKS : DISCORD_FEEDBACK_WEBHOOKS;

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
