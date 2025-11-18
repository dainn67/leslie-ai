import React, { useEffect, useState } from "react";
import MainButton from "../../../components/buttons/MainButton";
import { View, StyleSheet, ScrollView } from "react-native";
import { AppBar } from "../../../components/AppBar";
import { Ionicons } from "@expo/vector-icons";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useAppTheme } from "../../../theme";
import { CustomText } from "../../../components/text/customText";
import { WordComponent } from "../../../components/streamingText/WordComponent";
import { createResultSummary, ChatbotService } from "../../../core/service";
import { RootStackParamList } from "../../../app/RootNavigator";
import { useAppDispatch, useAppSelector } from "../../../hooks/hooks";
import { updateUserProgress } from "../../userProgress/userProgressSlice";

type ResultScreenRouteProp = RouteProp<RootStackParamList, "ResultScreen">;
type ResultScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, "ResultScreen">;

export const ResultScreen = () => {
  const route = useRoute<ResultScreenRouteProp>();
  const navigation = useNavigation<ResultScreenNavigationProp>();
  const { colors } = useAppTheme();

  const { questions, gameType, mapAnswerIds } = route.params;
  const [correctQuestions, setCorrectQuestions] = useState(0);
  const [incorrectQuestions, setIncorrectQuestions] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);

  const [aiInsightWords, setAiInsightWords] = useState<string[]>([]);

  const dispatch = useAppDispatch();

  const userProgress = useAppSelector((state) => state.userProgress.userProgress);

  useEffect(() => {
    let correctQuestions = 0;
    let incorrectQuestions = 0;
    let totalQuestions = questions.length;

    for (const question of questions) {
      const answer = mapAnswerIds[question.questionId];
      if (answer !== undefined && answer === question.answers.find((a) => a.isCorrect)?.answerId) {
        correctQuestions++;
      } else {
        incorrectQuestions++;
      }
    }

    setCorrectQuestions(correctQuestions);
    setIncorrectQuestions(incorrectQuestions);
    setTotalQuestions(totalQuestions);

    const summary = createResultSummary(questions, mapAnswerIds);

    setAiInsightWords([]);

    ChatbotService.sendResultAnalytic({
      message: summary,
      gameType: gameType,
      userName: userProgress.userName,
      onYieldWord: (word) => {
        setAiInsightWords((prev) => [...prev, word]);
      },
      onEvaluateLevel: (level) => {
        dispatch(updateUserProgress({ level }));
      },
    });
  }, []);

  const handleTryAgain = () => {
    navigation.replace("GameScreen", { props: { questions, gameType } });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppBar
        title={"Kết quả"}
        leftIcon={<Ionicons name="arrow-back" size={24} color="white" />}
        onLeftPress={() => navigation.pop()}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Statistics Section */}
        <View style={[styles.statsSection, { backgroundColor: colors.backgroundSecondary }]}>
          <CustomText style={{ color: colors.text, marginBottom: 12 }} weight="SemiBold" size={18}>
            Thống kê chi tiết
          </CustomText>

          <View style={styles.statsGrid}>
            <View style={[styles.statCard, { backgroundColor: colors.backgroundSecondary }]}>
              <View style={[styles.statIcon, { backgroundColor: colors.success }]}>
                <Ionicons name="checkmark" size={20} color={colors.textOnPrimary} />
              </View>
              <CustomText style={{ color: colors.text }} weight="Bold" size={24}>
                {correctQuestions}
              </CustomText>
            </View>

            <View style={[styles.statCard, { backgroundColor: colors.backgroundSecondary }]}>
              <View style={[styles.statIcon, { backgroundColor: colors.alert }]}>
                <Ionicons name="close" size={20} color={colors.textOnPrimary} />
              </View>
              <CustomText style={{ color: colors.text }} weight="Bold" size={24}>
                {incorrectQuestions}
              </CustomText>
            </View>

            <View style={[styles.statCard, { backgroundColor: colors.backgroundSecondary }]}>
              <View style={[styles.statIcon, { backgroundColor: colors.primary }]}>
                <Ionicons name="help-circle" size={20} color={colors.textOnPrimary} />
              </View>
              <CustomText style={{ color: colors.text }} weight="Bold" size={24}>
                {totalQuestions}
              </CustomText>
            </View>
          </View>

          <View style={styles.performanceBar}>
            <View style={[styles.progressBar, { backgroundColor: colors.alert }]}>
              <View
                style={[
                  styles.progressFill,
                  {
                    backgroundColor: colors.success,
                    width: `${(correctQuestions / totalQuestions) * 100}%`,
                  },
                ]}
              />
            </View>
            <CustomText style={[styles.performanceText, { color: colors.text }]} size={14}>
              {correctQuestions}/{totalQuestions} câu trả lời đúng
            </CustomText>
          </View>
        </View>

        {/* AI Insight Section */}
        <View style={[styles.aiInsightSection, { backgroundColor: colors.backgroundSecondary }]}>
          <View style={styles.aiInsightHeader}>
            <View style={{ marginRight: 8 }}>
              <Ionicons name="trending-up" size={16} color={colors.success} />
            </View>

            <CustomText style={{ color: colors.text }} weight="SemiBold" size={18}>
              Phân tích AI
            </CustomText>
          </View>

          <View style={styles.aiInsightItem}>
            {aiInsightWords.map((word, index) => (
              <WordComponent key={index} fontSize={16} word={word} color={colors.text} />
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={[styles.buttonContainer, { backgroundColor: colors.background }]}>
        <MainButton title="Thử lại" onPress={handleTryAgain} style={{ backgroundColor: colors.primary }} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  headerSection: {
    marginTop: 20,
    padding: 24,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  resultCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  resultTitle: {
    marginBottom: 8,
  },
  percentageText: {
    marginBottom: 8,
  },
  statsSection: {
    marginTop: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginHorizontal: 4,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 100,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  performanceBar: {
    marginHorizontal: 8,
    marginTop: 16,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  performanceText: {
    textAlign: "center",
  },
  buttonContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  aiInsightSection: {
    marginTop: 16,
    marginBottom: 20,
    padding: 20,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  aiInsightHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  aiIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  aiInsightItem: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  aiInsightText: {
    flex: 1,
    marginLeft: 8,
    lineHeight: 20,
  },
});
