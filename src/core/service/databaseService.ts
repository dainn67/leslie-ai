import {
  createQuestionTable,
  createTestQuestionTable,
  createTestTable,
  updateQuestionTables,
  updateTestQuestionTables,
  updateTestTables,
} from "../../storage/database/tables";

export const createTables = () => {
  createQuestionTable();
  createTestTable();
  createTestQuestionTable();
};

export const updateTables = () => {
  updateQuestionTables();
  updateTestTables();
  updateTestQuestionTables();
};
