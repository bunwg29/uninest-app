import { useMemo, useState } from 'react';
import { Modal as RNModal, Pressable, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CalendarDays, ChevronLeft, ChevronRight, XCircle } from 'lucide-react-native';
import { BORDER_RADIUS_TOKENS, OVERLAY_COLORS, SPACING_TOKENS, THEME_COLORS } from '@theme';
import { Typography } from '../atoms/Typography';
import { Button } from '../atoms/Button';
import { Input, type InputProps } from './Input';

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
  title?: string;
}

const WEEKDAYS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'] as const;
const DAYS_PER_WEEK = 7;

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

const startOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1);

const buildMonthCells = (month: Date) => {
  const first = startOfMonth(month);
  const offset = (first.getDay() + 6) % DAYS_PER_WEEK;
  const daysInMonth = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
  const length = Math.ceil((offset + daysInMonth) / DAYS_PER_WEEK) * DAYS_PER_WEEK;

  return Array.from({ length }, (_, index) => {
    const day = index - offset + 1;

    return day >= 1 && day <= daysInMonth
      ? new Date(first.getFullYear(), first.getMonth(), day)
      : null;
  });
};

const isBeforeDay = (first: Date, second: Date) => toIsoDate(first) < toIsoDate(second);

export const DatePickerField = ({
  value,
  onChange,
  minimumDate,
  maximumDate,
  clearable = true,
  title,
  placeholder = 'Chọn ngày',
  ...inputProps
}: DatePickerFieldProps) => {
  const insets = useSafeAreaInsets();
  const [isVisible, setIsVisible] = useState(false);
  const [visibleMonth, setVisibleMonth] = useState(() => startOfMonth(new Date()));
  const [pendingDate, setPendingDate] = useState<Date | null>(null);
  const cells = useMemo(() => buildMonthCells(visibleMonth), [visibleMonth]);
  const todayKey = toIsoDate(new Date());
  const hasClear = clearable && Boolean(value);
  const canGoBack =
    !minimumDate || isBeforeDay(startOfMonth(minimumDate), startOfMonth(visibleMonth));
  const canGoForward =
    !maximumDate ||
    isBeforeDay(
      startOfMonth(visibleMonth),
      new Date(maximumDate.getFullYear(), maximumDate.getMonth(), 1)
    );

  const isDisabled = (date: Date) =>
    Boolean(
      (minimumDate && isBeforeDay(date, minimumDate)) ||
      (maximumDate && isBeforeDay(maximumDate, date))
    );

  const handleOpen = () => {
    const current = fromIsoDate(value);

    setPendingDate(current);
    setVisibleMonth(startOfMonth(current ?? minimumDate ?? new Date()));
    setIsVisible(true);
  };

  const shiftMonth = (direction: -1 | 1) =>
    setVisibleMonth((month) => new Date(month.getFullYear(), month.getMonth() + direction, 1));

  const handleConfirm = () => {
    if (pendingDate) onChange(toIsoDate(pendingDate));

    setIsVisible(false);
  };

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
        accessibilityLabel={inputProps.label ?? title ?? placeholder}
      />

      <RNModal
        visible={isVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsVisible(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setIsVisible(false)}>
          <Pressable
            style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, SPACING_TOKENS.MD) }]}
            onPress={(event) => event.stopPropagation()}
          >
            <View style={styles.handle} />

            <Typography variant="h3" weight="BOLD" style={styles.title}>
              {title ?? inputProps.label ?? placeholder}
            </Typography>

            <View style={styles.monthRow}>
              <TouchableOpacity
                style={[styles.navButton, !canGoBack && styles.navButtonDisabled]}
                onPress={() => shiftMonth(-1)}
                disabled={!canGoBack}
                accessibilityRole="button"
                accessibilityLabel="Tháng trước"
              >
                <ChevronLeft size={20} color={THEME_COLORS.TEXT_PRIMARY} />
              </TouchableOpacity>

              <Typography variant="body1" weight="BOLD">
                {`Tháng ${visibleMonth.getMonth() + 1}, ${visibleMonth.getFullYear()}`}
              </Typography>

              <TouchableOpacity
                style={[styles.navButton, !canGoForward && styles.navButtonDisabled]}
                onPress={() => shiftMonth(1)}
                disabled={!canGoForward}
                accessibilityRole="button"
                accessibilityLabel="Tháng sau"
              >
                <ChevronRight size={20} color={THEME_COLORS.TEXT_PRIMARY} />
              </TouchableOpacity>
            </View>

            <View style={styles.grid}>
              {WEEKDAYS.map((weekday) => (
                <View key={weekday} style={styles.cell}>
                  <Typography variant="caption" weight="SEMIBOLD" colorKey="TEXT_MUTED">
                    {weekday}
                  </Typography>
                </View>
              ))}

              {cells.map((date, index) => {
                if (!date) return <View key={`empty-${index}`} style={styles.cell} />;

                const key = toIsoDate(date);
                const isSelected = pendingDate ? toIsoDate(pendingDate) === key : false;
                const disabled = isDisabled(date);
                const isToday = key === todayKey;

                return (
                  <View key={key} style={styles.cell}>
                    <TouchableOpacity
                      style={[
                        styles.day,
                        isToday && !isSelected && styles.dayToday,
                        isSelected && styles.daySelected,
                      ]}
                      onPress={() => setPendingDate(date)}
                      disabled={disabled}
                      accessibilityRole="button"
                      accessibilityState={{ selected: isSelected, disabled }}
                      accessibilityLabel={`Ngày ${formatDateForDisplay(key)}`}
                    >
                      <Typography
                        variant="body2"
                        weight={isSelected || isToday ? 'BOLD' : 'MEDIUM'}
                        color={
                          isSelected
                            ? THEME_COLORS.WHITE
                            : disabled
                              ? THEME_COLORS.TEXT_PLACEHOLDER
                              : isToday
                                ? THEME_COLORS.PRIMARY
                                : THEME_COLORS.TEXT_PRIMARY
                        }
                      >
                        {date.getDate()}
                      </Typography>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>

            <View style={styles.actions}>
              <Button
                title="Hủy"
                variant="outline"
                onPress={() => setIsVisible(false)}
                style={styles.actionButton}
              />
              <Button
                title="Chọn"
                onPress={handleConfirm}
                disabled={!pendingDate}
                style={styles.actionButton}
              />
            </View>
          </Pressable>
        </Pressable>
      </RNModal>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 },
  overlayWithClear: { right: 48 },
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: OVERLAY_COLORS.SHEET_BACKDROP,
  },
  sheet: {
    paddingHorizontal: SPACING_TOKENS.MD,
    paddingTop: SPACING_TOKENS.SM + 2,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: THEME_COLORS.SURFACE,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    marginBottom: SPACING_TOKENS.MD,
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
    backgroundColor: THEME_COLORS.BORDER,
  },
  title: { marginBottom: SPACING_TOKENS.SM },
  monthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING_TOKENS.SM,
  },
  navButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BORDER_RADIUS_TOKENS.MD,
    borderWidth: 1,
    borderColor: THEME_COLORS.BORDER,
  },
  navButtonDisabled: { opacity: 0.35 },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: {
    width: `${100 / DAYS_PER_WEEK}%`,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  day: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
  },
  dayToday: { borderWidth: 1, borderColor: THEME_COLORS.PRIMARY },
  daySelected: { backgroundColor: THEME_COLORS.PRIMARY },
  actions: {
    flexDirection: 'row',
    gap: SPACING_TOKENS.SM,
    marginTop: SPACING_TOKENS.MD,
  },
  actionButton: { flex: 1 },
});
