import {
  Modal,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { Check, X } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  BORDER_RADIUS_TOKENS,
  OVERLAY_COLORS,
  SPACING_TOKENS,
  THEME_COLORS,
  TYPOGRAPHY_TOKENS,
} from '@theme';
import { Button, Typography } from '@ui';
import type { ListingDetailAmenity } from '../types';
import { getAmenityIcon } from './amenityIcons';

interface AmenitiesModalProps {
  isVisible: boolean;
  amenities: ListingDetailAmenity[];
  onClose: () => void;
}

const GROUP_LABELS: Record<number, string> = {
  0: 'Nội thất',
  1: 'Tiện ích',
  2: 'An ninh',
  3: 'Phòng',
};

const SHEET_MAX_HEIGHT = '76%';
const MAX_SHEET_WIDTH = 560;
const ROW_HEIGHT = 36;

export const AmenitiesModal = ({ isVisible, amenities, onClose }: AmenitiesModalProps) => {
  const insets = useSafeAreaInsets();
  const groups = amenities.reduce<Record<string, ListingDetailAmenity[]>>((result, amenity) => {
    const key = String(amenity.group);

    result[key] = [...(result[key] ?? []), amenity];

    return result;
  }, {});
  const groupEntries = Object.entries(groups);

  return (
    <Modal visible={isVisible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose} accessibilityLabel="Đóng danh sách tiện ích">
        <View style={styles.backdrop} />
      </TouchableWithoutFeedback>

      <View style={styles.sheetWrapper} pointerEvents="box-none">
        <View style={styles.sheet}>
          <View style={styles.handle} />

          <View style={styles.header}>
            <Typography variant="h3" weight="SEMIBOLD">
              {`${amenities.length} tiện ích`}
            </Typography>
            <TouchableOpacity
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Đóng"
              style={styles.close}
            >
              <X size={19} color={THEME_COLORS.TEXT_PRIMARY} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
            {groupEntries.map(([group, items], index) => (
              <View key={group} style={index > 0 ? styles.groupDivided : undefined}>
                <Typography
                  variant="caption"
                  weight="MEDIUM"
                  colorKey="TEXT_PLACEHOLDER"
                  style={styles.groupLabel}
                >
                  {(GROUP_LABELS[Number(group)] ?? 'Khác').toUpperCase()}
                </Typography>

                {items.map((amenity) => {
                  const Icon = getAmenityIcon(amenity.id);

                  return (
                    <View key={amenity.id} style={styles.row}>
                      <Icon size={20} color={THEME_COLORS.TEXT_SECONDARY} />
                      <Typography
                        variant="body1"
                        colorKey="TEXT_SECONDARY"
                        style={styles.rowLabel}
                        numberOfLines={1}
                      >
                        {amenity.name}
                      </Typography>
                      <Check size={18} color={THEME_COLORS.SUCCESS} />
                    </View>
                  );
                })}
              </View>
            ))}
          </ScrollView>

          <View
            style={[styles.footer, { paddingBottom: Math.max(insets.bottom, SPACING_TOKENS.MD) }]}
          >
            <Button title="Đóng" size="lg" fullWidth onPress={onClose} />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFill, backgroundColor: OVERLAY_COLORS.SHEET_BACKDROP },
  sheetWrapper: { flex: 1, justifyContent: 'flex-end' },
  sheet: {
    width: '100%',
    maxWidth: MAX_SHEET_WIDTH,
    maxHeight: SHEET_MAX_HEIGHT,
    alignSelf: 'center',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: THEME_COLORS.SURFACE,
    shadowColor: OVERLAY_COLORS.SHADOW,
    shadowOpacity: 0.16,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: -6 },
    elevation: 12,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    marginTop: 10,
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
    backgroundColor: OVERLAY_COLORS.FIELD_BORDER,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 40,
    marginTop: 14,
    paddingHorizontal: SPACING_TOKENS.MD,
  },
  close: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BORDER_RADIUS_TOKENS.MD,
    backgroundColor: THEME_COLORS.BACKGROUND,
  },
  content: { paddingHorizontal: SPACING_TOKENS.MD, paddingTop: SPACING_TOKENS.MD },
  groupLabel: { height: SPACING_TOKENS.MD, letterSpacing: 0.2, marginBottom: SPACING_TOKENS.SM },
  groupDivided: {
    marginTop: SPACING_TOKENS.SM,
    paddingTop: SPACING_TOKENS.MD,
    borderTopWidth: 1,
    borderTopColor: THEME_COLORS.DIVIDER,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING_TOKENS.MD - SPACING_TOKENS.XS,
    height: ROW_HEIGHT,
  },
  rowLabel: { flex: 1, fontSize: TYPOGRAPHY_TOKENS.FONT_SIZES.BASE, lineHeight: 24 },
  footer: { paddingHorizontal: SPACING_TOKENS.MD, paddingTop: SPACING_TOKENS.MD },
});
