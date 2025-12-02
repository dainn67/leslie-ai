import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AppConfig as BaseAppConfig } from "../../constants/appConfig";

export interface AppConfigState {
  devMode: boolean;
  name: string;
  fontFamily: string;
  androidPackageName: string;
  version: string;
  buildVersion: string;
}

const initialState: AppConfigState = {
  devMode: BaseAppConfig.devMode,
  name: BaseAppConfig.name,
  fontFamily: BaseAppConfig.fontFamily,
  androidPackageName: BaseAppConfig.androidPackageName,
  version: BaseAppConfig.version ?? "1",
  buildVersion: BaseAppConfig.buildVersion ?? "1.0.0",
};

export const appConfigSlice = createSlice({
  name: "appConfig",
  initialState,
  reducers: {
    toggleDevMode: (state) => {
      state.devMode = !state.devMode;
    },
    setDevMode: (state, action: PayloadAction<boolean>) => {
      state.devMode = action.payload;
    },
  },
});

export const { toggleDevMode, setDevMode } = appConfigSlice.actions;

export default appConfigSlice.reducer;
