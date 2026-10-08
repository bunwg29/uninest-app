import { useState } from 'react';
import { Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import DateTimePicker, {
  DateTimePickerAndroid,
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { CalendarDays, XCircle } from 'lucide-react-native';
import { THEME_COLORS } from '@theme';
import { Input, type InputProps } from './Input';
import { Modal } from './Modal';

interface DatePickerFieldProps extends Pick<
  InputProps,
  | 'label'
  | 'placeholder'
  | 'errorMessage'
  | 'helperText'
  | 'idleBorderColor'
  | 'containerStyle'
  | 'inputContainerStyle'
  | 'style'
> {
  value: string;
  onChange: (isoDate: string) => void;
  minimumDate?: Date;
  maximumDate?: Date;
  clearable?: boolean;
}

const pad = (value: number) => String(value).padStart(2, '0');

export const toIsoDate = (date: Date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

export const fromIsoDate = (isoDate: string): Date | null => {
  const match = isoDate.match(/^(\d{4})-(\d{2})-(\d{2})/);

  if (!match) return null;

  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
};

export const formatDateForDisplay = (isoDate: string) => {
  const date = fromIsoDate(isoDate);

  return date ? `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}` : '';
};

export const DatePickerField = ({
  value,
  onChange,
  minimumDate,
  maximumDate,
  clearable = true,
  placeholder = 'Chọn ngày',
  ...inputProps
}: DatePickerFieldProps) => {
  const [isIosPickerVisible, setIsIosPickerVisible] = useState(false);
  const [pendingDate, setPendingDate] = useState<Date>(new Date());
  const currentDate = fromIsoDate(value);

  const handleOpen = () => {
    const initialDate = currentDate ?? new Date();

    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: initialDate,
        mode: 'date',
        minimumDate,
        maximumDate,
        onChange: (event: DateTimePickerEvent, selectedDate?: Date) => {
          if (event.type === 'set' && selectedDate) onChange(toIsoDate(selectedDate));
        },
      });

      return;
    }

    setPendingDate(initialDate);
    setIsIosPickerVisible(true);
  };

  const hasClear = clearable && Boolean(value);

  return (
    <View>
      <Input
        {...inputProps}
        value={formatDateForDisplay(value)}
        placeholder={placeholder}
        editable={false}
        rightIcon={
          hasClear ? (
            <TouchableOpacity
              onPress={() => onChange('')}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityRole="button"
              accessibilityLabel="Xoá ngày đã chọn"
            >
              <XCircle size={18} color={THEME_COLORS.TEXT_PLACEHOLDER} />
            </TouchableOpacity>
          ) : (
            <CalendarDays size={18} color={THEME_COLORS.TEXT_PLACEHOLDER} />
          )
        }
      />

      <TouchableOpacity
        style={[styles.overlay, hasClear && styles.overlayWithClear]}
        onPress={handleOpen}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={inputProps.label ?? placeholder}
      />

      {Platform.OS === 'ios' ? (
        <Modal
          isVisible={isIosPickerVisible}
          onClose={() => setIsIosPickerVisible(false)}
          title={inputProps.label ?? placeholder}
          confirmText="Chọn"
          cancelText="Hủy"
          onConfirm={() => {
            onChange(toIsoDate(pendingDate));
            setIsIosPickerVisible(false);
          }}
        >
          <DateTimePicker
            value={pendingDate}
            mode="date"
            display="spinner"
            locale="vi-VN"
            minimumDate={minimumDate}
            maximumDate={maximumDate}
            onChange={(_event, selectedDate) => {
              if (selectedDate) setPendingDate(selectedDate);
            }}
          />
        </Modal>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 },
  overlayWithClear: { right: 48 },
});
