import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { BaseAppConfig } from "../../constants/baseAppConfig";

export interface AppConfigState {
  devMode: boolean;
  showAds: boolean;
}

const initialState: AppConfigState = {
  devMode: BaseAppConfig.devMode,
  showAds: false,
};

export const appConfigSlice = createSlice({
  name: "appConfig",
  initialState,
  reducers: {
    setShowAds: (state, action: PayloadAction<boolean>) => {
      state.showAds = action.payload;
    },
    toggleDevMode: (state) => {
      state.devMode = !state.devMode;
    },
    setDevMode: (state, action: PayloadAction<boolean>) => {
      state.devMode = action.payload;
    },
  },
});

export const { toggleDevMode, setDevMode, setShowAds } = appConfigSlice.actions;

export default appConfigSlice.reducer;
