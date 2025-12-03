import React, { useCallback, useState } from "react";
import MainButton from "../../components/buttons/MainButton";
import { Ionicons } from "@expo/vector-icons";
import { AppBar } from "../../components/AppBar";
import { FirebaseService, ToastService } from "../../core/service";
import { FirebaseConstants } from "../../constants";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import { DrawerParamList } from "../../core/app/DrawerNavigator";
import { FlipCard } from "./component/FlipCard";
import { ScrollView, View, StyleSheet, Dimensions } from "react-native";
import { Flashcard } from "../../models";
import { deleteFlashcards, getAllFlashcards, insertFlashcards } from "../../storage/database/tables/flashCardTable";
import { CustomText } from "../../components/text/customText";
import { useTranslation } from "react-i18next";
import { SafeAreaView } from "react-native-safe-area-context";
import { BannerAds } from "../ads/BannerAds";
import { useAppTheme } from "../../theme";

export const FlashcardScreen = () => {
  const navigation = useNavigation<DrawerNavigationProp<DrawerParamList, "FlashCardScreen">>();
  const { width } = Dimensions.get("window");
  const { t } = useTranslation();
  const { colors } = useAppTheme();

  // const [amountSelectorVisible, setAmountSelectorVisible] = useState(false);

  // Data
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [mapBookmarked, setMapBookmarked] = useState<{ [key: number]: boolean }>({});

  // UI
  const cardWidth = (width - 60) / 2;
  const cardHeight = cardWidth * 1.4;

  useFocusEffect(
    useCallback(() => {
      const flashcards = getAllFlashcards();
      setFlashcards(flashcards);
      setMapBookmarked(Object.fromEntries(flashcards.map((card) => [card.flashcardId, true])));
    }, [])
  );

  const handleOpenDrawer = () => {
    FirebaseService.logClickEvent(FirebaseConstants.OPEN_MENU);
    navigation.openDrawer();
  };

  const handleBookmark = (flashcardId: number) => {
    const newBookmarkState = !mapBookmarked[flashcardId];

    setMapBookmarked((prev) => {
      const newMap = { ...prev };
      newMap[flashcardId] = newBookmarkState;
      return newMap;
    });

    if (newBookmarkState) {
      ToastService.show({ message: "Đã lưu", type: "success" });
      FirebaseService.logClickEvent(FirebaseConstants.SAVE_GENERATED_FLASHCARD);
      insertFlashcards([flashcards.find((card) => card.flashcardId === flashcardId)!]);
    } else {
      deleteFlashcards([flashcards.find((card) => card.flashcardId === flashcardId)!.flashcardId]);
    }
  };

  // const handlePractice = () => {
  //   if (flashcards.length > 0) {
  //     setAmountSelectorVisible(true);
  //   } else {
  //     ToastService.show({ message: "Bạn chưa tạo flashcard nào", type: "error" });
  //   }
  // };
  //
  // const handleSelectFlashcard = (amount: number) => {
  //   const selectedFlashcards = flashcards.slice(0, amount);
  //   FirebaseService.logEvent(FirebaseConstants.REVIEW_ALL_FLASHCARDS, { amount });
  // };

  const handleNavigateToChatbotScreen = () => {
    FirebaseService.logClickEvent(FirebaseConstants.START_CREATING_FLASHCARDS);
    navigation.navigate("ChatbotScreen", { initialMessage: `Tạo các Flashcard mới` });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={[styles.container]}>
        <AppBar title={"Flash Card"} leftIcon={<Ionicons name="menu" size={24} color="white" />} onLeftPress={handleOpenDrawer} />

        {flashcards.length > 0 ? (
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.gridContainer}>
              {flashcards.map((card, index) => {
                return (
                  <View key={index} style={styles.cardWrapper}>
                    <FlipCard
                      key={index}
                      front={card.front}
                      back={card.back}
                      width={cardWidth}
                      height={cardHeight}
                      bookmarked={mapBookmarked[card.flashcardId]}
                      onBookmark={() => handleBookmark(card.flashcardId)}
                    />
                  </View>
                );
              })}
            </View>
          </ScrollView>
        ) : (
          <View style={styles.emptyContainer}>
            <CustomText style={[styles.emptyText, { color: colors.text }]}>{t("flashcard_screen_empty_title")}</CustomText>
            <MainButton
              title={t("create_new_flashcard")}
              style={{ borderRadius: 100, marginTop: 16 }}
              onPress={handleNavigateToChatbotScreen}
            />
          </View>
        )}

        <BannerAds />

        {/* Review button */}
        {/* {flashcards.length > 0 && <MainButton title={"Ôn tập"} style={styles.buttonContainer} onPress={handlePractice} />} */}

        {/* Question number selector */}
        {/* <QuestionNumberSelector
          totalQuestions={flashcards.length}
          visible={amountSelectorVisible}
          setVisible={setAmountSelectorVisible}
          onSelectQuestion={(amount) => handleSelectFlashcard(amount)}
        />
        */}
      </View>
    </SafeAreaView>
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
