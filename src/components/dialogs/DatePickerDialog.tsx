import React from "react";
import { Modal, TouchableOpacity } from "react-native";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";

interface DatePickerProps {
  visible: boolean;
  date: Date;
  title?: string;
  confirmText?: string;
  cancelText?: string;
  setVisible: (visible: boolean) => void;
  handleChange: (selectedDate: Date | undefined) => void;
}

export const MyDatePicker = ({ visible, date, setVisible, handleChange }: DatePickerProps) => {
  const handleDateChange = (event: DateTimePickerEvent, selectedDate: Date | undefined) => {
    if (event.type === "dismissed") {
      setVisible(false);
      return;
    } else if (event.type === "set") {
      handleChange(selectedDate);
      setVisible(false);
    }
  };

  const handleCancel = () => {
    setVisible(false);
  };

  return (
    <Modal visible={visible} onRequestClose={handleCancel} transparent animationType="fade" statusBarTranslucent>
      <TouchableOpacity
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.1)",
          justifyContent: "center",
          alignItems: "center",
        }}
        activeOpacity={1}
        onPress={handleCancel}
      >
        <DateTimePicker value={date} mode="date" display="calendar" onChange={handleDateChange} style={{ width: "100%" }} />
      </TouchableOpacity>
    </Modal>
  );
};
