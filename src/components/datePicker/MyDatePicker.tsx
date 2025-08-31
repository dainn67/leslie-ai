import React from 'react';
import { Modal } from 'react-native';
import { useAppTheme } from '../../theme';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

interface MyDatePickerProps {
  visible: boolean;
  date: Date;
  title?: string;
  confirmText?: string;
  cancelText?: string;
  setVisible: (visible: boolean) => void;
  handleChange: (selectedDate: Date | undefined) => void;
}

export const MyDatePicker = ({ visible, date, setVisible, handleChange }: MyDatePickerProps) => {
  const { colors } = useAppTheme();

  const handleDateChange = (event: DateTimePickerEvent, selectedDate: Date | undefined) => {
    if (event.type === 'dismissed') {
      setVisible(false);
      return;
    } else if (event.type === 'set') {
      handleChange(selectedDate);
      setVisible(false);
    }
  };

  const handleCancel = () => {
    setVisible(false);
  };

  return (
    <Modal visible={visible} onRequestClose={handleCancel} transparent animationType="fade" statusBarTranslucent>
      <DateTimePicker
        value={date}
        mode="date"
        display="calendar"
        onChange={handleDateChange}
        style={{ width: '100%', height: 200, backgroundColor: colors.background }}
      />
    </Modal>
  );
};
