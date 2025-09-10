import Constants from "expo-constants";
import { ApiClient } from "../../api/apiClient";

const { DISCORD_ERROR_WEBHOOKS, DISCORD_FEEDBACK_WEBHOOKS } = Constants.expoConfig?.extra ?? {};

export enum DiscordWebhookType {
  ERROR = "error",
  FEEDBACK = "feedback",
}

export class DiscordService {
  static sendDiscordMessage({ username, message, type }: { username?: string; message: string; type: DiscordWebhookType }) {
    const webhookUrl = type === DiscordWebhookType.ERROR ? DISCORD_ERROR_WEBHOOKS : DISCORD_FEEDBACK_WEBHOOKS;

    const title = type === DiscordWebhookType.ERROR ? "App Report" : "App Feedback";
    const subtitle = type === DiscordWebhookType.ERROR ? "Error" : "Feedback";
    const color = type === DiscordWebhookType.ERROR ? 16711680 : 16711680;

    if (!webhookUrl) {
      console.error("DISCORD_WEBHOOK_URL is not set");
      return;
    }

    const payload = {
      username: username ?? "Unknown user",
      allowed_mentions: { parse: [] },
      embeds: [
        {
          title: title,
          color: color,
          fields: [
            {
              name: subtitle,
              value: message,
            },
          ],
          //   footer: { text: `Review ID: ${r.reviewId}` },
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
