import React from "react";
import { Modal, TouchableOpacity, View, StyleSheet, Dimensions } from "react-native";
import { useAppTheme } from "../../theme";
import { Ionicons } from "@expo/vector-icons";
import { CustomText } from "../text/customText";

interface ConfirmDialogProps {
  message: string;
  confirmText?: string;
  cancelText?: string;
  visible: boolean;
  canCancel?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog = ({ 
  message, 
  confirmText = "Xác nhận", 
  cancelText = "Hủy", 
  visible, 
  canCancel = true,
  onConfirm, 
  onCancel 
}: ConfirmDialogProps) => {
  const { colors } = useAppTheme();

  const handleConfirm = () => {
    onConfirm();
  };

  const handleCancel = () => {
    onCancel();
  };

  return (
    <Modal 
      transparent 
      visible={visible} 
      animationType="fade" 
      onRequestClose={canCancel ? handleCancel : undefined}
    >
      <View style={[styles.overlay, { backgroundColor: `${colors.background}50` }]}>
        {canCancel && (
          <TouchableOpacity 
            style={styles.overlayTouchable}
            activeOpacity={1}
            onPress={handleCancel}
          />
        )}
        <View style={[styles.dialog, { backgroundColor: colors.backgroundSecondary, shadowColor: colors.text }]}>
          <View style={styles.iconContainer}>
            <Ionicons name="help-circle" size={32} color={colors.primary} />
          </View>

          <CustomText weight="Regular" style={[styles.message, { color: colors.text }]}>
            {message}
          </CustomText>

          <View style={styles.buttonRow}>
            {canCancel && (
              <TouchableOpacity
                style={[styles.button, styles.cancelButton, { backgroundColor: colors.backgroundSecondary }]}
                onPress={handleCancel}
                activeOpacity={0.8}
              >
                <CustomText weight="Regular" style={[styles.cancelText, { color: colors.text }]}>
                  {cancelText}
                </CustomText>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[
                styles.button, 
                styles.confirmButton, 
                { backgroundColor: colors.primary },
                !canCancel && styles.fullWidthButton
              ]}
              onPress={handleConfirm}
              activeOpacity={0.8}
            >
              <CustomText weight="Regular" style={[styles.confirmText, { color: "white" }]}>
                {confirmText}
              </CustomText>
            </TouchableOpacity>
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
  overlayTouchable: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
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
    backgroundColor: "rgba(59, 130, 246, 0.1)",
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
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 16,
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
    shadowColor: "#3b82f6",
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
  fullWidthButton: {
    flex: 1,
  },
});

export default ConfirmDialog;
