import * as StoreReview from "expo-store-review";
import { ToastService } from "..";
import { loadFromAsyncStorage, saveToAsyncStorage } from "../../../storage/asyncStorage/asyncStorage";
import { AsyncStorageConstants } from "../../../storage/asyncStorage/asyncStorageConstant";
import { AppConfig } from "../../../constants";

class ReviewService {
  private static instance: ReviewService;

  private constructor() {
    this._loadPreviousReviewTime();
  }

  private previousReviewPopup: number = -1;
  private alreadyConfirmReview: boolean = false;

  private async _loadPreviousReviewTime() {
    try {
      const savedTime = await loadFromAsyncStorage(AsyncStorageConstants.PREVIOUS_REVIEW_TIME);
      const alreadyConfirmReview = await loadFromAsyncStorage(AsyncStorageConstants.ALREADY_CONFIRM_REVIEW);

      if (savedTime !== null) {
        this.previousReviewPopup = savedTime;
        this.alreadyConfirmReview = alreadyConfirmReview ?? false;
      }
    } catch (e) {
      console.log("Failed to load previous review time:", e);
    }
  }

  public static getInstance(): ReviewService {
    if (!ReviewService.instance) {
      ReviewService.instance = new ReviewService();
    }
    return ReviewService.instance;
  }

  public canRequestAppReview() {
    const currentTime = Date.now();
    const delayDays = this.alreadyConfirmReview ? 10 : 1;
    if (currentTime - this.previousReviewPopup < 1000 * 60 * 60 * 24 * delayDays) {
      return false;
    }

    return true;
  }

  public async requestAppReview() {
    const currentTime = Date.now();
    await saveToAsyncStorage(AsyncStorageConstants.PREVIOUS_REVIEW_TIME, currentTime);
    await saveToAsyncStorage(AsyncStorageConstants.ALREADY_CONFIRM_REVIEW, true);

    try {
      const available = await StoreReview.hasAction();
      if (available) {
        await StoreReview.requestReview();
        if (AppConfig.devMode) console.log("(ReviewService) requestAppReview");
      } else {
        ToastService.show({ message: "Rating popup not available", type: "error" });
      }
    } catch (e) {
      console.warn("Rating popup error:", e);
    }
  }

  public async ignoreAppReview() {
    const currentTime = Date.now();
    await saveToAsyncStorage(AsyncStorageConstants.PREVIOUS_REVIEW_TIME, currentTime);
  }
}

export default ReviewService.getInstance();
