import Constants from "expo-constants";
import { DiscordWebhookType } from "../core/service";

class EnvConfig {
  // Dify API Keys
  readonly DIFY_CHAT_API_KEY: string;
  readonly DIFY_CHAT_NGINROK_API_KEY: string;
  readonly DIFY_ASSISTANT_API_KEY: string;
  readonly DIFY_ASSISTANT_NGINROK_API_KEY: string;
  readonly DIFY_ANALYZE_GAME_RESULT_API_KEY: string;
  readonly DIFY_ANALYZE_GAME_RESULT_NGINROK_API_KEY: string;
  readonly DIFY_EXTRACT_CONTEXT_API_KEY: string;
  readonly DIFY_EXTRACT_CONTEXT_NGINROK_API_KEY: string;
  readonly DIFY_ANALYZE_PROGRESS_API_KEY: string;
  readonly DIFY_ANALYZE_PROGRESS_NGINROK_API_KEY: string;

  // Discord Webhooks
  readonly DISCORD_ERROR_WEBHOOKS: string;
  readonly DISCORD_FEEDBACK_WEBHOOKS: string;

  constructor() {
    const extra = Constants.expoConfig?.extra ?? {};

    // Dify Keys
    this.DIFY_CHAT_API_KEY = extra.DIFY_CHAT_API_KEY;
    this.DIFY_CHAT_NGINROK_API_KEY = extra.DIFY_CHAT_NGINROK_API_KEY;
    this.DIFY_ASSISTANT_API_KEY = extra.DIFY_ASSISTANT_API_KEY;
    this.DIFY_ASSISTANT_NGINROK_API_KEY = extra.DIFY_ASSISTANT_NGINROK_API_KEY;
    this.DIFY_ANALYZE_GAME_RESULT_API_KEY = extra.DIFY_ANALYZE_GAME_RESULT_API_KEY;
    this.DIFY_ANALYZE_GAME_RESULT_NGINROK_API_KEY = extra.DIFY_ANALYZE_GAME_RESULT_NGINROK_API_KEY;
    this.DIFY_EXTRACT_CONTEXT_API_KEY = extra.DIFY_EXTRACT_CONTEXT_API_KEY;
    this.DIFY_EXTRACT_CONTEXT_NGINROK_API_KEY = extra.DIFY_EXTRACT_CONTEXT_NGINROK_API_KEY;
    this.DIFY_ANALYZE_PROGRESS_API_KEY = extra.DIFY_ANALYZE_PROGRESS_API_KEY;
    this.DIFY_ANALYZE_PROGRESS_NGINROK_API_KEY = extra.DIFY_ANALYZE_PROGRESS_NGINROK_API_KEY;

    // Discord
    this.DISCORD_ERROR_WEBHOOKS = extra.DISCORD_ERROR_WEBHOOKS;
    this.DISCORD_FEEDBACK_WEBHOOKS = extra.DISCORD_FEEDBACK_WEBHOOKS;
  }

  /**
   * Get API key based on ngrok usage
   */
  getDifyChatApiKey(isUsingNginrok: boolean): string {
    return isUsingNginrok ? this.DIFY_CHAT_NGINROK_API_KEY : this.DIFY_CHAT_API_KEY;
  }

  getDifyAssistantApiKey(isUsingNginrok: boolean): string {
    return isUsingNginrok ? this.DIFY_ASSISTANT_NGINROK_API_KEY : this.DIFY_ASSISTANT_API_KEY;
  }

  getDifyAnalyzeGameResultApiKey(isUsingNginrok: boolean): string {
    return isUsingNginrok ? this.DIFY_ANALYZE_GAME_RESULT_NGINROK_API_KEY : this.DIFY_ANALYZE_GAME_RESULT_API_KEY;
  }

  getDifyExtractContextApiKey(isUsingNginrok: boolean): string {
    return isUsingNginrok ? this.DIFY_EXTRACT_CONTEXT_NGINROK_API_KEY : this.DIFY_EXTRACT_CONTEXT_API_KEY;
  }

  getDifyAnalyzeProgressApiKey(isUsingNginrok: boolean): string {
    return isUsingNginrok ? this.DIFY_ANALYZE_PROGRESS_NGINROK_API_KEY : this.DIFY_ANALYZE_PROGRESS_API_KEY;
  }

  getDiscordWebhook(type: DiscordWebhookType): string {
    return type === DiscordWebhookType.ERROR ? this.DISCORD_ERROR_WEBHOOKS : this.DISCORD_FEEDBACK_WEBHOOKS;
  }
}

export const env = new EnvConfig();
