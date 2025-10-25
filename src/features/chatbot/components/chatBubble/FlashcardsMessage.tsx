import React from "react";
import { View, Text } from "react-native";
import { Flashcard } from "../../../../models";

interface FlashcardsMessageProps {
  flashcards: Flashcard[];
}

export const FlashcardsMessage = ({ flashcards }: FlashcardsMessageProps) => {
  return (
    <View>
      <Text>Flashcards</Text>
    </View>
  );
};
