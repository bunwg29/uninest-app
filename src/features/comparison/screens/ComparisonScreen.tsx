import {
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ImageOff, Scale, Star, Trash2, Users } from 'lucide-react-native';
import { formatVND } from '@core';
import type { RootStackParamList } from '@navigation';
import { BORDER_RADIUS_TOKENS, SPACING_TOKENS, THEME_COLORS } from '@theme';
import { Button, EmptyState, HeaderBar, Typography } from '@ui';
import type { ComparisonItem } from '../types';
import { MAX_COMPARISON_ITEMS, useComparisonStore } from '../store';

type ComparisonNavigation = NativeStackNavigationProp<RootStackParamList>;

export const ComparisonScreen = () => {
  const navigation = useNavigation<ComparisonNavigation>();
  const { width } = useWindowDimensions();
  const items = useComparisonStore((state) => state.items);
  const remove = useComparisonStore((state) => state.remove);
  const clear = useComparisonStore((state) => state.clear);
  const columnWidth = Math.min(300, Math.max(220, width - SPACING_TOKENS.XL * 2));

  return (
    <View style={styles.screen}>
      <HeaderBar
        title="So sánh phòng"
        subtitle={`${items.length}/${MAX_COMPARISON_ITEMS} tin`}
        onBack={() => navigation.goBack()}
        rightAction={
          items.length > 0 ? (
            <TouchableOpacity accessibilityLabel="Xoá danh sách so sánh" onPress={clear}>
              <Trash2 size={21} color={THEME_COLORS.ERROR} />
            </TouchableOpacity>
          ) : null
        }
      />

      {items.length === 0 ? (
        <EmptyState
          title="Chưa có phòng để so sánh"
          description="Mở chi tiết phòng và chọn “Thêm vào so sánh”."
          icon={<Scale size={38} color={THEME_COLORS.TEXT_PLACEHOLDER} />}
          actionTitle="Quay lại"
          onAction={() => navigation.goBack()}
          style={styles.emptyState}
        />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.verticalContent}
        >
          <Typography variant="body2" colorKey="TEXT_MUTED" style={styles.hint}>
            Vuốt ngang để xem các phòng đã chọn.
          </Typography>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator
            contentContainerStyle={styles.columns}
          >
            {items.map((item) => (
              <ComparisonColumn
                key={item.id}
                item={item}
                width={columnWidth}
                onRemove={() => remove(item.id)}
                onOpen={() => navigation.navigate('ListingDetail', { id: item.id })}
              />
            ))}
          </ScrollView>
        </ScrollView>
      )}
    </View>
  );
};

const ComparisonColumn = ({
  item,
  width,
  onRemove,
  onOpen,
}: {
  item: ComparisonItem;
  width: number;
  onRemove: () => void;
  onOpen: () => void;
}) => {
  const coverImage = item.images.find((image) => image.isCover) ?? item.images[0];

  return (
    <View style={[styles.column, { width }]}>
      {coverImage ? (
        <Image source={{ uri: coverImage.url }} style={styles.image} resizeMode="cover" />
      ) : (
        <View style={styles.imageFallback}>
          <ImageOff size={32} color={THEME_COLORS.TEXT_PLACEHOLDER} />
        </View>
      )}

      <View style={styles.columnContent}>
        <Typography variant="body1" weight="BOLD" numberOfLines={3} style={styles.title}>
          {item.title}
        </Typography>

        <Criterion label="Giá" value={`${formatVND(item.price)}/tháng`} />
        <Criterion label="Diện tích" value={`${item.area} m²`} />
        <Criterion label="Số người ở" value={`${item.maxOccupants} người`} icon="users" />
        <Criterion label="Khoảng cách" value={formatDistance(item.distanceMeters)} />
        <Criterion
          label="Tiện ích"
          value={
            item.amenities.length > 0
              ? item.amenities.map((amenity) => amenity.name).join(', ')
              : 'Chưa có dữ liệu'
          }
        />
        <Criterion
          label="Đánh giá"
          value={
            item.averageRating === null || item.averageRating === undefined
              ? 'Chưa có dữ liệu'
              : item.averageRating.toFixed(1)
          }
          icon={
            item.averageRating === null || item.averageRating === undefined ? undefined : 'star'
          }
        />

        <Button title="Xem chi tiết" variant="outline" onPress={onOpen} fullWidth />
        <Button
          title="Bỏ khỏi so sánh"
          variant="ghost"
          onPress={onRemove}
          fullWidth
          style={styles.removeButton}
        />
      </View>
    </View>
  );
};

const Criterion = ({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: 'star' | 'users';
}) => (
  <View style={styles.criterion}>
    <Typography variant="caption" weight="SEMIBOLD" colorKey="TEXT_MUTED">
      {label}
    </Typography>
    <View style={styles.valueRow}>
      {icon === 'star' ? (
        <Star size={15} color={THEME_COLORS.SECONDARY} fill={THEME_COLORS.SECONDARY} />
      ) : null}
      {icon === 'users' ? <Users size={15} color={THEME_COLORS.TEXT_SECONDARY} /> : null}
      <Typography variant="body2" weight="SEMIBOLD" style={styles.valueText}>
        {value}
      </Typography>
    </View>
  </View>
);

const formatDistance = (distanceMeters?: number): string => {
  if (distanceMeters === undefined) {
    return 'Chưa có dữ liệu';
  }

  return distanceMeters >= 1000
    ? `${(distanceMeters / 1000).toFixed(1)} km`
    : `${Math.round(distanceMeters)} m`;
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: THEME_COLORS.BACKGROUND },
  emptyState: { flex: 1 },
  verticalContent: { paddingVertical: SPACING_TOKENS.MD },
  hint: { paddingHorizontal: SPACING_TOKENS.MD, marginBottom: SPACING_TOKENS.SM },
  columns: {
    paddingHorizontal: SPACING_TOKENS.MD,
    paddingBottom: SPACING_TOKENS.LG,
    gap: SPACING_TOKENS.MD,
  },
  column: {
    alignSelf: 'flex-start',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: THEME_COLORS.BORDER,
    borderRadius: BORDER_RADIUS_TOKENS.LG,
    backgroundColor: THEME_COLORS.SURFACE,
  },
  image: { width: '100%', height: 160 },
  imageFallback: {
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: THEME_COLORS.SURFACE_MUTED,
  },
  columnContent: { padding: SPACING_TOKENS.MD },
  title: { minHeight: 66, marginBottom: SPACING_TOKENS.SM },
  criterion: {
    paddingVertical: SPACING_TOKENS.SM,
    borderTopWidth: 1,
    borderTopColor: THEME_COLORS.DIVIDER,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING_TOKENS.XS,
    marginTop: SPACING_TOKENS.XS,
  },
  valueText: { flex: 1 },
  removeButton: { marginTop: SPACING_TOKENS.XS },
});
