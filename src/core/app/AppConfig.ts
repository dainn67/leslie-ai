import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { BaseAppConfig } from "../../constants/baseAppConfig";

export interface AppConfigState {
  devMode: boolean;
}

const initialState: AppConfigState = {
  devMode: BaseAppConfig.devMode,
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
