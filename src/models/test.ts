export enum TestType {
  Diagnostic = "diagnostic",
  Practice = "practice",
}

export const TestTypeTitles: Record<TestType, string> = {
  [TestType.Diagnostic]: "Diagnostic",
  [TestType.Practice]: "Practice",
};

export type Test = {
  id: number;
  name: string;
  type: TestType;
  lastUpdate: number;
};

export const createTest = (partial?: Partial<Test>): Test => {
  return {
    id: partial?.id ?? Date.now(),
    name: partial?.name ?? "",
    type: partial?.type ?? TestType.Practice,
    lastUpdate: partial?.lastUpdate ?? Date.now(),
  };
};
