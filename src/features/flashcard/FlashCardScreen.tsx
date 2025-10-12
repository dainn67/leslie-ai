import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { AppBar } from "../../components/AppBar";
import { FirebaseService } from "../../core/service";
import { FirebaseConstants } from "../../constants";
import { useNavigation } from "@react-navigation/native";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import { RootStackParamList } from "../../app/RootNavigator";
import { FlipCard } from "./component/FlipCard";
import { ScrollView, View, StyleSheet, Dimensions } from "react-native";
import { useAppTheme } from "../../theme";

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
  const { colors } = useAppTheme();
  const { width } = Dimensions.get("window");

  // Calculate card dimensions for 2 columns
  const cardWidth = (width - 60) / 2; // 60 = total horizontal padding and spacing
  const cardHeight = cardWidth * 1.4; // Maintain aspect ratio

  const handleOpenDrawer = () => {
    FirebaseService.logEvent(FirebaseConstants.OPEN_MENU);
    navigation.openDrawer();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
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
    </View>
  );
};

const styles = StyleSheet.create({
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
});
