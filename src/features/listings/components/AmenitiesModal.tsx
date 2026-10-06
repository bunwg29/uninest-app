import { Modal, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { X } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BORDER_RADIUS_TOKENS, SPACING_TOKENS, THEME_COLORS } from '@theme';
import { Typography } from '@ui';
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

export const AmenitiesModal = ({ isVisible, amenities, onClose }: AmenitiesModalProps) => {
  const insets = useSafeAreaInsets();
  const groups = amenities.reduce<Record<string, ListingDetailAmenity[]>>((result, amenity) => {
    const key = String(amenity.group);

    result[key] = [...(result[key] ?? []), amenity];

    return result;
  }, {});

  return (
    <Modal visible={isVisible} animationType="slide" onRequestClose={onClose}>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Typography variant="h3" weight="BOLD">
            Tất cả tiện ích
          </Typography>
          <TouchableOpacity onPress={onClose} accessibilityLabel="Đóng" style={styles.close}>
            <X size={22} color={THEME_COLORS.TEXT_PRIMARY} />
          </TouchableOpacity>
        </View>
        <ScrollView
          contentContainerStyle={[
            styles.content,
            { paddingBottom: Math.max(insets.bottom, SPACING_TOKENS.LG) },
          ]}
        >
          {Object.entries(groups).map(([group, items]) => (
            <View key={group} style={styles.group}>
              <Typography variant="body2" weight="BOLD" colorKey="TEXT_MUTED">
                {GROUP_LABELS[Number(group)] ?? 'Khác'}
              </Typography>
              {items.map((amenity) => {
                const Icon = getAmenityIcon(amenity.id);

                return (
                  <View key={amenity.id} style={styles.row}>
                    <Icon size={20} color={THEME_COLORS.PRIMARY} />
                    <Typography variant="body1">{amenity.name}</Typography>
                  </View>
                );
              })}
            </View>
          ))}
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME_COLORS.SURFACE },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING_TOKENS.MD,
    paddingVertical: SPACING_TOKENS.SM,
    borderBottomWidth: 1,
    borderBottomColor: THEME_COLORS.DIVIDER,
  },
  close: { padding: SPACING_TOKENS.SM, borderRadius: BORDER_RADIUS_TOKENS.FULL },
  content: {
    width: '100%',
    maxWidth: 720,
    alignSelf: 'center',
    padding: SPACING_TOKENS.MD,
    gap: SPACING_TOKENS.LG,
  },
  group: { gap: SPACING_TOKENS.SM },
  row: { flexDirection: 'row', alignItems: 'center', gap: SPACING_TOKENS.MD },
});
