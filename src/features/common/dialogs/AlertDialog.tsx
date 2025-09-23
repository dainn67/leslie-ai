import React from "react";
import { Modal, TouchableOpacity, View, StyleSheet, Dimensions } from "react-native";
import { useAppTheme } from "../../../theme";
import { Ionicons } from "@expo/vector-icons";
import { CustomText } from "../../../components/text/customText";

interface AlertDialogProps {
  message: string;
  subMessage?: string;
  buttonText?: string;
  visible: boolean;
  onClose: () => void;
}

export const AlertDialog = ({ 
  message, 
  subMessage,
  buttonText = "Đóng", 
  visible, 
  onClose 
}: AlertDialogProps) => {
  const { colors } = useAppTheme();

  const handleClose = () => {
    onClose();
  };

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={handleClose}>
      <View style={[styles.overlay, { backgroundColor: `${colors.background}50` }]}>
        <View style={[styles.dialog, { backgroundColor: colors.backgroundSecondary, shadowColor: colors.text }]}>
          <View style={styles.iconContainer}>
            <Ionicons name="information-circle" size={32} color={colors.text} />
          </View>

          <CustomText weight="Regular" style={[styles.message, { color: colors.text }]}>
            {message}
          </CustomText>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.primary }]}
            onPress={handleClose}
            activeOpacity={0.8}
          >
            <CustomText weight="Regular" style={[styles.buttonText, { color: "white" }]}>
              {buttonText}
            </CustomText>
          </TouchableOpacity>
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
  message: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 28,
    textAlign: "center",
    letterSpacing: 0.2,
  },
  button: {
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
    shadowColor: "#06b6d4",
  },
  buttonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
});

export default AlertDialog; 