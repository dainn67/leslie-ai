import React, { useState, useRef } from "react";
import MainButton from "../../../components/buttons/MainButton";
import { View, StyleSheet, Dimensions, FlatList, Image, SafeAreaView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { CustomText } from "../../../components/text/customText";
import { useAppTheme } from "../../../theme";
import { RootStackParamList } from "../../../app/RootNavigator";
import { AppConfig, FirebaseConstants } from "../../../constants";
import { AsyncStorageService } from "../../../core/service/asyncStorageService";
import { FirebaseService } from "../../../core/service";

type OnboardingScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, "Onboarding">;

const { width: screenWidth } = Dimensions.get("window");

interface OnboardingData {
  id: string;
  title: string;
  subtitle: string;
}

const onboardingData: OnboardingData[] = [
  {
    id: "1",
    title: `${AppConfig.name}`,
    subtitle: "Ôn thi JLPT cùng gia sư AI",
  },
  {
    id: "2",
    title: "Câu hỏi đa dạng",
    subtitle: "Phù hợp với mọi trình độ",
  },
  {
    id: "3",
    title: "Học tập cá nhân hoá",
    subtitle: "Xây dựng kế hoạch học tập riêng",
  },
];

const OnboardingScreen: React.FC = () => {
  const navigation = useNavigation<OnboardingScreenNavigationProp>();
  const flatListRef = useRef<FlatList>(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const { colors } = useAppTheme();

  const handleNext = () => {
    if (currentIndex < onboardingData.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
    } else {
      FirebaseService.logEvent(FirebaseConstants.ONBOARDING_COMPLETED);
      AsyncStorageService.setOnboardingCompleted(true);
      navigation.replace("Main");
    }
  };

  const renderItem = ({ item }: { item: OnboardingData }) => (
    <View style={[styles.slide, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        {/* Image */}
        <View style={styles.imageContainer}>
          <Image source={require("../../../../assets/images/app-logo.png")} style={styles.image} resizeMode="contain" />
        </View>

        {/* Title */}
        <CustomText weight="Bold" size={32} style={[styles.title, { color: colors.text }]}>
          {item.title}
        </CustomText>

        {/* Subtitle */}
        <CustomText weight="SemiBold" size={18} style={[styles.subtitle, { color: colors.text }]}>
          {item.subtitle}
        </CustomText>
      </View>
    </View>
  );

  const renderPagination = () => (
    <View style={styles.pagination}>
      {onboardingData.map((_, index) => (
        <View
          key={index}
          style={[
            styles.paginationDot,
            {
              backgroundColor: index === currentIndex ? colors.primary : colors.secondary,
              opacity: index === currentIndex ? 1 : 0.3,
            },
          ]}
        />
      ))}
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Onboarding Slides */}
      <FlatList
        ref={flatListRef}
        data={onboardingData}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(event) => {
          const index = Math.round(event.nativeEvent.contentOffset.x / screenWidth);
          setCurrentIndex(index);
        }}
        keyExtractor={(item) => item.id}
        style={styles.flatList}
      />

      {/* Pagination */}
      {renderPagination()}

      {/* Next Button */}
      <View style={styles.buttonContainer}>
        <MainButton
          title={currentIndex === onboardingData.length - 1 ? "Bắt đầu ngay" : "Tiếp theo"}
          onPress={handleNext}
          style={styles.nextButton}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flatList: {
    flex: 1,
  },
  slide: {
    width: screenWidth,
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  content: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  imageContainer: {
    width: 200,
    height: 200,
    marginBottom: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  title: {
    textAlign: "center",
    marginBottom: 16,
    lineHeight: 40,
  },
  subtitle: {
    textAlign: "center",
    lineHeight: 26,
    paddingHorizontal: 20,
    opacity: 0.8,
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  buttonContainer: {},
  nextButton: {
    borderRadius: 12,
    paddingVertical: 16,
    marginHorizontal: 40,
    marginBottom: 24,
  },
});

export default OnboardingScreen;
