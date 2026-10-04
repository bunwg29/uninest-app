import { StyleSheet, View } from 'react-native';
import { BORDER_RADIUS_TOKENS, SPACING_TOKENS, THEME_COLORS } from '@theme';
import { Typography } from '@ui';
import type { RoommateCriteria } from '../types';
import { ROOMMATE_GENDER_OPTIONS } from '../types';
import { formatCostPerPerson, formatDisplayDate } from '../utils';

export interface RoommateInfoTableProps {
  roommate: RoommateCriteria;
  mode?: 'feed' | 'roommate-feed' | 'detail';
}

type InfoRow = { label: string; value: string };

const buildMoveInText = (roommate: RoommateCriteria, isDetail: boolean) => {
  const moveInDate = formatDisplayDate(roommate.moveInDate);
  const stayText = roommate.minStayMonths ? `ở tối thiểu ${roommate.minStayMonths} tháng` : '';

  if (!moveInDate) return stayText ? `Linh hoạt, ${stayText}` : '';

  const prefix = isDetail ? 'Dọn vào từ' : 'Từ';

  return [`${prefix} ${moveInDate}`, stayText].filter(Boolean).join(', ');
};

const buildRows = (roommate: RoommateCriteria, mode: RoommateInfoTableProps['mode']) => {
  const isDetail = mode === 'detail';
  const costText = [formatCostPerPerson(roommate.costPerPerson), roommate.costNote]
    .filter(Boolean)
    .join(' + ');
  const genderLabel =
    roommate.genderLabel ??
    ROOMMATE_GENDER_OPTIONS.find((option) => option.value === roommate.gender)?.label ??
    '';
  const criteriaText = [
    roommate.gender !== 'any' && !isDetail ? genderLabel : '',
    roommate.lifestyle,
  ]
    .filter(Boolean)
    .join(' · ');

  if (mode === 'roommate-feed') {
    return [
      { label: 'CHI PHÍ', value: costText },
      { label: 'KHU VỰC', value: roommate.area ?? '' },
      { label: 'DỌN VÀO', value: formatDisplayDate(roommate.moveInDate) || 'Linh hoạt' },
    ];
  }

  const rows: InfoRow[] = [
    ...(isDetail ? [{ label: 'GIỚI TÍNH', value: genderLabel }] : []),
    { label: 'CHI PHÍ', value: costText },
    { label: 'THỜI GIAN', value: buildMoveInText(roommate, isDetail) },
    { label: 'TIÊU CHÍ', value: criteriaText },
    ...(isDetail ? [{ label: 'KHU VỰC', value: roommate.area ?? '' }] : []),
  ];

  return rows;
};

export const RoommateInfoTable = ({ roommate, mode = 'feed' }: RoommateInfoTableProps) => {
  const rows = buildRows(roommate, mode).filter((row) => row.value);

  return (
    <View style={styles.container}>
      {rows.map((row) => (
        <View key={row.label} style={styles.row}>
          <Typography variant="tiny" colorKey="TEXT_MUTED" style={styles.label}>
            {row.label}
          </Typography>

          <Typography
            variant="body2"
            colorKey="TEXT_PRIMARY"
            style={styles.value}
            numberOfLines={mode === 'detail' ? undefined : 2}
          >
            {row.value}
          </Typography>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: THEME_COLORS.BACKGROUND,
    borderRadius: BORDER_RADIUS_TOKENS.MD,
    padding: SPACING_TOKENS.MD,
    gap: SPACING_TOKENS.SM,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  label: {
    width: 92,
    paddingTop: 3,
    letterSpacing: 0.5,
  },
  value: {
    flex: 1,
  },
});
