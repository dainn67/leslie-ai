import React, { useState, useRef } from "react";
import { Modal, TouchableOpacity, View, StyleSheet, Dimensions, TextInput } from "react-native";
import { useAppTheme } from "../../../theme";
import { Ionicons } from "@expo/vector-icons";
import { CustomText } from "../../../components/text/customText";
import MainButton from "../../../components/buttons/MainButton";

interface NameDialogProps {
  title?: string;
  placeholder?: string;
  confirmText?: string;
  visible: boolean;
  onConfirm: (name: string) => void;
}

export const NameDialog = ({
  title = "Nhập tên của bạn",
  placeholder = "Tên của bạn...",
  confirmText = "Xác nhận",
  visible,
  onConfirm,
}: NameDialogProps) => {
  const { colors, isDarkMode } = useAppTheme();
  const [name, setName] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const handleConfirm = () => {
    if (name.trim()) {
      onConfirm(name.trim());
      setName("");
    }
  };

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={[styles.overlay, { backgroundColor: `${colors.background}50` }]}>
        <View style={[styles.dialog, { backgroundColor: colors.backgroundSecondary, shadowColor: colors.text }]}>
          <View style={styles.iconContainer}>
            <Ionicons name="person" size={32} color={colors.primary} />
          </View>

          <CustomText weight="Regular" style={[styles.title, { color: colors.text }]}>
            {title}
          </CustomText>

          <View style={styles.inputContainer}>
            <TextInput
              ref={inputRef}
              style={[
                styles.input,
                {
                  borderBottomColor: isFocused ? colors.primary : isDarkMode ? colors.placeholder : "#ccc",
                  color: colors.text,
                },
              ]}
              placeholder={placeholder}
              placeholderTextColor={isDarkMode ? colors.placeholder : "#aaa"}
              value={name}
              onChangeText={setName}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              autoFocus={true}
              returnKeyType="done"
              onSubmitEditing={handleConfirm}
            />
          </View>

          <MainButton title={confirmText} onPress={handleConfirm} disabled={!name.trim()} />
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
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 28,
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(6, 182, 212, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    lineHeight: 24,
    marginBottom: 24,
    textAlign: "center",
    letterSpacing: 0.2,
    fontWeight: "600",
  },
  inputContainer: {
    marginBottom: 28,
  },
  input: {
    height: 48,
    borderBottomWidth: 2,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    backgroundColor: "transparent",
    fontFamily: "Inter-Regular",
    borderRadius: 8,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.1)",
  },
  confirmButton: {
    shadowColor: "#06b6d4",
  },
  cancelText: {
    fontWeight: "600",
    fontSize: 16,
  },
  confirmText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
});

export default NameDialog;
