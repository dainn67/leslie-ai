import React, { ReactNode, useContext, useState, createContext } from "react";
import { ConfirmDialog, AlertDialog } from "../../features/common/dialogs";
import { MyDatePicker } from "../../components/datePicker/MyDatePicker";

export enum DialogType {
  CONFIRM = "confirm",
  ALERT = "alert",
}

type DialogContextType = {
  showConfirm: (message: string, onConfirm: () => void, onCancel?: () => void, confirmText?: string, cancelText?: string) => void;
  showAlert: (message: string, onClose?: () => void, buttonText?: string) => void;
  showDatePicker: (date: Date, onSelect: (date: Date | undefined) => void) => void;
  hide: () => void;
};

const DialogContext = createContext<DialogContextType | null>(null);

export const useDialog = () => {
  const ctx = useContext(DialogContext);
  if (!ctx) throw new Error("useDialog must be used inside DialogProvider");
  return ctx;
};

export const DialogProvider = ({ children }: { children: ReactNode }) => {
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState("");

  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [date, setDate] = useState<Date | undefined>(undefined);

  const [confirmCallback, setConfirmCallback] = useState<(() => void) | null>(null);
  const [cancelCallback, setCancelCallback] = useState<(() => void) | null>(null);
  const [closeCallback, setCloseCallback] = useState<(() => void) | null>(null);
  const [dateCallback, setDateCallback] = useState<(date: Date | undefined) => void>(() => {});

  const [confirmText, setConfirmText] = useState("Xác nhận");
  const [cancelText, setCancelText] = useState("Hủy");
  const [buttonText, setButtonText] = useState("Đóng");

  const showConfirm = (
    message: string,
    onConfirm: () => void,
    onCancel?: () => void,
    confirmTextParam?: string,
    cancelTextParam?: string
  ) => {
    setConfirmMessage(message);
    setConfirmCallback(() => onConfirm);
    setCancelCallback(() => onCancel || (() => {}));
    setConfirmText(confirmTextParam || "Xác nhận");
    setCancelText(cancelTextParam || "Hủy");
    setConfirmVisible(true);
  };

  const showAlert = (message: string, onClose?: () => void, buttonTextParam?: string) => {
    setAlertMessage(message);
    setCloseCallback(() => onClose || (() => {}));
    setButtonText(buttonTextParam || "Đóng");
    setAlertVisible(true);
  };

  const showDatePicker = (date: Date, onSelect: (date: Date | undefined) => void) => {
    setDatePickerVisible(true);
    setDateCallback(onSelect);
    setDate(date);
  };

  const hide = () => {
    setConfirmVisible(false);
    setAlertVisible(false);
  };

  const handleConfirm = () => {
    if (confirmCallback) {
      confirmCallback();
    }
    hide();
  };

  const handleCancel = () => {
    if (cancelCallback) {
      cancelCallback();
    }
    hide();
  };

  const handleAlertClose = () => {
    if (closeCallback) {
      closeCallback();
    }
    hide();
  };

  return (
    <DialogContext.Provider value={{ showConfirm, showAlert, showDatePicker, hide }}>
      {children}

      {/* Confirm Dialog */}
      <ConfirmDialog
        message={confirmMessage}
        confirmText={confirmText}
        cancelText={cancelText}
        visible={confirmVisible}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />

      {/* Alert Dialog */}
      <AlertDialog message={alertMessage} buttonText={buttonText} visible={alertVisible} onClose={handleAlertClose} />

      {/* Exam Date picker */}
      <MyDatePicker
        visible={datePickerVisible}
        setVisible={setDatePickerVisible}
        date={date ?? new Date()}
        handleChange={dateCallback}
      />
    </DialogContext.Provider>
  );
};
