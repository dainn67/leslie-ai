import { ApiConfig } from "../../constants";

export class ApiService {
  private static _instance: ApiService;

  private _apiBaseUrl: string = ApiConfig.dafaultDifyServerUrl;

  private constructor() {}

  static getInstance(): ApiService {
    if (!ApiService._instance) {
      ApiService._instance = new ApiService();
    }
    return ApiService._instance;
  }

  public setApiBaseUrl(url: string) {
    let baseUrl = url.endsWith("/") ? url.slice(0, -1) : url;
    this._apiBaseUrl = baseUrl;
  }

  public get apiBaseUrl(): string {
    return this._apiBaseUrl;
  }

  public get chatApi(): string {
    return `${this._apiBaseUrl}/api/chat-flow/aikaze-ai-chatbot`;
  }
}

export const apiService = ApiService.getInstance();
