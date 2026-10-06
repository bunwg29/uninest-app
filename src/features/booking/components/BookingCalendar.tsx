import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { BORDER_RADIUS_TOKENS, OVERLAY_COLORS, THEME_COLORS } from '@theme';
import { Typography } from '@ui';
import { formatDateKey } from '../utils';

export type CalendarMode = 'month' | 'week';

interface CalendarCell {
  key: string;
  day: number;
  isCurrentMonth: boolean;
  isPast: boolean;
  isToday: boolean;
}

const WEEKDAYS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
const DAYS_PER_WEEK = 7;

const parseDateKey = (dateKey: string) => new Date(`${dateKey}T12:00:00`);

const getMondayOffset = (date: Date) => (date.getDay() + 6) % DAYS_PER_WEEK;

const addDays = (date: Date, amount: number) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate() + amount);

const createCells = (anchorKey: string, mode: CalendarMode): CalendarCell[] => {
  const anchor = parseDateKey(anchorKey);
  const todayKey = formatDateKey(new Date());
  const anchorMonth = anchor.getMonth();
  let start = addDays(anchor, -getMondayOffset(anchor));
  let length = DAYS_PER_WEEK;

  if (mode === 'month') {
    const firstOfMonth = new Date(anchor.getFullYear(), anchorMonth, 1);
    const lastOfMonth = new Date(anchor.getFullYear(), anchorMonth + 1, 0);

    start = addDays(firstOfMonth, -getMondayOffset(firstOfMonth));
    length =
      Math.ceil((getMondayOffset(firstOfMonth) + lastOfMonth.getDate()) / DAYS_PER_WEEK) *
      DAYS_PER_WEEK;
  }

  return Array.from({ length }, (_, index) => {
    const date = addDays(start, index);
    const key = formatDateKey(date);

    return {
      key,
      day: date.getDate(),
      isCurrentMonth: mode === 'week' || date.getMonth() === anchorMonth,
      isPast: key <= todayKey,
      isToday: key === todayKey,
    };
  });
};

const shiftAnchor = (anchorKey: string, mode: CalendarMode, direction: -1 | 1) => {
  const anchor = parseDateKey(anchorKey);

  return formatDateKey(
    mode === 'month'
      ? new Date(anchor.getFullYear(), anchor.getMonth() + direction, 1)
      : addDays(anchor, direction * DAYS_PER_WEEK)
  );
};

const formatDisplayDate = (key: string) => key.split('-').reverse().join('/');

