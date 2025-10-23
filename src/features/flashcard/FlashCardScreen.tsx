import React, { useState } from "react";
import MainButton from "../../components/buttons/MainButton";
import { Ionicons } from "@expo/vector-icons";
import { AppBar } from "../../components/AppBar";
import { FirebaseService, ToastService } from "../../core/service";
import { FirebaseConstants } from "../../constants";
import { useNavigation } from "@react-navigation/native";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import { RootStackParamList } from "../../app/RootNavigator";
import { FlipCard } from "./component/FlipCard";
import { ScrollView, View, StyleSheet, Dimensions } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { QuestionNumberSelector } from "../questions/components/QuestionNumberSelector";

// Sample flashcard data - replace with your actual data
const flashcards = [
  { id: 1, front: "Hello", back: "Xin chào" },
  { id: 2, front: "Goodbye", back: "Tạm biệt" },
  { id: 3, front: "Thank you", back: "Cảm ơn" },
  { id: 4, front: "Please", back: "Làm ơn" },
  { id: 5, front: "Yes", back: "Vâng" },
  { id: 6, front: "No", back: "Không" },
  { id: 7, front: "Water", back: "Nước" },
  { id: 8, front: "Food", back: "Thức ăn" },
];

export const FlashCardScreen = () => {
  const navigation = useNavigation<DrawerNavigationProp<RootStackParamList, "Main">>();
  const { width } = Dimensions.get("window");
  const [amountSelectorVisible, setAmountSelectorVisible] = useState(false);

  // Calculate card dimensions for 2 columns
  const cardWidth = (width - 60) / 2; // 60 = total horizontal padding and spacing
  const cardHeight = cardWidth * 1.4; // Maintain aspect ratio

  const handleOpenDrawer = () => {
    FirebaseService.logEvent(FirebaseConstants.OPEN_MENU);
    navigation.openDrawer();
  };

  const handlePractice = () => {
    if (flashcards.length > 0) {
      setAmountSelectorVisible(true);
    } else {
      ToastService.show({ message: "Bạn chưa tạo flashcard nào", type: "error" });
    }
  };

  const handleSelectFlashcard = (amount: number) => {
    const selectedFlashcards = flashcards.slice(0, amount);
    FirebaseService.logEvent(FirebaseConstants.REVIEW_ALL_FLASHCARDS, { amount });
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={[styles.container]}>
        <AppBar title={"Flash Card"} leftIcon={<Ionicons name="menu" size={24} color="white" />} onLeftPress={handleOpenDrawer} />

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.gridContainer}>
            {flashcards.map((card) => (
              <View key={card.id} style={styles.cardWrapper}>
                <FlipCard front={card.front} back={card.back} width={cardWidth} height={cardHeight} />
              </View>
            ))}
          </View>
        </ScrollView>

        <MainButton title={"Ôn tập"} style={styles.buttonContainer} onPress={handlePractice} />

        {/* Question number selector */}
        <QuestionNumberSelector
          totalQuestions={flashcards.length}
          visible={amountSelectorVisible}
          setVisible={setAmountSelectorVisible}
          onSelectQuestion={(amount) => handleSelectFlashcard(amount)}
        />
      </View>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    padding: 10,
  },
  cardWrapper: {
    margin: 10,
  },
  buttonContainer: {
    marginHorizontal: 16,
    marginVertical: 8,
    alignItems: "center",
  },
});
