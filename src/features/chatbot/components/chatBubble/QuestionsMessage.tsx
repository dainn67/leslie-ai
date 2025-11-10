import React, { useEffect, useState } from "react";
import TTSInstance from "../../../../core/service/ttsService";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { CustomText } from "../../../../components/text/customText";
import { Question } from "../../../../models/question";
import { QuestionView } from "./QuestionView";
import { ProgressBar } from "../../../../components/ProgressBar";
import { deleteQuestions, insertQuestions } from "../../../../storage/database/tables/questionTable";
import { createResultSummary, FirebaseService } from "../../../../core/service";
import { IconButton } from "../../../../components/buttons";
import { AppIcons } from "../../../../constants/appIcons";
import { FirebaseConstants } from "../../../../constants";
import { useTranslation } from "react-i18next";

interface QuestionsMessageProps {
  questions: Question[];
  onAnalyze?: (summary: string) => void;
}

export const QuestionsMessage = ({ questions, onAnalyze }: QuestionsMessageProps) => {
  // Use local state only for separated question messages
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [analyzed, setAnalyzed] = useState(false);
  const [mapAnswer, setMapAnswer] = useState<{ [key: number]: number }>({});
  const [mapBookmark, setMapBookmark] = useState<boolean[]>(questions.map(() => false));
  const [playAudio, setPlayAudio] = useState(false);
  const { t } = useTranslation();
  
  useEffect(() => {
    // Analyze when all questions are answered
    if (!analyzed) {
      if (Object.keys(mapAnswer).length === questions.length) {
        const summary = createResultSummary(questions, mapAnswer);
        onAnalyze?.(summary);
        setAnalyzed(true);
      }
    }
  }, [mapAnswer, questions]);

  const question = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  const handleAnswerSelect = (index: number) => {
    setMapAnswer({ ...mapAnswer, [question.questionId]: index });
  };

  const handleBookmarkPress = (isBookmarked: boolean) => {
    setMapBookmark((prev) => {
      const newMap = [...prev];
      newMap[currentQuestionIndex] = isBookmarked;
      return newMap;
    });

    if (isBookmarked) {
      FirebaseService.logEvent(FirebaseConstants.SAVE_GENERATED_QUESTION);
      insertQuestions([question]);
    } else {
      deleteQuestions([question.questionId]);
    }
  };

  const handleChangeQuestion = (direction: "next" | "prev") => {
    TTSInstance.stop();
    setPlayAudio(false);

    const newIndex = direction === "next" ? currentQuestionIndex + 1 : currentQuestionIndex - 1;
    setCurrentQuestionIndex(newIndex);
  };

  const handleReset = () => {
    setCurrentQuestionIndex(0);
    setMapAnswer({});
  };

  return (
    <View style={styles.container}>
      {/* Progress Bar and Reset Button */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBarContainer}>
          <ProgressBar progress={progress} height={7} />
        </View>
        <IconButton icon={AppIcons.reset} onPress={handleReset} />
      </View>

      <QuestionView
        question={question}
        questionIndex={currentQuestionIndex}
        totalQuestions={questions.length}
        bookmarked={mapBookmark[question.questionId]}
        selectedAnswer={mapAnswer[question.questionId]}
        playAudio={playAudio}
        onAnswerSelect={handleAnswerSelect}
        onBookmarkPress={handleBookmarkPress}
        setPlayAudio={setPlayAudio}
      />

      {/* Navigation */}
      <View style={styles.navigationContainer}>
        <TouchableOpacity
          style={[styles.navButton, styles.prevButton, currentQuestionIndex === 0 && styles.disabledButton]}
          onPress={() => handleChangeQuestion("prev")}
          disabled={currentQuestionIndex === 0}
        >
          <CustomText
            style={[styles.navButtonText, styles.navButtonTextPrev, currentQuestionIndex === 0 && styles.disabledButtonText]}
          >
            {t("previous")}
          </CustomText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navButton, styles.nextButton, currentQuestionIndex === questions.length - 1 && styles.disabledButton]}
          onPress={() => handleChangeQuestion("next")}
          disabled={currentQuestionIndex === questions.length - 1}
        >
          <CustomText
            style={[
              styles.navButtonText,
              styles.navButtonTextNext,
              currentQuestionIndex === questions.length - 1 && styles.disabledButtonText,
            ]}
          >
            {t("next")}
          </CustomText>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    flex: 1,
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    alignContent: "center",
    marginBottom: 8,
  },
  progressBarContainer: {
    flex: 1,
    marginLeft: 8,
    marginRight: 12,
  },
  resetButton: {
    backgroundColor: "#F8F9FA",
    padding: 4,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: "#E8E8E8",
    marginRight: 4,
  },
  progressTextContainer: {
    minWidth: 50,
  },
  navigationContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  navButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  prevButton: {
    backgroundColor: "#F8F9FA",
    borderWidth: 1,
    borderColor: "#E8E8E8",
  },
  nextButton: {
    backgroundColor: "#4A90E2",
  },
  disabledButton: {
    backgroundColor: "#F5F5F5",
    borderColor: "#E0E0E0",
  },
  navButtonText: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  navButtonTextPrev: {
    color: "black",
  },
  navButtonTextNext: {
    color: "white",
  },
  disabledButtonText: {
    color: "#BDBDBD",
  },
});
