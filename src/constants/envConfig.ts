import Constants from "expo-constants";
import { DiscordWebhookType } from "../core/service";

class EnvConfig {
  // Dify API Keys
  readonly CHAT_API_KEY: string;
  readonly ASSISTANT_API_KEY: string;
  readonly ANALYZE_GAME_RESULT_API_KEY: string;
  readonly EXTRACT_CONTEXT_API_KEY: string;
  readonly ANALYZE_PROGRESS_API_KEY: string;

  // Discord Webhooks
  readonly DISCORD_ERROR_WEBHOOKS: string;
  readonly DISCORD_FEEDBACK_WEBHOOKS: string;

  constructor() {
    const extra = Constants.expoConfig?.extra ?? {};

    // Dify Keys
    this.CHAT_API_KEY = extra.CHAT_API_KEY;
    this.ASSISTANT_API_KEY = extra.DIFY_ASSISTANT_API_KEY;
    this.ANALYZE_GAME_RESULT_API_KEY = extra.DIFY_ANALYZE_GAME_RESULT_API_KEY;
    this.EXTRACT_CONTEXT_API_KEY = extra.DIFY_EXTRACT_CONTEXT_API_KEY;
    this.ANALYZE_PROGRESS_API_KEY = extra.DIFY_ANALYZE_PROGRESS_API_KEY;

    // Discord
    this.DISCORD_ERROR_WEBHOOKS = extra.DISCORD_ERROR_WEBHOOKS;
    this.DISCORD_FEEDBACK_WEBHOOKS = extra.DISCORD_FEEDBACK_WEBHOOKS;
  }

  /**
   * Get API key based on ngrok usage
   */
  chatApiKey = (): string => this.CHAT_API_KEY;

  assistantApiKey = (): string => this.ASSISTANT_API_KEY;

  analyzeGameResultApiKey = (): string => this.ANALYZE_GAME_RESULT_API_KEY;

  extractContextApiKey = (): string => this.EXTRACT_CONTEXT_API_KEY;

  analyzeProgressApiKey = (): string => this.ANALYZE_PROGRESS_API_KEY;

  getDiscordWebhook(type: DiscordWebhookType): string {
    return type === DiscordWebhookType.ERROR ? this.DISCORD_ERROR_WEBHOOKS : this.DISCORD_FEEDBACK_WEBHOOKS;
  }
}

export const env = new EnvConfig();
