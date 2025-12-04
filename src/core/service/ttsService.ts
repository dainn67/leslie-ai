import Tts from "react-native-tts";
import { DiscordService, DiscordWebhookType } from "./discordService";

class TTSService {
  private static instance: TTSService;
  private isInitialized = false;
  private _containJapaneseVoice = false;

  // Default voices
  static japaneseFemaleVoice = "ja-JP-language";
  static japaneseMaleVoice = "ja-jp-x-jad-network";

  // Prevent external instantiation
  private constructor() {}

  static getInstance(): TTSService {
    if (!TTSService.instance) {
      TTSService.instance = new TTSService();
    }
    return TTSService.instance;
  }

  get containJapaneseVoice() {
    return this._containJapaneseVoice;
  }

  async init(name?: string) {
    if (this.isInitialized) return;

    try {
      const voices = await Tts.voices();
      console.log(
        "voices",
        voices.map((v) => v.language)
      );
      this._containJapaneseVoice = voices.some((v) => v.language.includes("ja"));

      // Base config
      await Tts.setDefaultRate(0.5);
      await Tts.setDefaultPitch(1.0);

      if (this._containJapaneseVoice) {
        await Tts.setDefaultLanguage("ja-JP");
        await Tts.setDefaultVoice(TTSService.japaneseFemaleVoice);
      }

      this.isInitialized = true;
    } catch (e) {
      DiscordService.sendDiscordMessage({
        name,
        message: `Failed to initialize TTS: ${JSON.stringify(e)}`,
        type: DiscordWebhookType.ERROR,
      });
      await Tts.setDefaultLanguage("en-US");
    }
  }

  async speak(text: string, onFinish: () => void) {
    const onDone = () => {
      this.removeAllListeners();
      onFinish();
    };

    await Tts.stop();
    Tts.addEventListener("tts-finish", onDone);
    Tts.addEventListener("tts-cancel", onDone);
    Tts.speak(text);
  }

  async stop() {
    await Tts.stop();
    this.removeAllListeners();
  }

  removeAllListeners() {
    try {
      Tts.removeAllListeners("tts-finish");
      Tts.removeAllListeners("tts-cancel");
    } catch (e) {
      DiscordService.sendDiscordMessage({
        message: `Failed to remove event listener: ${JSON.stringify(e)}`,
        type: DiscordWebhookType.ERROR,
      });
    }
  }

  setVoice(voiceId: string) {
    Tts.setDefaultVoice(voiceId);
  }

  async speakWithVoice(text: string, voiceId: string): Promise<void> {
    await Tts.setDefaultVoice(voiceId);
    return this.speak(text, () => {});
  }
}

export const ttsService = TTSService.getInstance();