export const BookingCalendar = ({
  anchorDate,
  selectedDate,
  mode,
  onSelect,
  onAnchorChange,
}: {
  anchorDate: string;
  selectedDate: string | null;
  mode: CalendarMode;
  onSelect: (dateKey: string) => void;
  onAnchorChange: (dateKey: string) => void;
}) => {
  const cells = createCells(anchorDate, mode);
  const anchor = parseDateKey(anchorDate);
  const todayKey = formatDateKey(new Date());
  const previousAnchor = shiftAnchor(anchorDate, mode, -1);
  const isPreviousEnabled =
    mode === 'month'
      ? previousAnchor.slice(0, 7) >= todayKey.slice(0, 7)
      : formatDateKey(addDays(parseDateKey(cells[0]?.key ?? anchorDate), -1)) > todayKey;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.navButton}
          disabled={!isPreviousEnabled}
          onPress={() => onAnchorChange(previousAnchor)}
          accessibilityLabel={mode === 'month' ? 'Tháng trước' : 'Tuần trước'}
        >
          <ChevronLeft
            size={18}
            color={isPreviousEnabled ? THEME_COLORS.TEXT_PRIMARY : OVERLAY_COLORS.FIELD_BORDER}
          />
        </TouchableOpacity>
        <Typography variant="h3" weight="SEMIBOLD" align="center">
          {`Tháng ${anchor.getMonth() + 1}, ${anchor.getFullYear()}`}
        </Typography>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => onAnchorChange(shiftAnchor(anchorDate, mode, 1))}
          accessibilityLabel={mode === 'month' ? 'Tháng sau' : 'Tuần sau'}
        >
          <ChevronRight size={18} color={THEME_COLORS.TEXT_PRIMARY} />
        </TouchableOpacity>
      </View>
      <View style={styles.weekRow}>
        {WEEKDAYS.map((weekday) => (
          <Typography
            key={weekday}
            variant="caption"
            weight="SEMIBOLD"
            colorKey="TEXT_PLACEHOLDER"
            align="center"
            style={styles.cell}
          >
            {weekday}
          </Typography>
        ))}
      </View>
      <View style={styles.grid}>
        {cells.map((cell) => {
          const isSelectable = cell.isCurrentMonth && !cell.isPast;
          const isSelected = cell.key === selectedDate && isSelectable;
          const textColor = isSelected
            ? THEME_COLORS.WHITE
            : cell.isCurrentMonth && (isSelectable || cell.isToday)
              ? THEME_COLORS.TEXT_PRIMARY
              : OVERLAY_COLORS.FIELD_BORDER;

          return (
            <TouchableOpacity
              key={cell.key}
              disabled={!isSelectable}
              onPress={() => onSelect(cell.key)}
              accessibilityLabel={`Ngày ${formatDisplayDate(cell.key)}`}
              style={[
                styles.cell,
                styles.day,
                isSelectable && styles.dayWithDot,
                cell.isToday && styles.today,
                isSelected && styles.selected,
              ]}
            >
              <Typography variant="body1" weight="SEMIBOLD" color={textColor}>
                {cell.day}
              </Typography>
              {isSelectable ? (
                <View style={[styles.dot, isSelected && styles.dotSelected]} />
              ) : null}
            </TouchableOpacity>
          );
        })}
      </View>
      {mode === 'month' ? (
        <>
          <View style={styles.divider} />
          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View style={styles.legendDot} />
              <Typography variant="caption" weight="MEDIUM" colorKey="TEXT_PLACEHOLDER">
                Chủ trọ rảnh
              </Typography>
            </View>
            <View style={styles.legendItem}>
              <View style={styles.legendToday} />
              <Typography variant="caption" weight="MEDIUM" colorKey="TEXT_PLACEHOLDER">
                Hôm nay
              </Typography>
            </View>
          </View>
        </>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: BORDER_RADIUS_TOKENS.LG,
    backgroundColor: THEME_COLORS.SURFACE,
    shadowColor: OVERLAY_COLORS.SHADOW,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  navButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  weekRow: { flexDirection: 'row', marginTop: 14, marginBottom: 14 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', rowGap: 4 },
  cell: { width: '14.285%' },
  day: {
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BORDER_RADIUS_TOKENS.MD,
  },
  dayWithDot: { paddingBottom: 6 },
  today: { borderWidth: 1, borderColor: THEME_COLORS.PRIMARY },
  selected: { backgroundColor: THEME_COLORS.PRIMARY },
  dot: {
    position: 'absolute',
    bottom: 9,
    width: 4,
    height: 4,
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
    backgroundColor: THEME_COLORS.PRIMARY,
  },
  dotSelected: { backgroundColor: THEME_COLORS.WHITE },
  divider: { height: 1, marginTop: 14, backgroundColor: THEME_COLORS.SURFACE_MUTED },
  legend: { flexDirection: 'row', alignItems: 'center', gap: 18, paddingTop: 13 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: {
    width: 6,
    height: 6,
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
    backgroundColor: THEME_COLORS.PRIMARY,
  },
  legendToday: {
    width: 12,
    height: 12,
    borderWidth: 1,
    borderColor: THEME_COLORS.PRIMARY,
    borderRadius: BORDER_RADIUS_TOKENS.XS,
  },
});
