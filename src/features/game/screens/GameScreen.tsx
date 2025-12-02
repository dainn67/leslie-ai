import React, { useEffect, useState } from "react";
import TTSInstance from "../../../core/service/ttsService";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { useAppTheme } from "../../../theme";
import { AppBar } from "../../../components/AppBar";
import { Ionicons } from "@expo/vector-icons";
import { QuestionView } from "../../chatbot/components/chatBubble/QuestionView";
import { ProgressBar } from "../../../components/ProgressBar";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ScrollView } from "react-native-gesture-handler";
import { useAppDispatch, useAppSelector } from "../../../hooks/hooks";
import { RootState } from "../../../core/app/store";
import { setIndex, initGame, setSelectedAnswer, updateBookmark } from "../slice/gameSlice";
import { CustomText } from "../../../components/text/customText";
import { insertQuestions, deleteQuestions } from "../../../storage/database/tables";
import { ChatbotBottomSheet } from "../../../components/bottomsheets/ChatbotBottomSheet";
import { RootStackParamList } from "../../../core/app/RootNavigator";
import { Question } from "../../../models";
import { useTranslation } from "react-i18next";
import { SafeAreaView } from "react-native-safe-area-context";

type GameScreenRouteProp = RouteProp<RootStackParamList, "GameScreen">;
type GameScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, "GameScreen">;

export enum GameType {
  Diagnostic = "diagnostic",
  Practice = "practice",
}

export type GameProps = {
  gameType: GameType;
  questions: Question[];
};

export const GameScreen = () => {
  const route = useRoute<GameScreenRouteProp>();

  const { questions, gameType } = route.params;
  const { colors } = useAppTheme();
  const { t } = useTranslation();

  const questionList = useAppSelector((state: RootState) => state.game.questions);

  const currentQuestionIndex = useAppSelector((state: RootState) => state.game.currentQuestionIndex);
  const mapAnswerIds = useAppSelector((state: RootState) => state.game.selectedAnswers);
  const bookmarkIds = useAppSelector((state: RootState) => state.game.bookmarkedQuestions);

  const question = questionList[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questionList.length) * 100;

  const navigation = useNavigation<GameScreenNavigationProp>();

  const [autoMode, setAutoMode] = useState(false);
  const [playAudio, setPlayAudio] = useState(false);
  const [isChatbotVisible, setIsChatbotVisible] = useState(false);

  const dispatch = useAppDispatch();

  const handleAnswerSelect = (answerId: number) => {
    dispatch(setSelectedAnswer(answerId));
  };

  useEffect(() => {
    dispatch(initGame(questions));
  }, []);

  // Auto mode
  useEffect(() => {
    if (autoMode) {
      const randomAnswerId = Math.floor(Math.random() * question.answers.length);
      setTimeout(() => {
        dispatch(setSelectedAnswer(randomAnswerId));
      }, 50);

      if (currentQuestionIndex < questionList.length - 1) {
        setTimeout(() => {
          handleChangeQuestion("next");
        }, 100);
      } else {
        navigation.replace("ResultScreen", {
          questions,
          gameType,
          mapAnswerIds,
        });
      }
    }
  }, [autoMode, currentQuestionIndex]);

  const handleBookmarkPress = (isBookmarked: boolean) => {
    dispatch(updateBookmark({ questionId: question.questionId, isBookmarked }));

    // Update database
    if (isBookmarked) {
      insertQuestions([question]);
    } else {
      deleteQuestions([question.questionId]);
    }
  };

  const handleChangeQuestion = (direction: "next" | "prev") => {
    TTSInstance.stop();
    setPlayAudio(false);

    // Check submit
    if (direction == "next" && currentQuestionIndex === questionList.length - 1) {
      navigation.replace("ResultScreen", {
        questions,
        gameType,
        mapAnswerIds,
      });
      return;
    }

    // Change question
    if (direction === "next") {
      dispatch(setIndex(currentQuestionIndex + 1));
    } else {
      dispatch(setIndex(currentQuestionIndex - 1));
    }
  };

  const handleDevClick = () => setAutoMode(true);

  return (
    <SafeAreaView style={[style.container, { backgroundColor: colors.background }]}>
      <AppBar
        title={t("question")}
        leftIcon={<Ionicons name="arrow-back" size={24} color="white" />}
        onLeftPress={() => navigation.pop()}
        onDevClick={handleDevClick}
      />
      {question ? (
        <>
          <View style={style.progressBar}>
            <ProgressBar progress={progress} />
          </View>
          <ScrollView style={style.questionContainer}>
            <QuestionView
              questionIndex={currentQuestionIndex}
              question={question}
              gameType={gameType}
              totalQuestions={questionList.length}
              selectedAnswer={mapAnswerIds[question.questionId]}
              bookmarked={bookmarkIds.includes(question.questionId)}
              playAudio={playAudio}
              onAnswerSelect={handleAnswerSelect}
              onBookmarkPress={handleBookmarkPress}
              setPlayAudio={setPlayAudio}
            />
          </ScrollView>

          <TouchableOpacity style={style.floatingButton} onPress={() => setIsChatbotVisible(true)}>
            <Ionicons name="chatbubble-ellipses" size={24} color="white" />
          </TouchableOpacity>

          <View style={style.buttonContainer}>
            <TouchableOpacity
              style={[style.navButton, style.prevButton, currentQuestionIndex === 0 && style.disabledButton]}
              onPress={() => handleChangeQuestion("prev")}
              disabled={currentQuestionIndex === 0}
            >
              <CustomText
                style={[style.navButtonText, style.navButtonTextPrev, currentQuestionIndex === 0 && style.disabledButtonText]}
              >
                {t("previous")}
              </CustomText>
            </TouchableOpacity>

            <TouchableOpacity style={[style.navButton, style.nextButton]} onPress={() => handleChangeQuestion("next")}>
              <CustomText style={[style.navButtonText, style.navButtonTextNext]}>{t("next")}</CustomText>
            </TouchableOpacity>
          </View>

          <ChatbotBottomSheet visible={isChatbotVisible} question={question} onClose={() => setIsChatbotVisible(false)} />
        </>
      ) : (
        <View style={[style.container, { backgroundColor: colors.background, justifyContent: "center", alignItems: "center" }]}>
          <CustomText>{t("game_screen_error_loading_question")}</CustomText>
        </View>
      )}
    </SafeAreaView>
  );
};

const style = StyleSheet.create({
  container: {
    flex: 1,
  },
  progressBar: {
    marginTop: 16,
    marginBottom: 8,
    marginHorizontal: 24,
  },
  questionContainer: {
    flex: 1,
    paddingHorizontal: 16,
    marginTop: 16,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginBottom: 32,
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
    marginRight: 8,
  },
  nextButton: {
    backgroundColor: "#4A90E2",
    marginLeft: 8,
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
  floatingButton: {
    position: "absolute",
    right: 16,
    bottom: 150,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#4A90E2",
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});
