import React, { useEffect, useState } from "react";
import MainButton from "../../../components/buttons/MainButton";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AppBar } from "../../../components/AppBar";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import { Question, QuestionType, QuestionTypeTitles } from "../../../models/question";
import { Dimensions, StyleSheet, TouchableOpacity, View } from "react-native";
import { useAppTheme } from "../../../theme";
import { CustomText } from "../../../components/text/customText";
import { ToastService } from "../../../core/service/toastService";
import { QuestionNumberSelector } from "../components/QuestionNumberSelector";
import { FirebaseService, getAllQuestions } from "../../../core/service";
import { FirebaseConstants } from "../../../constants";
import { RootStackParamList } from "../../../app/RootNavigator";
import { GameType } from "../../game/screens/GameScreen";

export const QuestionsScreen = () => {
  // Drawer & navigation
  const navigation = useNavigation<DrawerNavigationProp<RootStackParamList, "Main">>();

  // UI
  const [amountSelectorVisible, setAmountSelectorVisible] = useState(false);
  const { colors } = useAppTheme();
  const { width } = Dimensions.get("window");
  const gridItemWidth = (width - 60) / 2;

  // Data
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);

  useEffect(() => {
    const allQuestions = getAllQuestions();
    setAllQuestions(allQuestions);
  }, []);

  const handleOpenDrawer = () => {
    FirebaseService.logEvent(FirebaseConstants.OPEN_MENU);
    navigation.openDrawer();
  };

  const handleNavigateToQuestionType = (type: QuestionType) => {
    FirebaseService.logEvent(FirebaseConstants.OPEN_QUESTION_TYPE_BOX, { type });
    navigation.navigate("QuestionListScreen", { type });
  };

  const handleReviewAll = () => {
    if (allQuestions.length > 0) {
      setAmountSelectorVisible(true);
    } else {
      ToastService.show({ message: "Bạn chưa lưu câu hỏi nào", type: "error" });
    }
  };

  const handleSelectQuestion = (amount: number) => {
    const questions = allQuestions.slice(0, amount);
    FirebaseService.logEvent(FirebaseConstants.REVIEW_ALL_QUESTIONS, { amount });
    navigation.navigate("GameScreen", { props: { questions, gameType: GameType.Practice } });
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AppBar
        title={"Câu hỏi đã lưu"}
        leftIcon={<Ionicons name="menu" size={24} color="white" />}
        onLeftPress={handleOpenDrawer}
      />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.gridContainer}>
          {Object.values(QuestionType).map((type, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.gridItem, { width: gridItemWidth, backgroundColor: colors.primary }]}
              onPress={() => handleNavigateToQuestionType(type)}
            >
              <CustomText style={styles.icon}>
                {type === QuestionType.Vocabulary && "📝"}
                {type === QuestionType.Grammar && "📚"}
                {type === QuestionType.Reading && "📖"}
                {type === QuestionType.Listening && "🎧"}
              </CustomText>
              <CustomText style={{ textAlign: "center", color: colors.textOnPrimary }}>{QuestionTypeTitles[type]}</CustomText>
            </TouchableOpacity>
          ))}
        </View>
        <MainButton title={"Ôn tập tổng hợp"} style={styles.buttonContainer} onPress={handleReviewAll} />

        {/* Question number selector */}
        <QuestionNumberSelector
          totalQuestions={allQuestions.length}
          visible={amountSelectorVisible}
          setVisible={setAmountSelectorVisible}
          onSelectQuestion={(amount) => handleSelectQuestion(amount)}
        />
      </View>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gridContainer: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    padding: 10,
  },
  icon: {
    fontSize: 40,
    marginBottom: 12,
  },
  buttonContainer: {
    marginHorizontal: 16,
    marginVertical: 8,
    alignItems: "center",
  },
  gridItem: {
    height: 180,
    margin: 10,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});
