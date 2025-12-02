import React, { useEffect, useState } from "react";
import TTSInstance from "../../../../core/service/ttsService";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { Question } from "../../../../models/question";
import { QuestionView } from "./QuestionView";
import { ProgressBar } from "../../../../components/ProgressBar";
import { deleteQuestions, insertQuestions } from "../../../../storage/database/tables/questionTable";
import { createResultSummary, FirebaseService } from "../../../../core/service";
import { IconButton } from "../../../../components/buttons";
import { AppIcons } from "../../../../constants/appIcons";
import { FirebaseConstants } from "../../../../constants";
import { useAppTheme } from "../../../../theme";
import { Ionicons } from "@expo/vector-icons";

interface QuestionsMessageProps {
  questions: Question[];
  onAnalyze?: (summary: string) => void;
}

export const QuestionsMessage = ({ questions, onAnalyze }: QuestionsMessageProps) => {
  // Use local state only for separated question messages
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [analyzed, setAnalyzed] = useState(false);
  const [playAudio, setPlayAudio] = useState(false);

  const [mapAnswer, setMapAnswer] = useState<{ [key: number]: number }>({});
  const [mapBookmark, setMapBookmark] = useState<{ [key: number]: boolean }>({});

  const { colors } = useAppTheme();

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
      const newMap: { [key: number]: boolean } = { ...prev };
      newMap[question.questionId] = isBookmarked;
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
          <ProgressBar progress={progress} height={7} backgroundColor={colors.grey} />
        </View>
        <IconButton
          icon={AppIcons.reset}
          onPress={handleReset}
          iconColor={colors.text}
          style={{ backgroundColor: colors.background }}
        />
      </View>

      <View style={styles.questionContainer}>
        {/* Previous Button */}
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => handleChangeQuestion("prev")}
          disabled={currentQuestionIndex === 0}
        >
          <Ionicons name="chevron-back" size={32} color={currentQuestionIndex === 0 ? "#BDBDBD" : "#007AFF"} />
        </TouchableOpacity>

        {/* Question View */}
        <View style={styles.questionViewContainer}>
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
        </View>

        {/* Next Button */}
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => handleChangeQuestion("next")}
          disabled={currentQuestionIndex === questions.length - 1}
        >
          <Ionicons
            name="chevron-forward"
            size={32}
            color={currentQuestionIndex === questions.length - 1 ? "#BDBDBD" : "#007AFF"}
          />
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
    paddingHorizontal: 32,
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
  questionContainer: {
    flex: 1,
    flexDirection: "row",
  },
  navigationContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  navButton: {
    paddingHorizontal: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  questionViewContainer: {
    flex: 1,
  },
});
