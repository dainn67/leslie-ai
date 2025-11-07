import React, { useState } from "react";
import { TouchableOpacity, View, StyleSheet, Modal, FlatList, ViewStyle, StyleProp } from "react-native";
import { useAppTheme } from "../../theme";
import { CustomText } from "../../components/text/customText";

export interface Language {
  code: string;
  name: string;
  flag: string;
}

interface LanguageButtonProps {
  selectedLanguage: Language;
  languages: Language[];
  onLanguageChange: (language: Language) => void;
  style?: StyleProp<ViewStyle>;
}

export const LanguageButton = ({ selectedLanguage, languages, onLanguageChange, style }: LanguageButtonProps) => {
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const { colors } = useAppTheme();

  const handleLanguageSelect = (language: Language) => {
    onLanguageChange(language);
    setIsDropdownVisible(false);
  };

  const renderLanguageItem = ({ item }: { item: Language }) => {
    const isSelected = item.code === selectedLanguage.code;

    return (
      <TouchableOpacity
        style={[
          styles.dropdownItem,
          {
            backgroundColor: isSelected ? colors.backgroundSecondary : colors.background,
          },
        ]}
        onPress={() => handleLanguageSelect(item)}
        activeOpacity={0.7}
      >
        <View style={styles.flagContainer}>
          <CustomText style={styles.flagText}>{item.flag}</CustomText>
        </View>
        <CustomText style={[styles.languageCode, { color: colors.text }]}>{item.code}</CustomText>
        <CustomText style={[styles.languageName, { color: colors.placeholder }]}>{item.name}</CustomText>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, style]}>
      {/* Language Button */}
      <TouchableOpacity
        style={[styles.button, { backgroundColor: colors.grey + "85" }]}
        onPress={() => setIsDropdownVisible(true)}
        activeOpacity={0.7}
      >
        <View style={styles.flagContainer}>
          <CustomText style={styles.flagText}>{selectedLanguage.flag}</CustomText>
        </View>
        <CustomText style={[styles.languageCode, { color: colors.text }]}>{selectedLanguage.code}</CustomText>
      </TouchableOpacity>

      {/* Dropdown Modal */}
      <Modal visible={isDropdownVisible} transparent animationType="fade" onRequestClose={() => setIsDropdownVisible(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setIsDropdownVisible(false)}>
          <View
            style={[
              styles.dropdownContainer,
              {
                backgroundColor: colors.background,
                borderColor: colors.grey,
              },
            ]}
          >
            <FlatList
              data={languages}
              renderItem={renderLanguageItem}
              keyExtractor={(item) => item.code}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "relative",
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    borderRadius: 24,
    paddingRight: 10,
  },
  flagContainer: {
    width: 28,
    height: 28,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  flagText: {
    fontSize: 15,
  },
  languageCode: {
    fontSize: 12,
    marginLeft: 4,
    textTransform: "uppercase",
  },
  languageName: {
    fontSize: 12,
    marginLeft: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  dropdownContainer: {
    width: "80%",
    maxHeight: 400,
    borderRadius: 12,
    borderWidth: 1,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: "#E0E0E0",
  },
});
