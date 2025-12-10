import { ApiClient } from "../../api/apiClient";
import { BaseAppConfig, env } from "../../constants";

export enum DiscordWebhookType {
  ERROR = "error",
  FEEDBACK = "feedback",
}

export class DiscordService {
  static async sendDiscordMessage({ message, type }: { message: string; type: DiscordWebhookType }) {
    const webhookUrl = env.getDiscordWebhook(DiscordWebhookType.ERROR);

    const title = type === DiscordWebhookType.ERROR ? "App Report" : "App Feedback";
    const subtitle = type === DiscordWebhookType.ERROR ? "Error" : "Feedback";
    const color = type === DiscordWebhookType.ERROR ? 16711680 : 16711680;

    const payload = {
      username: title,
      allowed_mentions: { parse: [] },
      embeds: [
        {
          title: "User",
          color: color,
          fields: [
            {
              name: subtitle,
              value: message,
            },
            {
              name: "Version",
              value: `${BaseAppConfig.version} (${BaseAppConfig.buildVersion})`,
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
