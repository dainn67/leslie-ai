import React, { useMemo } from "react";
import { Dimensions, Modal, StyleSheet, View, TouchableOpacity } from "react-native";
import { useAppTheme } from "../../../theme";
import { CustomText } from "../../../components/text/customText";
import MainButton from "../../../components/buttons/MainButton";
import { useTranslation } from "react-i18next";

interface QuestionNumberSelectorProps {
  title?: string;
  totalQuestions?: number;
  selectedQuestion?: number;
  visible: boolean;
  setVisible: (visible: boolean) => void;
  onSelectQuestion: (questionAmount: number) => void;
}

export const QuestionNumberSelector = ({
  totalQuestions = 30,
  selectedQuestion = 0,
  visible,
  setVisible,
  onSelectQuestion,
}: QuestionNumberSelectorProps) => {
  const { colors } = useAppTheme();
  const { t } = useTranslation();

  const questionOptions = useMemo(() => {
    const options: number[] = [];

    if (totalQuestions <= 0) return [10];

    if (totalQuestions <= 10) return [totalQuestions];

    const roundedTotal = Math.floor(totalQuestions / 10) * 10;

    for (let i = 10; i <= roundedTotal && options.length < 5; i += 10) options.push(i);

    options.push(totalQuestions);

    return options;
  }, [totalQuestions]);

  const handleSelectQuestion = (amount: number) => {
    onSelectQuestion(amount);
    setVisible(false);
  };

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={() => setVisible(false)}>
      <View style={[styles.overlay, { backgroundColor: `${colors.backgroundSecondary}CC` }]}>
        <View style={[styles.dialog, { backgroundColor: colors.background }]}>
          {/* Header */}
          <View style={styles.header}>
            <CustomText weight="Bold" size={20} style={[styles.title, { color: colors.text }]}>
              {t("question_number_selector_title")}
            </CustomText>
            <CustomText size={14} style={[styles.subtitle, { color: colors.text }]}>
              {t("question_number_selector_subtitle")}
            </CustomText>
          </View>

          {/* Question Options */}
          <View style={styles.optionsContainer}>
            {questionOptions.length > 0 ? (
              questionOptions.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.optionButton,
                    {
                      backgroundColor: colors.backgroundSecondary,
                      borderColor: colors.secondary,
                    },
                  ]}
                  onPress={() => handleSelectQuestion(option)}
                  activeOpacity={0.7}
                >
                  <CustomText
                    weight="SemiBold"
                    size={18}
                    style={[styles.optionText, { color: selectedQuestion === option ? colors.background : colors.text }]}
                  >
                    {option}
                  </CustomText>
                  {selectedQuestion === option && <View style={[styles.checkIcon, { backgroundColor: colors.background }]} />}
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.fallbackContainer}>
                <CustomText size={16} style={[styles.fallbackText, { color: colors.text }]}>
                  Không có tùy chọn nào
                </CustomText>
              </View>
            )}
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <MainButton
              title={"Hủy"}
              onPress={() => setVisible(false)}
              style={{ width: "100%", backgroundColor: colors.alert }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  dialog: {
    width: width * 0.85,
    borderRadius: 20,
    padding: 28,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
    maxHeight: "80%",
  },
  header: {
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    textAlign: "center",
    opacity: 0.8,
  },
  optionsContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    alignContent: "center",
    marginVertical: 10,
  },
  optionButton: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 100,
    borderWidth: 1,
    width: 40,
    height: 40,
    marginHorizontal: 10,
    position: "relative",
  },
  optionText: {
    textAlign: "center",
  },
  checkIcon: {
    width: 12,
    height: 12,
    borderRadius: 6,
    position: "absolute",
    top: 8,
    right: 8,
  },
  footer: {
    marginTop: 24,
    alignItems: "center",
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
  },
  cancelText: {
    textAlign: "center",
  },
  fallbackContainer: {
    alignItems: "center",
    paddingVertical: 20,
  },
  fallbackText: {
    textAlign: "center",
  },
});
