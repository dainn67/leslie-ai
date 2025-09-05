import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AsyncStorageService } from "../../core/service/asyncStorageService";

export type ThemeMode = "light" | "dark" | "system";

interface ThemeState {
  mode: ThemeMode;
}

const initialState: ThemeState = {
  mode: "light",
};

export const themeSlice = createSlice({
  name: "themeSlice",
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<"light" | "dark">) => {
      state.mode = action.payload;
    },
    toggleTheme: (state) => {
      if (state.mode === "light") {
        state.mode = "dark";
      } else {
        state.mode = "light";
      }

      AsyncStorageService.setTheme(state.mode);
    },
  },
});

export const { setTheme, toggleTheme } = themeSlice.actions;
export default themeSlice.reducer;
