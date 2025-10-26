import { Question } from "../../../models/question";

export const createReviseQuestionSet = (questions: Question[], amount: number): Question[] => {
  return questions.sort(() => Math.random() - 0.5).slice(0, amount);
};

export const createResultSummary = (questions: Question[], mapAnswers: { [key: number]: number }) => {
  let summary = "";

  for (const [index, question] of questions.entries()) {
    let questionString = `Question ${index + 1}: ${question.question}`.replaceAll("\n", " ");
    let answerString = "";

    const answerId = mapAnswers[question.questionId];

    const correctAnswer = question.answers.find((a) => a.isCorrect);
    const userAnswer = question.answers.find((a) => a.answerId === answerId);

    if (answerId === undefined) {
      answerString = "User skip this question";
    } else if (answerId === correctAnswer?.answerId) {
      answerString = `User correctly answered ${userAnswer?.text}`;
    } else {
      answerString = `User answered ${userAnswer?.text} but correct answer is ${correctAnswer?.text}`;
    }

    summary += `${questionString}. ${answerString}. `;
  }

  return summary;
};

export const shuffleQuestionAnswers = (questions: Question[]) => {
  return questions.map((q) => {
    const shuffledAnswers = [...q.answers].sort(() => Math.random() - 0.5);
    return {
      ...q,
      answers: shuffledAnswers,
    };
  });
};
