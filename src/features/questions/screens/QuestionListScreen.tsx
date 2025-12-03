import React, { useCallback, useRef, useState } from "react";
import MainButton from "../../../components/buttons/MainButton";
import { View, StyleSheet, ScrollView, Animated, TextInput } from "react-native";
import { Question, QuestionType, QuestionTypeTitles } from "../../../models/question";
import { AppBar } from "../../../components/AppBar";
import { Ionicons } from "@expo/vector-icons";
import { RouteProp, useNavigation, useRoute, useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { QuestionView } from "../../chatbot/components/chatBubble/QuestionView";
import { QuestionNumberSelector } from "../components/QuestionNumberSelector";
import { deleteQuestions, getQuestionsByType, insertQuestions } from "../../../storage/database/tables";
import { SimpleTextInput } from "../../../components/input/SimpleTextInput";
import { useAppTheme } from "../../../theme";
import { CustomText } from "../../../components/text/customText";
import { createReviseQuestionSet, FirebaseService } from "../../../core/service";
import { RootStackParamList } from "../../../core/app/RootNavigator";
import { GameType } from "../../game/screens/GameScreen";
import { FirebaseConstants } from "../../../constants";
import { useTranslation } from "react-i18next";
import { SafeAreaView } from "react-native-safe-area-context";
import { BannerAds } from "../../ads/BannerAds";

type QuestionListScreenRouteProp = RouteProp<RootStackParamList, "QuestionListScreen">;
type QuestionListScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, "QuestionListScreen">;

export const QuestionListScreen = () => {
  const navigation = useNavigation<QuestionListScreenNavigationProp>();
  const route = useRoute<QuestionListScreenRouteProp>();
  const { colors } = useAppTheme();
  const { t } = useTranslation();
  const { type } = route.params as { type: QuestionType };
  const questionTypeTitles = QuestionTypeTitles();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);

  const [amountSelectorVisible, setAmountSelectorVisible] = useState(false);
  const [searchWord, setSearchWord] = useState("");
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [searchAnimation] = useState(new Animated.Value(0));

  // Local state to update the question after leave this screen
  const [listBookmarked, setListBookmarked] = useState<number[]>([]);
  const [listPlayAudio, setListPlayAudio] = useState<number[]>([]);

  const inputRef = useRef<TextInput>(null);

  useFocusEffect(
    useCallback(() => {
      const questions = getQuestionsByType(type);
      setQuestions(questions);
      setFilteredQuestions(questions);
      setListBookmarked(questions.map((q) => q.questionId));
    }, [])
  );

  const handleSelectQuestion = (amount: number) => {
    FirebaseService.logClickEvent(FirebaseConstants.REVIEW_QUESTION_SET, { amount });

    const selectedQuestions = createReviseQuestionSet(questions, amount);
    navigation.navigate("GameScreen", { questions: selectedQuestions, gameType: GameType.Practice });
  };

  const handleBookmarkPress = (isBookmarked: boolean, question: Question) => {
    // Update database
    if (isBookmarked) {
      setListBookmarked((prevState) => {
        if (!prevState.includes(question.questionId)) {
          return [...prevState, question.questionId];
        }
        return prevState;
      });
      insertQuestions([question]);
    } else {
      setListBookmarked((prevState) => prevState.filter((id) => id !== question.questionId));
      deleteQuestions([question.questionId]);
    }
  };

  const handleOpenSearch = () => {
    if (isSearchVisible) {
      Animated.timing(searchAnimation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start(() => {
        setIsSearchVisible(false);
      });
    } else {
      FirebaseService.logClickEvent(FirebaseConstants.OPEN_SEARCH);

      setIsSearchVisible(true);
      Animated.timing(searchAnimation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
      }).start(() => {
        inputRef.current?.focus();
      });
    }
  };

  const handleSearch = (text: string) => {
    setSearchWord(text);
    const searchText = text.toLowerCase();

    if (searchText.length === 0) {
      setFilteredQuestions(questions);
    } else {
      const filteredQuestions = questions.filter((q) => {
        const questionText = q.question.toLowerCase();
        const answerText = q.answers.map((a) => a.text.toLowerCase()).join(". ");
        const explanationText = q.explanation.toLowerCase();
        return questionText.includes(searchText) || answerText.includes(searchText) || explanationText.includes(searchText);
      });
      setFilteredQuestions(filteredQuestions);
    }
  };

  const handleSetPlayAudio = (playAudio: boolean, question: Question) => {
    setListPlayAudio((prevState) => {
      if (playAudio) {
        return [...prevState, question.questionId];
      }
      return prevState.filter((id) => id !== question.questionId);
    });
  };

  const handleNavigateToChatbotScreen = () => {
    FirebaseService.logClickEvent(FirebaseConstants.START_CREATING_QUESTIONS);
    navigation.navigate("Main", { initialMessage: `Tạo câu hỏi mới về ${questionTypeTitles[type]}` });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <AppBar
        title={questionTypeTitles[type]}
        leftIcon={<Ionicons name="arrow-back" size={24} color="white" />}
        rightIcon={<Ionicons name={isSearchVisible ? "search-circle-outline" : "search"} size={24} color="white" />}
        onLeftPress={() => navigation.pop()}
        onRightPress={handleOpenSearch}
      />

      <View style={[styles.stackContainer, { backgroundColor: colors.background }]}>
        {filteredQuestions.length > 0 ? (
          <ScrollView style={styles.questionListContainer}>
            {filteredQuestions.map((question, index) => (
              <View
                key={index}
                style={[styles.questionContainer, { marginBottom: index === filteredQuestions.length - 1 ? 16 : 0 }]}
              >
                <QuestionView
                  question={question}
                  questionIndex={index}
                  totalQuestions={questions.length}
                  bookmarked={listBookmarked.includes(question.questionId)}
                  showCorrectAnswer={true}
                  playAudio={listPlayAudio.includes(question.questionId)}
                  setPlayAudio={(playAudio) => handleSetPlayAudio(playAudio, question)}
                  onBookmarkPress={(isBookmarked) => handleBookmarkPress(isBookmarked, question)}
                />
              </View>
            ))}
          </ScrollView>
        ) : (
          <View style={styles.emptyContainer}>
            <CustomText style={styles.emptyText}>{t("questions_screen_empty_title")}</CustomText>
            <MainButton
              title={t("create_new_question")}
              style={{ borderRadius: 100, marginTop: 16 }}
              onPress={handleNavigateToChatbotScreen}
            />
          </View>
        )}

        <View style={styles.bannerContainer}>
          <BannerAds />
        </View>

        {filteredQuestions.length > 0 && (
          <MainButton
            title={t("practice")}
            style={styles.buttonContainer}
            textStyle={{ color: "white" }}
            disabled={filteredQuestions.length === 0}
            onPress={() => setAmountSelectorVisible(true)}
          />
        )}

        {/* Animated Search input */}
        {isSearchVisible && (
          <Animated.View
            style={[
              styles.searchContainer,
              {
                opacity: searchAnimation,
                transform: [
                  {
                    translateY: searchAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-20, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <View style={styles.searchInputWrapper}>
              <SimpleTextInput
                value={searchWord}
                inputRef={inputRef}
                onChangeText={handleSearch}
                placeholder={t("question_search_placeholder")}
              />
            </View>
          </Animated.View>
        )}
      </View>

      {/* Question number selector */}
      <QuestionNumberSelector
        totalQuestions={questions.length}
        visible={amountSelectorVisible}
        setVisible={setAmountSelectorVisible}
        onSelectQuestion={(amount) => handleSelectQuestion(amount)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  stackContainer: {
    flex: 1,
    position: "relative",
  },
  searchContainer: {
    position: "absolute",
    width: "100%",
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    alignContent: "center",
  },
  emptyText: {
    marginHorizontal: 16,
    textAlign: "center",
  },
  questionListContainer: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 8,
  },
  questionContainer: {
    paddingHorizontal: 8,
  },
  buttonContainer: {
    borderRadius: 16,
    marginHorizontal: 16,
    marginVertical: 8,
  },
  bannerContainer: {
    alignItems: "center",
    marginTop: 8,
  },
  searchInputWrapper: {
    backgroundColor: "white",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#dee2e6",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
});
