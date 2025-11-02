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
import { DrawerParamList } from "../../app/DrawerNavigator";
import { useTranslation } from "react-i18next";

export const FeedbackScreen = () => {
  const { colors } = useAppTheme();
  const { t } = useTranslation();

  const categories = [
    t("feedback_category_content"),
    t("feedback_category_experience"),
    t("feedback_category_interface"),
    t("feedback_category_error"),
    t("feedback_category_feature"),
    t("feedback_category_other"),
  ];
  const userProgress = useAppSelector((state) => state.userProgress.userProgress);

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");

  const canSubmit = selectedCategories.length > 0 && message.trim().length > 0 && email.trim().length > 0;

  const navigation = useNavigation<DrawerNavigationProp<DrawerParamList, "FeedbackScreen">>();

  const toggleCategory = (c: string) =>
    setSelectedCategories((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));

  const handleSubmit = () => {
    DiscordService.sendDiscordMessage({
      name: userProgress.userName,
      message: `Categories: ${selectedCategories.join(", ")}\nMessage: ${message.trim()}\nEmail: ${email.trim()}`,
      type: DiscordWebhookType.FEEDBACK,
    });

    ToastService.show({ message: t("feedback_success_message") });
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
          <Text style={[styles.title, { color: colors.text }]}>{t("feedback_screen_title")}</Text>
          <Text style={[styles.subtitle, { color: colors.placeholder }]}>{t("feedback_screen_subtitle")}</Text>
        </View>

        {/* Categories */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{t("feedback_category_title")}</Text>
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

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Email</Text>
          <View
            style={[styles.emailInputContainer, { backgroundColor: colors.backgroundSecondary, borderColor: colors.placeholder }]}
          >
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder={t("feedback_email_placeholder")}
              placeholderTextColor={colors.placeholder}
              keyboardType="email-address"
              autoCapitalize="none"
              style={[styles.textInput, { color: colors.text, minHeight: 50 }]}
            />
          </View>
        </View>

        {/* Message Input */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{t("feedback_message_title")}</Text>
          <View
            style={[
              styles.messageInputContainer,
              { backgroundColor: colors.backgroundSecondary, borderColor: colors.placeholder },
            ]}
          >
            <TextInput
              value={message}
              onChangeText={setMessage}
              placeholder={t("feedback_message_placeholder")}
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
            title={t("feedback_submit_button")}
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
    marginBottom: 16,
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
  emailInputContainer: {
    borderRadius: 16,
    borderWidth: 1,
    minHeight: 50,
  },
  messageInputContainer: {
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
