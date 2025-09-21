import { TestType } from "../../../models";
import { TestTable } from "../../../storage/database/tables";
import { getTestsFromQuery } from "../../../utils";

export const getDiagnosticTest = () => {
  const query = `SELECT * FROM ${TestTable.tableName} WHERE type = "${TestType.Diagnostic}"`;
  const tests = getTestsFromQuery(query);
  if (!tests || tests.length === 0) {
    console.log("diagnostic test not found");
    return null;
  }

  return tests[0];
};
