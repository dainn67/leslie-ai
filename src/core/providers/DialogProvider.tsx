import React, { ReactNode, useContext, useState, createContext, useRef } from "react";
import { ConfirmDialog, AlertDialog } from "../../components/dialogs";
import { MyDatePicker } from "../../components/dialogs/DatePickerDialog";
import { useTranslation } from "react-i18next";

type DialogContextType = {
  showConfirm: (message: string, onConfirm: () => void, onCancel?: () => void, confirmText?: string, cancelText?: string) => void;
  showAlert: (message: string, onClose?: () => void, buttonText?: string) => void;
  showDatePicker: (onSelect: (date: Date | undefined) => void) => void;
  hide: () => void;
};

const DialogContext = createContext<DialogContextType | null>(null);

export const useDialog = () => {
  const ctx = useContext(DialogContext);
  if (!ctx) throw new Error("useDialog phải được dùng bên trong DialogProvider");
  return ctx;
};

export const DialogProvider = ({ children }: { children: ReactNode }) => {
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState("");

  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  const [datePickerVisible, setDatePickerVisible] = useState(false);

  const { t } = useTranslation();

  // Use useRef for callbacks
  const confirmCallback = useRef<(() => void) | null>(null);
  const cancelCallback = useRef<(() => void) | null>(null);
  const closeCallback = useRef<(() => void) | null>(null);
  const dateCallback = useRef<((date: Date | undefined) => void) | null>(null);

  const showConfirm = (message: string, onConfirm: () => void, onCancel?: () => void) => {
    setConfirmMessage(message);
    confirmCallback.current = onConfirm;
    cancelCallback.current = onCancel || (() => {});
    setConfirmVisible(true);
  };

  const showAlert = (message: string, onClose?: () => void, buttonTextParam?: string) => {
    setAlertMessage(message);
    closeCallback.current = onClose || (() => {});
    setAlertVisible(true);
  };

  const showDatePicker = (onSelect: (date: Date | undefined) => void) => {
    setDatePickerVisible(true);
    dateCallback.current = onSelect;
  };

  const hide = () => {
    setConfirmVisible(false);
    setAlertVisible(false);
    setDatePickerVisible(false);
  };

  const handleConfirm = () => {
    if (confirmCallback.current) {
      confirmCallback.current();
    }
    hide();
  };

  const handleCancel = () => {
    if (cancelCallback.current) {
      cancelCallback.current();
    }
    hide();
  };

  const handleAlertClose = () => {
    if (closeCallback.current) {
      closeCallback.current();
    }
    hide();
  };

  // Xử lý chọn ngày thi
  const handleDateChange = (date: Date | undefined) => {
    if (dateCallback.current) {
      dateCallback.current(date);
    }
    setDatePickerVisible(false);
  };

  return (
    <DialogContext.Provider value={{ showConfirm, showAlert, showDatePicker, hide }}>
      {children}

      {/* Confirm Dialog */}
      <ConfirmDialog
        message={confirmMessage}
        confirmText={t("confirm")}
        cancelText={t("cancel")}
        visible={confirmVisible}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />

      {/* Alert Dialog */}
      <AlertDialog message={alertMessage} buttonText={t("close")} visible={alertVisible} onClose={handleAlertClose} />

      {/* Exam Date picker */}
      <MyDatePicker
        visible={datePickerVisible}
        setVisible={setDatePickerVisible}
        date={new Date()}
        handleChange={handleDateChange}
      />
    </DialogContext.Provider>
  );
};
