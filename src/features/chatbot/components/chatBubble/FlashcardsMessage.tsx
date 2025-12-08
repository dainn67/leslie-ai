import React, { useState } from "react";
import MainButton from "../../../../components/buttons/MainButton";
import { View, TouchableOpacity, StyleSheet, ViewStyle } from "react-native";
import { Flashcard } from "../../../../models";
import { FlipCard } from "../../../flashcard/component/FlipCard";
import { Ionicons } from "@expo/vector-icons";
import { firebaseService, ToastService } from "../../../../core/service";
import { FirebaseConstants } from "../../../../constants";
import { deleteFlashcards, insertFlashcards } from "../../../../storage/database/tables/flashCardTable";
import { useTranslation } from "react-i18next";
import { useAppTheme } from "../../../../theme";
import { StyleProp } from "react-native";

interface FlashcardsMessageProps {
  flashcards: Flashcard[];
  style?: StyleProp<ViewStyle>;
  onCreateQuestion: () => void;
}

export const FlashcardsMessage = ({ flashcards, onCreateQuestion }: FlashcardsMessageProps) => {
  const { t } = useTranslation();
  const { colors } = useAppTheme();

  const [currentFlashcardIndex, setCurrentFlashcardIndex] = useState(0);
  const [flippedStatus, setFlippedStatus] = useState<boolean[]>(flashcards.map(() => false));
  const [mapBookmark, setMapBookmark] = useState<{ [key: number]: boolean }>({});
  const currentFlashcard = flashcards[currentFlashcardIndex];

  const handleFlip = () => {
    setFlippedStatus((prev) => {
      const newStatus = [...prev];
      newStatus[currentFlashcardIndex] = !newStatus[currentFlashcardIndex];
      return newStatus;
    });
  };

  const handleBookmark = () => {
    const newBookmarkState = !mapBookmark[currentFlashcard.flashcardId];

    setMapBookmark((prev) => {
      const newMap = { ...prev };
      newMap[currentFlashcard.flashcardId] = newBookmarkState;
      return newMap;
    });

    if (newBookmarkState) {
      ToastService.show({ message: "Đã lưu", type: "success" });
      firebaseService.logClickEvent(FirebaseConstants.SAVE_GENERATED_FLASHCARD);
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
      <View style={styles.flashCardSection}>
        {/* Previous Button */}
        <TouchableOpacity style={styles.navButton} onPress={goToPrevious} disabled={currentFlashcardIndex === 0}>
          <Ionicons name="chevron-back" size={32} color={currentFlashcardIndex === 0 ? "#BDBDBD" : "#007AFF"} />
        </TouchableOpacity>

        {/* Flashcard */}
        <View style={styles.flashcardWrapper}>
          <FlipCard
            key={currentFlashcardIndex}
            front={currentFlashcard.front}
            back={currentFlashcard.back}
            flipped={flippedStatus[currentFlashcardIndex]}
            bookmarked={mapBookmark[currentFlashcard.flashcardId]}
            onFlip={handleFlip}
            onBookmark={handleBookmark}
          />
        </View>

        {/* Next Button */}
        <TouchableOpacity style={styles.navButton} onPress={goToNext} disabled={currentFlashcardIndex === flashcards.length - 1}>
          <Ionicons
            name="chevron-forward"
            size={32}
            color={currentFlashcardIndex === flashcards.length - 1 ? "#BDBDBD" : "#007AFF"}
          />
        </TouchableOpacity>
      </View>

      <MainButton
        title={t("chatbot_create_question_from_flashcard")}
        style={{
          ...styles.createQuestionButton,
          borderColor: colors.primary,
          backgroundColor: colors.background,
        }}
        textStyle={{ color: colors.text }}
        onPress={onCreateQuestion}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  flashCardSection: {
    flexDirection: "row",
    alignItems: "stretch",
    justifyContent: "space-between",
    width: "100%",
  },
  flashcardWrapper: {
    flex: 1,
  },
  navButton: {
    justifyContent: "center",
    alignItems: "center",
    width: 50,
    paddingHorizontal: 8,
  },
  createQuestionButton: {
    marginTop: 16,
    borderRadius: 100,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginVertical: 4,
    borderWidth: 1,
  },
});
