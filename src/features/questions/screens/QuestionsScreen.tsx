import React, { useEffect, useState } from "react";
import MainButton from "../../../components/buttons/MainButton";
import { AppBar } from "../../../components/AppBar";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, CompositeNavigationProp } from "@react-navigation/native";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Question, QuestionType, QuestionTypeTitles } from "../../../models/question";
import { Dimensions, StyleSheet, TouchableOpacity, View } from "react-native";
import { useAppTheme } from "../../../theme";
import { CustomText } from "../../../components/text/customText";
import { ToastService } from "../../../core/service/toastService";
import { QuestionNumberSelector } from "../components/QuestionNumberSelector";
import { FirebaseService } from "../../../core/service";
import { FirebaseConstants } from "../../../constants";
import { RootStackParamList } from "../../../core/app/RootNavigator";
import { DrawerParamList } from "../../../core/app/DrawerNavigator";
import { GameType } from "../../game/screens/GameScreen";
import { getAllQuestions } from "../../../storage/database/tables";
import { useTranslation } from "react-i18next";
import { SafeAreaView } from "react-native-safe-area-context";

type QuestionsScreenNavigationProp = CompositeNavigationProp<
  DrawerNavigationProp<DrawerParamList, "QuestionsScreen">,
  NativeStackNavigationProp<RootStackParamList>
>;

export const QuestionsScreen = () => {
  // Drawer & navigation
  const navigation = useNavigation<QuestionsScreenNavigationProp>();

  // UI
  const [amountSelectorVisible, setAmountSelectorVisible] = useState(false);
  const { colors } = useAppTheme();
  const { width } = Dimensions.get("window");
  const { t } = useTranslation();
  const gridItemWidth = (width - 60) / 2;

  // Data
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const questionTypeTitles = QuestionTypeTitles();

  useEffect(() => {
    const allQuestions = getAllQuestions();
    setAllQuestions(allQuestions);
  }, []);

  const handleOpenDrawer = () => {
    FirebaseService.logClickEvent(FirebaseConstants.OPEN_MENU);
    navigation.openDrawer();
  };

  const handleNavigateToQuestionType = (type: QuestionType) => {
    FirebaseService.logClickEvent(FirebaseConstants.OPEN_QUESTION_TYPE_BOX, { type });
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
    FirebaseService.logClickEvent(FirebaseConstants.REVIEW_ALL_QUESTIONS, { amount });
    navigation.navigate("GameScreen", { questions, gameType: GameType.Practice });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <AppBar
        title={t("drawer_saved_question_title")}
        leftIcon={<Ionicons name="menu" size={24} color="white" />}
        onLeftPress={handleOpenDrawer}
      />

      {/* Grid of question types */}
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
            <CustomText style={{ textAlign: "center", color: colors.textOnPrimary }}>{questionTypeTitles[type]}</CustomText>
          </TouchableOpacity>
        ))}
      </View>

      {/* Review all questions button */}
      <MainButton title={t("review_all_questions")} style={styles.buttonContainer} onPress={handleReviewAll} />

      {/* Question number selector */}
      <QuestionNumberSelector
        totalQuestions={allQuestions.length}
        visible={amountSelectorVisible}
        setVisible={setAmountSelectorVisible}
        onSelectQuestion={(amount) => handleSelectQuestion(amount)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
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
