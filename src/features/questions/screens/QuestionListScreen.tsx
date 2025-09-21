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
import { deleteQuestion, insertQuestions } from "../../../storage/database/tables";
import { SimpleTextInput } from "../../../components/input/SimpleTextInput";
import { useAppTheme } from "../../../theme";
import { CustomText } from "../../../components/text/customText";
import { createReviseQuestionSet, getQuestionsByType } from "../../../core/service";
import { RootStackParamList } from "../../../app/RootNavigator";

type QuestionListScreenRouteProp = RouteProp<RootStackParamList, "QuestionListScreen">;
type QuestionListScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, "QuestionListScreen">;

export const QuestionListScreen = () => {
  const navigation = useNavigation<QuestionListScreenNavigationProp>();
  const route = useRoute<QuestionListScreenRouteProp>();
  const { colors } = useAppTheme();

  const { type } = route.params as { type: QuestionType };

  const [questions, setQuestions] = useState<Question[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);

  const [amountSelectorVisible, setAmountSelectorVisible] = useState(false);
  const [searchWord, setSearchWord] = useState("");
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [searchAnimation] = useState(new Animated.Value(0));

  // Local state to update the question after leave this screen
  const [listBookmarked, setListBookmarked] = useState<number[]>([]);

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
    const selectedQuestions = createReviseQuestionSet(questions, amount);
    navigation.navigate("GameScreen", { questions: selectedQuestions });
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
      deleteQuestion(question.questionId);
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

  const handleNavigateToChatbotScreen = () => {
    // First navigate to Main screen (which contains the drawer)
    navigation.navigate("Main", {
      initialMessage: `Tạo câu hỏi mới về ${QuestionTypeTitles[type]}`,
    });
  };

  return (
    <View style={styles.container}>
      <AppBar
        title={QuestionTypeTitles[type]}
        leftIcon={<Ionicons name="arrow-back" size={24} color="white" />}
        rightIcon={<Ionicons name={isSearchVisible ? "search-circle-outline" : "search"} size={24} color="white" />}
        onLeftPress={() => navigation.pop()}
        onRightPress={handleOpenSearch}
      />

      <View style={[styles.stackContainer, { backgroundColor: colors.background }]}>
        {filteredQuestions.length > 0 ? (
          <ScrollView style={styles.questionListContainer}>
            {filteredQuestions.map((question, index) => (
              <View key={question.questionId} style={styles.questionContainer}>
                <QuestionView
                  question={question}
                  questionIndex={index}
                  totalQuestions={questions.length}
                  bookmarked={listBookmarked.includes(question.questionId)}
                  showCorrectAnswer={true}
                  onBookmarkPress={(isBookmarked) => handleBookmarkPress(isBookmarked, question)}
                />
              </View>
            ))}
          </ScrollView>
        ) : (
          <View style={styles.emptyContainer}>
            <CustomText style={styles.emptyText}>
              {"Các câu hỏi đã lưu sẽ hiển thị ở đây.\nHiện bạn chưa lưu lại câu hỏi nào"}
            </CustomText>
            <MainButton
              title={"Tạo câu hỏi mới"}
              style={{ borderRadius: 100, marginTop: 16 }}
              onPress={handleNavigateToChatbotScreen}
            />
          </View>
        )}

        {filteredQuestions.length > 0 && (
          <MainButton
            title="Ôn tập"
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
                placeholder="Tìm kiếm câu hỏi..."
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
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
    padding: 16,
  },
  questionContainer: {
    paddingHorizontal: 8,
  },
  buttonContainer: {
    borderRadius: 16,
    margin: 16,
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
