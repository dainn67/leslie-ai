import { getTestsFromQuery } from "../../../utils";

export const getDiagnosticTest = () => {
  const query = `SELECT * FROM Test WHERE type = 'diagnostic'`;
  const tests = getTestsFromQuery(query);
  if (tests.length === 0) return null;

  return tests[0];
};
