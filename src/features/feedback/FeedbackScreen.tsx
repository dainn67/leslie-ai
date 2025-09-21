import React, { useState } from "react";
import MainButton from "../../components/buttons/MainButton";
import { SafeAreaView, View, Text, Pressable, TextInput, ScrollView, StyleSheet } from "react-native";
import { AppBar } from "../../components/AppBar";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import { useAppTheme } from "../../theme";
import { DiscordService, DiscordWebhookType } from "../../core/service/discordService";
import { ToastService } from "../../core/service/toastService";
import { FirebaseConstants } from "../../constants";
import { FirebaseService } from "../../core/service";
import { useAppSelector } from "../../hooks/hooks";
import { RootStackParamList } from "../../app/RootNavigator";

export const FeedbackScreen = () => {
  const categories = ["Nội dung", "Trải nghiệm", "Giao diện", "Lỗi", "Tính năng", "Khác"];

  const { colors } = useAppTheme();
  const userProgress = useAppSelector((state) => state.userProgress.userProgress);

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [message, setMessage] = useState("");

  const canSubmit = selectedCategories.length > 0 && message.trim().length > 0;

  const navigation = useNavigation<DrawerNavigationProp<RootStackParamList, "Main">>();

  const toggleCategory = (c: string) =>
    setSelectedCategories((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));

  const handleSubmit = () => {
    DiscordService.sendDiscordMessage({
      username: userProgress.userName,
      message: `Categories: ${selectedCategories.join(", ")}\nMessage: ${message.trim()}`,
      type: DiscordWebhookType.FEEDBACK,
    });

    ToastService.show({ message: "Đã gửi thành công" });
    setSelectedCategories([]);
    setMessage("");
  };

  const handleOpenDrawer = () => {
    FirebaseService.logEvent(FirebaseConstants.OPEN_MENU);
    navigation.openDrawer();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <AppBar title="Phản hồi" leftIcon={<Ionicons name="menu" size={24} color="white" />} onLeftPress={handleOpenDrawer} />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Chia sẻ ý kiến của bạn</Text>
          <Text style={[styles.subtitle, { color: colors.placeholder }]}>Phản hồi của bạn giúp chúng tôi cải thiện ứng dụng</Text>
        </View>

        {/* Categories */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Loại phản hồi</Text>
          <View style={styles.categoryGrid}>
            {categories.map((category) => {
              const selected = selectedCategories.includes(category);
              return (
                <Pressable
                  key={category}
                  onPress={() => toggleCategory(category)}
                  style={[
                    styles.categoryChip,
                    {
                      backgroundColor: selected ? colors.primary : colors.backgroundSecondary,
                      borderColor: selected ? colors.primary : colors.placeholder,
                    },
                  ]}
                >
                  <Text style={[styles.categoryText, { color: selected ? colors.textOnPrimary : colors.text }]}>{category}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Message Input */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Nội dung</Text>
          <View style={[styles.inputContainer, { backgroundColor: colors.backgroundSecondary, borderColor: colors.placeholder }]}>
            <TextInput
              value={message}
              onChangeText={setMessage}
              placeholder="Mô tả chi tiết về phản hồi của bạn..."
              placeholderTextColor={colors.placeholder}
              multiline
              textAlignVertical="top"
              style={[styles.textInput, { color: colors.text }]}
            />
          </View>
        </View>

        {/* Submit Button */}
        <View style={styles.submitContainer}>
          <MainButton
            title="Gửi phản hồi"
            onPress={handleSubmit}
            disabled={!canSubmit}
            style={[styles.submitButton, { opacity: canSubmit ? 1 : 0.5 }]}
            textStyle={{ color: colors.textOnPrimary, fontWeight: "600" }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 24,
  },
  header: {
    paddingVertical: 32,
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 22,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  categoryChip: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 1,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: "500",
  },
  inputContainer: {
    borderRadius: 16,
    borderWidth: 1,
    minHeight: 140,
  },
  textInput: {
    fontSize: 16,
    padding: 20,
    minHeight: 140,
    textAlignVertical: "top",
  },
  submitContainer: {
    paddingBottom: 40,
  },
  submitButton: {
    borderRadius: 16,
    paddingVertical: 16,
  },
});
