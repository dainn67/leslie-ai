import React, { useEffect, useState } from "react";
import MainButton from "../../components/buttons/MainButton";
import { Ionicons } from "@expo/vector-icons";
import { AppBar } from "../../components/AppBar";
import { FirebaseService, ToastService } from "../../core/service";
import { FirebaseConstants } from "../../constants";
import { useNavigation } from "@react-navigation/native";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import { DrawerParamList } from "../../app/DrawerNavigator";
import { FlipCard } from "./component/FlipCard";
import { ScrollView, View, StyleSheet, Dimensions } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { QuestionNumberSelector } from "../questions/components/QuestionNumberSelector";
import { Flashcard } from "../../models";
import { deleteFlashcards, getAllFlashcards, insertFlashcards } from "../../storage/database/tables/flashCardTable";
import { CustomText } from "../../components/text/customText";

export const FlashcardScreen = () => {
  const navigation = useNavigation<DrawerNavigationProp<DrawerParamList, "FlashCardScreen">>();
  const { width } = Dimensions.get("window");
  const [amountSelectorVisible, setAmountSelectorVisible] = useState(false);

  // Data
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [listBookmarked, setListBookmarked] = useState<boolean[]>([]);

  // UI
  const cardWidth = (width - 60) / 2;
  const cardHeight = cardWidth * 1.4;

  useEffect(() => {
    const flashcards = getAllFlashcards();
    setFlashcards(flashcards);
    setListBookmarked(flashcards.map(() => true));
  }, []);

  const handleOpenDrawer = () => {
    FirebaseService.logEvent(FirebaseConstants.OPEN_MENU);
    navigation.openDrawer();
  };

  const handleBookmark = (isBookmarked: boolean, index: number) => {
    setListBookmarked((prev) => {
      const newList = [...prev];
      newList[index] = isBookmarked;
      return newList;
    });

    if (isBookmarked) {
      ToastService.show({ message: "Đã lưu", type: "success" });
      FirebaseService.logEvent(FirebaseConstants.SAVE_GENERATED_FLASHCARD);
      insertFlashcards([flashcards[index]]);
    } else {
      deleteFlashcards([flashcards[index].flashcardId]);
    }
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

  const handleNavigateToChatbotScreen = () => {
    FirebaseService.logEvent(FirebaseConstants.START_CREATING_FLASHCARDS);
    navigation.navigate("ChatbotScreen", { initialMessage: `Tạo các Flashcard mới` });
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={[styles.container]}>
        <AppBar title={"Flash Card"} leftIcon={<Ionicons name="menu" size={24} color="white" />} onLeftPress={handleOpenDrawer} />

        {flashcards.length > 0 ? (
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.gridContainer}>
              {flashcards.map((card, index) => (
                <View key={index} style={styles.cardWrapper}>
                  <FlipCard
                    front={card.front}
                    back={card.back}
                    width={cardWidth}
                    height={cardHeight}
                    bookmarked={listBookmarked[index]}
                    onBookmark={(isBookmarked) => handleBookmark(isBookmarked, index)}
                  />
                </View>
              ))}
            </View>
          </ScrollView>
        ) : (
          <View style={styles.emptyContainer}>
            <CustomText style={styles.emptyText}>
              {"Các Flashcard đã lưu sẽ hiển thị ở đây.\nHiện bạn chưa lưu Flashcard nào"}
            </CustomText>
            <MainButton
              title={"Tạo Flashcard mới"}
              style={{ borderRadius: 100, marginTop: 16 }}
              onPress={handleNavigateToChatbotScreen}
            />
          </View>
        )}

        {/* Review button */}
        {flashcards.length > 0 && <MainButton title={"Ôn tập"} style={styles.buttonContainer} onPress={handlePractice} />}

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
});
