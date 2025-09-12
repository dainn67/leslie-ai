import axios from "axios";
import { DiscordService, DiscordWebhookType } from "../core/service";

export class ApiClient {
  static postData = async ({ url, headers, token, body }: { url: string; token?: string; body: any; headers?: any }) => {
    try {
      const response = await axios.post(url, body, {
        headers: {
          ...headers,
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });
      return response.data;
    } catch (error) {
      console.log("apiClient error:", error, (error as any).response?.data);
      DiscordService.sendDiscordMessage({
        message: `apiClient error: ${JSON.stringify(error)}`,
        type: DiscordWebhookType.ERROR,
      });
      return null;
    }
  };
}
