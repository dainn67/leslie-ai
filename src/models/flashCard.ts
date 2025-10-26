export type Flashcard = {
  flashcardId: number;
  front: string;
  back: string;
  explanation: string;
  level: string;
  lastUpdate: number;
};

export const createFlashcard = (partial?: Partial<Flashcard>): Flashcard => {
  return {
    flashcardId: partial?.flashcardId ?? Date.now(),
    front: partial?.front ?? "",
    back: partial?.back ?? "",
    explanation: partial?.explanation ?? "",
    level: partial?.level ?? "",
    lastUpdate: partial?.lastUpdate ?? Date.now(),
  };
};
