import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import { createUserProgress, UserProgress } from "../../models/userProgress";
import { UserProgressService } from "../../core/service";
import { normalizeDate } from "../../utils";

interface UserProgressState {
  userProgress: UserProgress;
}

const initialState: UserProgressState = {
  userProgress: createUserProgress(),
};

// Thunks
export const loadUserProgress = createAsyncThunk("userProgress/load", async () => {
  return await UserProgressService.getUserProgressFromStorage();
});

const userProgressSlice = createSlice({
  name: "userProgress",
  initialState,
  reducers: {
    updateUserProgress: (state, action: PayloadAction<Partial<UserProgress>>) => {
      const { analytic, ...rest } = action.payload;

      state.userProgress = { ...state.userProgress, ...rest };

      if (analytic) {
        const now = normalizeDate(new Date());
        state.userProgress.analytic = {
          ...state.userProgress.analytic,
          [now]: analytic,
        };
      }

      state.userProgress.lastUpdated = Date.now();

      UserProgressService.setUserProgressToStorage(state.userProgress);
    },
    clearUserProgress: (state) => {
      state.userProgress = createUserProgress();
    },
  },
  extraReducers: (builder) => {
    builder.addCase(loadUserProgress.fulfilled, (state, action: PayloadAction<UserProgress>) => {
      state.userProgress = action.payload;
    });
  },
});

export const { updateUserProgress, clearUserProgress } = userProgressSlice.actions;
export default userProgressSlice.reducer;
