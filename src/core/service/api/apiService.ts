import { ApiConfig } from "../../../constants";

export class ApiService {
  private static _instance: ApiService;

  private _apiBaseUrl: string = ApiConfig.difyServerUrl;

  private constructor() {}

  static getInstance(): ApiService {
    if (!ApiService._instance) {
      ApiService._instance = new ApiService();
    }
    return ApiService._instance;
  }

  public setApiBaseUrl(url: string) {
    this._apiBaseUrl = url;
  }

  public get apiBaseUrl(): string {
    return this._apiBaseUrl;
  }
}

export default ApiService.getInstance();
