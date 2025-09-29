import { ApiConfig } from "../../../constants";

export class ApiService {
  private static _instance: ApiService;

  private _apiBaseUrl: string = ApiConfig.difyServerUrl;
  private _apiBaseBakUrl: string = ApiConfig.difyServerUrl;

  private constructor() {}

  static getInstance(): ApiService {
    if (!ApiService._instance) {
      ApiService._instance = new ApiService();
    }
    return ApiService._instance;
  }

  public setApiBaseUrls(url: string, bakUrl: string) {
    this._apiBaseUrl = url;
    this._apiBaseBakUrl = bakUrl;
  }

  public get apiBaseUrl(): string {
    return this._apiBaseUrl;
  }

  public get apiBaseBakUrl(): string {
    return this._apiBaseBakUrl;
  }
}

export default ApiService.getInstance();
