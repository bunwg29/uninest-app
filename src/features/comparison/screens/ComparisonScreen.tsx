import { useState, type ReactNode } from 'react';
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
import { Button, EmptyState, HeaderBar, ScreenContainer, Typography } from '@ui';
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

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();

      return;
    }

    navigation.navigate('Main');
  };

  return (
    <ScreenContainer keyboardAvoiding={false}>
      <HeaderBar
        title="So sánh phòng"
        subtitle={`${items.length}/${MAX_COMPARISON_ITEMS} tin`}
        onBack={handleBack}
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
          onAction={handleBack}
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
            <View style={[styles.table, { width: items.length * columnWidth + 2 }]}>
              <ComparisonRow items={items} width={columnWidth} variant="image">
                {(item) => <ComparisonImage item={item} />}
              </ComparisonRow>
              <ComparisonRow items={items} width={columnWidth} variant="title">
                {(item) => (
                  <Typography variant="body1" weight="BOLD" numberOfLines={3} ellipsizeMode="tail">
                    {item.title}
                  </Typography>
                )}
              </ComparisonRow>
              <ComparisonRow items={items} width={columnWidth}>
                {(item) => <Criterion label="Giá" value={formatComparisonPrice(item.price)} />}
              </ComparisonRow>
              <ComparisonRow items={items} width={columnWidth}>
                {(item) => (
                  <Criterion label="Diện tích" value={formatComparisonMeasure(item.area, 'm²')} />
                )}
              </ComparisonRow>
              <ComparisonRow items={items} width={columnWidth}>
                {(item) => (
                  <Criterion
                    label="Số người ở"
                    value={formatComparisonMeasure(item.maxOccupants, 'người')}
                    icon="users"
                  />
                )}
              </ComparisonRow>
              <ComparisonRow items={items} width={columnWidth}>
                {(item) => (
                  <Criterion label="Khoảng cách" value={formatDistance(item.distanceMeters)} />
                )}
              </ComparisonRow>
              <ComparisonRow items={items} width={columnWidth}>
                {(item) => (
                  <Criterion
                    label="Tiện ích"
                    value={
                      item.amenities?.length
                        ? item.amenities.map((amenity) => amenity.name).join(', ')
                        : 'Chưa có dữ liệu'
                    }
                  />
                )}
              </ComparisonRow>
              <ComparisonRow items={items} width={columnWidth}>
                {(item) => {
                  const hasRating =
                    item.averageRating !== null &&
                    item.averageRating !== undefined &&
                    Number.isFinite(item.averageRating);

                  return (
                    <Criterion
                      label="Đánh giá"
                      value={formatRating(item.averageRating)}
                      icon={hasRating ? 'star' : undefined}
                    />
                  );
                }}
              </ComparisonRow>
              <ComparisonRow items={items} width={columnWidth} variant="action">
                {(item) => (
                  <Button
                    title="Xem chi tiết"
                    variant="outline"
                    onPress={() => navigation.navigate('ListingDetail', { id: item.id })}
                    fullWidth
                  />
                )}
              </ComparisonRow>
              <ComparisonRow items={items} width={columnWidth} variant="action">
                {(item) => (
                  <Button
                    title="Bỏ khỏi so sánh"
                    variant="ghost"
                    onPress={() => remove(item.id)}
                    fullWidth
                  />
                )}
              </ComparisonRow>
            </View>
          </ScrollView>
        </ScrollView>
      )}
    </ScreenContainer>
  );
};

const ComparisonRow = ({
  items,
  width,
  variant,
  children,
}: {
  items: ComparisonItem[];
  width: number;
  variant?: 'image' | 'title' | 'action';
  children: (item: ComparisonItem) => ReactNode;
}) => (
  <View style={styles.row}>
    {items.map((item) => (
      <View
        key={item.id}
        style={[
          styles.cell,
          { width },
          variant === 'image' && styles.imageCell,
          variant === 'title' && styles.titleCell,
          variant === 'action' && styles.actionCell,
        ]}
      >
        {children(item)}
      </View>
    ))}
  </View>
);

const ComparisonImage = ({ item }: { item: ComparisonItem }) => {
  const [hasError, setHasError] = useState(false);
  const coverImage = item.images?.find((image) => image.isCover) ?? item.images?.[0];

  return coverImage?.url && !hasError ? (
    <Image
      source={{ uri: coverImage.url }}
      style={styles.image}
      resizeMode="cover"
      onError={() => setHasError(true)}
    />
  ) : (
    <View style={styles.imageFallback}>
      <ImageOff size={32} color={THEME_COLORS.TEXT_PLACEHOLDER} />
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
  <View>
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
  if (distanceMeters === undefined || !Number.isFinite(distanceMeters)) {
    return 'Chưa có dữ liệu';
  }

  return distanceMeters >= 1000
    ? `${(distanceMeters / 1000).toFixed(1)} km`
    : `${Math.round(distanceMeters)} m`;
};

const formatComparisonPrice = (price: number | null | undefined): string =>
  price === null || price === undefined || !Number.isFinite(price)
    ? 'Chưa có dữ liệu'
    : `${formatVND(price)} / tháng`;

const formatComparisonMeasure = (value: number | null | undefined, unit: string): string =>
  value === null || value === undefined || !Number.isFinite(value)
    ? 'Chưa có dữ liệu'
    : `${value} ${unit}`;

const formatRating = (rating: number | null | undefined): string =>
  rating === null || rating === undefined || !Number.isFinite(rating)
    ? 'Chưa có dữ liệu'
    : rating.toFixed(1);

const styles = StyleSheet.create({
  emptyState: { flex: 1 },
  verticalContent: { paddingVertical: SPACING_TOKENS.MD },
  hint: { paddingHorizontal: SPACING_TOKENS.MD, marginBottom: SPACING_TOKENS.SM },
  columns: {
    paddingHorizontal: SPACING_TOKENS.MD,
    paddingBottom: SPACING_TOKENS.LG,
  },
  table: {
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: THEME_COLORS.BORDER,
    borderRadius: BORDER_RADIUS_TOKENS.LG,
    backgroundColor: THEME_COLORS.SURFACE,
  },
  row: { flexDirection: 'row', alignItems: 'stretch' },
  cell: {
    padding: SPACING_TOKENS.MD,
    borderRightWidth: 1,
    borderTopWidth: 1,
    borderColor: THEME_COLORS.DIVIDER,
  },
  imageCell: { padding: 0, borderTopWidth: 0 },
  titleCell: { minHeight: 78 },
  actionCell: { justifyContent: 'center' },
  image: { width: '100%', height: 160 },
  imageFallback: {
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: THEME_COLORS.SURFACE_MUTED,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING_TOKENS.XS,
    marginTop: SPACING_TOKENS.XS,
  },
  valueText: { flex: 1 },
});
