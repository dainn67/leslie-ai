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

export const updateUserProgress = createAsyncThunk(
  "userProgress/updateUserProgress",
  async (payload: Partial<UserProgress> & { newAnalytic?: string }, { getState }) => {
    const state = getState() as { userProgress: UserProgressState };
    const current = state.userProgress.userProgress;

    const { newAnalytic, ...rest } = payload;

    let updatedUserProgress = { ...current, ...rest };

    if (newAnalytic) {
      const now = normalizeDate(new Date()).toString();
      updatedUserProgress = {
        ...updatedUserProgress,
        analytic: {
          ...(updatedUserProgress.analytic || {}),
          [now]: newAnalytic,
        },
      };
    }

    updatedUserProgress.lastUpdated = Date.now();

    // Persist async
    await UserProgressService.setUserProgressToStorage(updatedUserProgress);

    return updatedUserProgress;
  }
);

export const clearUserProgress = createAsyncThunk("userProgress/clearUserProgress", async (partial?: Partial<UserProgress>) => {
  const newProgress = createUserProgress(partial);
  await UserProgressService.setUserProgressToStorage(newProgress);
  return newProgress;
});

const userProgressSlice = createSlice({
  name: "userProgress",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadUserProgress.fulfilled, (state, action: PayloadAction<UserProgress>) => {
        state.userProgress = action.payload;
      })
      .addCase(updateUserProgress.fulfilled, (state, action: PayloadAction<UserProgress>) => {
        state.userProgress = action.payload;
      })
      .addCase(clearUserProgress.fulfilled, (state, action: PayloadAction<UserProgress>) => {
        state.userProgress = action.payload;
      });
  },
});

export default userProgressSlice.reducer;
