import React from "react";
import Tts from "react-native-tts";
import TTSInstance from "../../../../core/service/ttsService";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { CustomText } from "../../../../components/text/customText";
import { Question } from "../../../../models/question";
import { IconButton } from "../../../../components/buttons";
import { AppIcons } from "../../../../constants/appIcons";
import { Answer } from "../../../../models/answer";
import { useAppTheme } from "../../../../theme";
import { ToastService } from "../../../../core/service";
import { GameType } from "../../../game/screens/GameScreen";
import { useDialog } from "../../../../core/providers";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "../../../../hooks/hooks";
import { RootState } from "../../../../core/app/store";

interface QuestionViewProps {
  question: Question;
  questionIndex: number;
  totalQuestions: number;
  selectedAnswer?: number;
  bookmarked: boolean;
  gameType?: GameType;
  showCorrectAnswer?: boolean;
  playAudio: boolean;
  onAnswerSelect?: (index: number) => void;
  onBookmarkPress?: (isBookmarked: boolean) => void;
  setPlayAudio: (playAudio: boolean) => void;
}

export const QuestionView = ({
  question,
  questionIndex,
  totalQuestions,
  selectedAnswer,
  bookmarked,
  gameType,
  showCorrectAnswer,
  playAudio,
  onAnswerSelect,
  onBookmarkPress,
  setPlayAudio,
}: QuestionViewProps) => {
  const { colors, isDarkMode } = useAppTheme();
  const { t } = useTranslation();
  const { devMode } = useAppSelector((state: RootState) => state.appConfig);
  const dialog = useDialog();

  const getAnswerLabel = (index: number) => {
    const labels = ["A", "B", "C", "D"];
    return (labels[index] || "A") + ".";
  };

  const handleToggleAudio = async () => {
    if (!TTSInstance.containJapaneseVoice) {
      dialog.showAlert(t("tts_not_supported"));
      return;
    }

    const newState = !playAudio;
    setPlayAudio(newState);

    await Tts.stop();
    if (newState) TTSInstance.speak(question.audio, () => setPlayAudio(false));
  };

  const handleBookmarkPress = (bookmarked: boolean) => {
    if (bookmarked) ToastService.show({ message: "Đã lưu", type: "success" });
    onBookmarkPress?.(bookmarked);
  };

  const getCorrectAnswerStyle = () => ({
    backgroundColor: colors.successLight,
    borderColor: colors.success,
  });

  const getWrongAnswerStyle = () => ({
    backgroundColor: colors.errorLight,
    borderColor: colors.error,
  });

  const getExplanationStyle = () => ({
    backgroundColor: colors.infoLight,
    borderLeftColor: colors.info,
  });

  return (
    <View style={[styles.questionCard, { backgroundColor: colors.grey }]}>
      <View style={styles.questionHeader}>
        {/* Question index */}
        <CustomText style={[styles.questionNumberText, { color: colors.placeholder }]}>
          {t("question")} {questionIndex + 1}/{totalQuestions}:
        </CustomText>

        {/* Save icon button */}
        <View>
          {gameType !== GameType.Diagnostic && (
            <IconButton
              icon={bookmarked ? AppIcons.bookmarked : AppIcons.bookmark}
              iconColor={colors.text}
              style={{ backgroundColor: colors.grey }}
              onPress={() => handleBookmarkPress(!bookmarked)}
            />
          )}
          {question.audio && <IconButton icon={playAudio ? AppIcons.audioOn : AppIcons.audioOff} onPress={handleToggleAudio} />}
        </View>
      </View>

      {/* Question Text */}
      <CustomText style={[styles.questionText, { color: colors.text }]}>{question.question}</CustomText>

      {/* Answers */}
      <View style={styles.answersContainer}>
        {question.answers.map((a: Answer, index: number) => {
          const isSelected = selectedAnswer === a.answerId;
          const isCorrect = a.isCorrect;
          const shouldShowCorrect =
            (isSelected || showCorrectAnswer || (selectedAnswer !== undefined && selectedAnswer !== a.answerId)) && isCorrect;
          const shouldShowWrong = isSelected && !isCorrect;

          return (
            <TouchableOpacity
              key={index}
              onPress={() => onAnswerSelect?.(a.answerId)}
              style={[
                styles.answerCard,
                {
                  backgroundColor: colors.background,
                  borderColor: isDarkMode ? colors.grey : "transparent",
                },
                shouldShowCorrect && getCorrectAnswerStyle(),
                shouldShowWrong && getWrongAnswerStyle(),
              ]}
              disabled={selectedAnswer !== undefined}
            >
              <View style={styles.answerContent}>
                <CustomText
                  style={[
                    styles.answerLabelText,
                    { color: colors.placeholder },
                    shouldShowWrong && { color: colors.error },
                    shouldShowCorrect && { color: colors.success },
                  ]}
                >
                  {getAnswerLabel(index)}
                </CustomText>
                <CustomText
                  style={[
                    styles.answerText,
                    { color: devMode && isCorrect ? colors.success : colors.text },
                    (shouldShowCorrect || shouldShowWrong) && {
                      fontWeight: "600",
                    },
                  ]}
                >
                  {a.text}
                </CustomText>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Explanation */}
      {selectedAnswer !== undefined && (
        <View style={[styles.explanationContainer, getExplanationStyle()]}>
          <View style={styles.explanationHeader}>
            <CustomText style={styles.explanationIcon}>💡</CustomText>
            <CustomText style={[styles.explanationTitle, { color: colors.text }]}>{t("explanation")}</CustomText>
          </View>
          <CustomText style={[styles.explanationText, { color: colors.text, opacity: 0.8 }]}>{question.explanation}</CustomText>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  questionCard: {
    borderRadius: 16,
    padding: 16,
    paddingBottom: 0,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  questionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  questionNumberText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "bold",
  },
  questionText: {
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
    lineHeight: 24,
    marginBottom: 16,
  },
  answersContainer: {
    marginBottom: 4,
  },
  answerCard: {
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1.5,
    overflow: "hidden",
  },
  answerContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
  },
  answerLabelText: {
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
    marginRight: 12,
    marginVertical: 4,
  },
  answerText: {
    fontSize: 16,
    flex: 1,
    lineHeight: 22,
  },
  explanationContainer: {
    borderRadius: 12,
    padding: 12,
    paddingVertical: 8,
    marginBottom: 16,
  },
  explanationHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  explanationIcon: {
    fontSize: 16,
    marginRight: 4,
  },
  explanationTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  explanationText: {
    fontSize: 14,
    lineHeight: 20,
  },
});
