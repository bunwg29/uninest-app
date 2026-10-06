import { useEffect, useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { ImageOff, MapPin, Maximize2 } from 'lucide-react-native';
import { Button, Typography } from '@ui';
import { BORDER_RADIUS_TOKENS, SPACING_TOKENS, THEME_COLORS } from '@theme';
import type { Room } from '../types';

interface RoomCardProps {
  room: Room;
  onBook: (room: Room) => void;
}

export const RoomCard = ({ room, onBook }: RoomCardProps) => {
  const [hasImageError, setHasImageError] = useState(false);

  useEffect(() => {
    setHasImageError(false);
  }, [room.imageUrl]);

  return (
    <View style={styles.container}>
      {room.imageUrl && !hasImageError ? (
        <Image
          source={{ uri: room.imageUrl }}
          style={styles.image}
          resizeMode="cover"
          onError={() => setHasImageError(true)}
        />
      ) : (
        <View style={styles.imagePlaceholder}>
          <ImageOff size={32} color={THEME_COLORS.TEXT_PLACEHOLDER} />
          <Typography variant="caption" colorKey="TEXT_MUTED">
            Chưa có ảnh phòng
          </Typography>
        </View>
      )}

      <View style={styles.content}>
        <View style={styles.headingRow}>
          <Typography variant="h3" weight="BOLD" style={styles.title} numberOfLines={2}>
            {room.title}
          </Typography>
          {!room.isActive ? (
            <View style={styles.inactiveBadge}>
              <Typography variant="tiny" weight="SEMIBOLD" colorKey="TEXT_MUTED">
                Ngừng cho thuê
              </Typography>
            </View>
          ) : null}
        </View>

        <View style={styles.addressRow}>
          <MapPin size={15} color={THEME_COLORS.TEXT_MUTED} />
          <Typography
            variant="caption"
            colorKey="TEXT_MUTED"
            numberOfLines={2}
            style={styles.flexText}
          >
            {room.address || 'Chưa cập nhật địa chỉ'}
          </Typography>
        </View>

        <View style={styles.metaRow}>
          <Typography variant="h3" weight="BOLD" colorKey="PRIMARY">
            {room.price > 0 ? `${room.price.toLocaleString('vi-VN')}đ/tháng` : 'Liên hệ'}
          </Typography>
          <View style={styles.areaRow}>
            <Maximize2 size={15} color={THEME_COLORS.TEXT_SECONDARY} />
            <Typography variant="body2" colorKey="TEXT_SECONDARY">
              {room.area} m²
            </Typography>
          </View>
        </View>

        <Button
          title="Đặt lịch xem phòng"
          fullWidth
          disabled={!room.isActive}
          onPress={() => onBook(room)}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: THEME_COLORS.BORDER,
    borderRadius: BORDER_RADIUS_TOKENS.LG,
    backgroundColor: THEME_COLORS.SURFACE,
  },
  image: { width: '100%', height: 190 },
  imagePlaceholder: {
    height: 190,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING_TOKENS.XS,
    backgroundColor: THEME_COLORS.SURFACE_MUTED,
  },
  content: { padding: SPACING_TOKENS.MD, gap: SPACING_TOKENS.SM },
  headingRow: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING_TOKENS.SM },
  title: { flex: 1 },
  inactiveBadge: {
    paddingHorizontal: SPACING_TOKENS.SM,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
    backgroundColor: THEME_COLORS.SURFACE_MUTED,
  },
  addressRow: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING_TOKENS.XS },
  flexText: { flex: 1 },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING_TOKENS.SM,
  },
  areaRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
});
