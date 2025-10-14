export type FlashCard = {
  flashCardId: number;
  front: string;
  back: string;
  explanation: string;
  level: string;
  lastUpdate: number;
};

export const createFlashCard = (partial?: Partial<FlashCard>): FlashCard => {
  return {
    flashCardId: partial?.flashCardId ?? Date.now(),
    front: partial?.front ?? "",
    back: partial?.back ?? "",
    explanation: partial?.explanation ?? "",
    level: partial?.level ?? "",
    lastUpdate: partial?.lastUpdate ?? Date.now(),
  };
};
