import React, { useState } from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { Flashcard } from "../../../../models";
import { FlipCard } from "../../../flashcard/component/FlipCard";
import { CustomText } from "../../../../components/text/customText";
import { Ionicons } from "@expo/vector-icons";
import { FirebaseService, ToastService } from "../../../../core/service";
import { FirebaseConstants } from "../../../../constants";
import { deleteFlashcards, insertFlashcards } from "../../../../storage/database/tables/flashCardTable";

interface FlashcardsMessageProps {
  flashcards: Flashcard[];
}

export const FlashcardsMessage = ({ flashcards }: FlashcardsMessageProps) => {
  const [currentFlashcardIndex, setCurrentFlashcardIndex] = useState(0);
  const [flippedStatus, setFlippedStatus] = useState<boolean[]>(flashcards.map(() => false));
  const [mapBookmark, setMapBookmark] = useState<boolean[]>(flashcards.map(() => false));
  const currentFlashcard = flashcards[currentFlashcardIndex];

  const handleFlip = () => {
    setFlippedStatus((prev) => {
      const newStatus = [...prev];
      newStatus[currentFlashcardIndex] = !newStatus[currentFlashcardIndex];
      return newStatus;
    });
  };

  const handleBookmark = (isBookmarked: boolean) => {
    setMapBookmark((prev) => {
      const newMap = [...prev];
      newMap[currentFlashcardIndex] = isBookmarked;
      return newMap;
    });

    if (isBookmarked) {
      ToastService.show({ message: "Đã lưu", type: "success" });
      FirebaseService.logEvent(FirebaseConstants.SAVE_GENERATED_FLASHCARD);
      insertFlashcards([currentFlashcard]);
    } else {
      deleteFlashcards([currentFlashcard.flashcardId]);
    }
  };

  const goToPrevious = () => {
    if (currentFlashcardIndex > 0) {
      setCurrentFlashcardIndex(currentFlashcardIndex - 1);
    }
  };

  const goToNext = () => {
    if (currentFlashcardIndex < flashcards.length - 1) {
      setCurrentFlashcardIndex(currentFlashcardIndex + 1);
    }
  };

  return (
    <View style={styles.container}>
      {/* Previous Button */}
      <TouchableOpacity style={[styles.navButton]} onPress={goToPrevious} disabled={currentFlashcardIndex === 0}>
        <Ionicons name="chevron-back" size={26} color={currentFlashcardIndex === 0 ? "#BDBDBD" : "#007AFF"} />
      </TouchableOpacity>

      {/* Flashcard */}
      <View style={styles.flashcardContainer}>
        <FlipCard
          key={currentFlashcardIndex}
          front={currentFlashcard.front}
          back={currentFlashcard.back}
          flipped={flippedStatus[currentFlashcardIndex]}
          bookmarked={mapBookmark[currentFlashcardIndex]}
          onFlip={handleFlip}
          onBookmark={handleBookmark}
        />
        <CustomText style={styles.counterText}>
          {currentFlashcardIndex + 1} / {flashcards.length}
        </CustomText>
      </View>

      {/* Next Button */}
      <TouchableOpacity style={[styles.navButton]} onPress={goToNext} disabled={currentFlashcardIndex === flashcards.length - 1}>
        <Ionicons
          name="chevron-forward"
          size={26}
          color={currentFlashcardIndex === flashcards.length - 1 ? "#BDBDBD" : "#007AFF"}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    gap: 12,
  },
  flashcardContainer: {
    flex: 1,
    alignItems: "center",
  },
  navButton: {
    width: 48,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 100,
    backgroundColor: "#F0F0F0",
  },
  counterText: {
    marginTop: 4,
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
});
