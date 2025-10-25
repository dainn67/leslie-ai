import React from "react";
import { View, Text } from "react-native";
import { Flashcard } from "../../../../models";
import { FlipCard } from "../../../flashcard/component/FlipCard";

interface FlashcardsMessageProps {
  flashcards: Flashcard[];
}

export const FlashcardsMessage = ({ flashcards }: FlashcardsMessageProps) => {
  return (
    <View>
      {flashcards.map((f) => (
        <FlipCard front={f.front} back={f.back} />
      ))}
    </View>
  );
};
