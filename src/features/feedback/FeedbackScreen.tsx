import React, { useState } from "react";
import MainButton from "../../components/buttons/MainButton";
import { SafeAreaView, View, Text, Pressable, TextInput, ScrollView, StyleSheet } from "react-native";
import { AppBar } from "../../components/AppBar";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import { DrawerParamList } from "../../app/DrawerNavigator";
import { useAppTheme } from "../../theme";
import { DiscordService, DiscordWebhookType } from "../../core/service/discordService";
import { ToastService } from "../../core/service/toastService";
import { AppConfig } from "../../constants/appConfig";
import { FirebaseConstants } from "../../constants";
import { FirebaseService } from "../../core/service";

export const FeedbackScreen = () => {
  const categories = ["Nội dung", "Trải nghiệm", "Giao diện", "Lỗi", "Tính năng", "Khác"];

  const { colors } = useAppTheme();

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [message, setMessage] = useState("");

  const canSubmit = selectedCategories.length > 0 && message.trim().length > 0;

  const drawerNavigation = useNavigation<DrawerNavigationProp<DrawerParamList, "FeedbackScreen">>();

  const toggleCategory = (c: string) =>
    setSelectedCategories((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));

  const handleSubmit = () => {
    DiscordService.sendDiscordMessage({
      message: `Categories: ${selectedCategories.join(", ")}\nMessage: ${message.trim()}\nApp Version: ${AppConfig.version} (${AppConfig.buildVersion})`,
      type: DiscordWebhookType.FEEDBACK,
    });

    ToastService.show({ message: "Đã gửi thành công" });
    setSelectedCategories([]);
    setMessage("");
  };

  const handleOpenDrawer = () => {
    FirebaseService.logEvent(FirebaseConstants.OPEN_MENU);
    drawerNavigation.openDrawer();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <AppBar title="Feedback" leftIcon={<Ionicons name="menu" size={24} color="white" />} onLeftPress={handleOpenDrawer} />
      <ScrollView contentContainerStyle={styles.scrollView}>
        <Text style={[styles.title, { color: colors.text }]}>Chúng tôi rất muốn lắng nghe những đánh giá & góp ý của bạn!</Text>

        {/* Category (multi-select) */}
        <View style={styles.categoryContainer}>
          <Text style={[styles.subtitle, { color: colors.text }]}>Phân loại</Text>
          <View style={styles.categoryList}>
            {categories.map((c) => {
              const selected = selectedCategories.includes(c);
              return (
                <Pressable
                  key={c}
                  onPress={() => toggleCategory(c)}
                  style={[styles.categoryItem, { backgroundColor: selected ? colors.primary : colors.backgroundSecondary }]}
                >
                  <Text style={[styles.categoryItemText, { color: colors.text }]}>{c}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Message */}
        <View style={{ gap: 8 }}>
          <Text style={{ color: colors.text, fontSize: 16, fontWeight: "600" }}>Nội dung</Text>
          <View style={[styles.messageContainer, { borderColor: colors.text }]}>
            <TextInput
              value={message}
              onChangeText={setMessage}
              placeholder="Nhập nội dung phản hồi của bạn..."
              placeholderTextColor={colors.placeholder}
              multiline
              style={[styles.messageText, { color: colors.text }]}
            />
          </View>
        </View>

        {/* Submit */}
        <MainButton
          title="Gửi phản hồi"
          onPress={handleSubmit}
          disabled={!canSubmit}
          style={{ marginTop: 20 }}
          textStyle={{ color: colors.textOnPrimary }}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    padding: 20,
    gap: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  categoryContainer: {
    gap: 8,
  },
  categoryList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  categoryItem: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 100,
  },
  categoryItemText: {
    fontWeight: "500",
  },
  messageContainer: {
    borderWidth: 0.5,
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  messageText: {
    fontSize: 15,
    textAlignVertical: "top",
    minHeight: 120,
    padding: 12,
  },
});
