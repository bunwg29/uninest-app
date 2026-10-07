import { useState, type ReactNode } from 'react';
import { Image, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Check, MessageSquare, Minus, Star, X } from 'lucide-react-native';
import { BORDER_RADIUS_TOKENS, OVERLAY_COLORS, SPACING_TOKENS, THEME_COLORS } from '@theme';
import { Button, GradientView, Typography } from '@ui';
import { AvailabilityBadge } from '@features/listings/components/AvailabilityBadge';
import { useOpenListingChat } from '@features/chat/hooks/useOpenListingChat';
import {
  formatFullPrice,
  formatListingDistance,
  formatTravelEstimate,
  getPlaceholderGradient,
} from '@features/search';
import type { ComparisonItem } from '../types';
import {
  getAmenityRows,
  getBestIndexes,
  getDepositMonths,
  getInitials,
  getItemDistance,
} from '../utils';

interface ComparisonTableProps {
  items: ComparisonItem[];
  reference: { latitude?: number; longitude?: number };
  referenceLabel: string | null;
  onRemove: (listingId: string) => void;
  onOpenDetail: (listingId: string) => void;
}

const LABEL_COLUMN_WIDTH = 104;
const COLUMN_WIDTH = 180;
const COLUMN_GAP = 12;
const CELL_PADDING = 12;
const IMAGE_HEIGHT = 96;
const REMOVE_BUTTON_SIZE = 26;
const DIMMED_OPACITY = 0.45;
const AMENITY_ROW_HEIGHT = 29.5;
const AMENITY_BLOCK_PADDING = 4;
const AMENITY_ICON_SIZE = 15;
const PLACEHOLDER_TEXT = 'Chưa có dữ liệu';

const ROW_HEIGHTS = {
  image: 196,
  price: 64,
  area: 56,
  occupants: 56,
  distance: 64,
  rating: 56,
  deposit: 56,
  status: 56,
  landlord: 72,
  actions: 80,
} as const;

type RowKey = keyof typeof ROW_HEIGHTS;

const BANDED_ROWS: readonly RowKey[] = ['price', 'occupants', 'rating', 'status', 'landlord'];

export const ComparisonTable = ({
  items,
  reference,
  referenceLabel,
  onRemove,
  onOpenDetail,
}: ComparisonTableProps) => {
  const distances = items.map((item) =>
    isItemAvailable(item) ? getItemDistance(item, reference) : undefined
  );
  const bestPrice = getBestIndexes(
    items.map((item) => (isItemAvailable(item) ? item.price : undefined)),
    'min'
  );
  const bestArea = getBestIndexes(
    items.map((item) => (isItemAvailable(item) ? item.area : undefined)),
    'max'
  );
  const bestDistance = getBestIndexes(distances, 'min');
  const amenityRows = getAmenityRows(items);
  const amenityBlockHeight = AMENITY_BLOCK_PADDING + amenityRows.length * AMENITY_ROW_HEIGHT;

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.verticalContent}>
      <View style={styles.table}>
        <View style={styles.labelColumn}>
          <View style={{ height: ROW_HEIGHTS.image }} />
          <LabelCell rowKey="price" label="Giá thuê" />
          <LabelCell rowKey="area" label="Diện tích" />
          <LabelCell rowKey="occupants" label="Số người ở" />
          <LabelCell
            rowKey="distance"
            label="Khoảng cách"
            hint={referenceLabel ? `tới ${referenceLabel}` : undefined}
          />
          <LabelCell rowKey="rating" label="Đánh giá" />
          <LabelCell rowKey="deposit" label="Tiền cọc" />
          <LabelCell rowKey="status" label="Trạng thái" />
          <View style={[styles.labelCell, styles.amenityLabelCell, { height: amenityBlockHeight }]}>
            <Typography variant="tiny" weight="SEMIBOLD" colorKey="TEXT_MUTED" style={styles.label}>
              Tiện ích
            </Typography>
            {amenityRows.length > 1 ? (
              <Typography variant="tiny" weight="REGULAR" color={OVERLAY_COLORS.TEXT_DISABLED}>
                cùng thứ tự ở mọi cột
              </Typography>
            ) : null}
          </View>
          <LabelCell rowKey="landlord" label="Chủ trọ" />
          <View style={{ height: ROW_HEIGHTS.actions }} />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.columnsScroll}
          contentContainerStyle={styles.columns}
        >
          {items.map((item, index) => (
            <View key={item.id} style={styles.column}>
              <ImageCell item={item} onRemove={() => onRemove(item.id)} />

              <View
                style={isItemAvailable(item) ? undefined : styles.dimmedColumn}
                pointerEvents={isItemAvailable(item) ? 'auto' : 'none'}
              >
                <ValueCell rowKey="price" isBest={bestPrice.has(index)}>
                  <Typography
                    variant="body1"
                    weight="BOLD"
                    colorKey={bestPrice.has(index) ? 'SUCCESS' : 'PRIMARY_DARK'}
                    style={styles.priceValue}
                  >
                    {formatPrice(item.price)}
                  </Typography>
                  {bestPrice.has(index) ? (
                    <View style={styles.bestPill}>
                      <Typography
                        variant="tiny"
                        weight="SEMIBOLD"
                        colorKey="SUCCESS"
                        style={styles.bestPillText}
                      >
                        RẺ HƠN
                      </Typography>
                    </View>
                  ) : null}
                </ValueCell>

                <ValueCell rowKey="area" isBest={bestArea.has(index)}>
                  <Typography
                    variant="body1"
                    weight="BOLD"
                    colorKey={bestArea.has(index) ? 'SUCCESS' : 'TEXT_PRIMARY'}
                  >
                    {formatMeasure(item.area, 'm²')}
                  </Typography>
                </ValueCell>

                <ValueCell rowKey="occupants">
                  <Typography variant="body1" weight="BOLD">
                    {formatMeasure(item.maxOccupants, 'người')}
                  </Typography>
                </ValueCell>

                <ValueCell rowKey="distance" isBest={bestDistance.has(index)}>
                  <Typography
                    variant="body1"
                    weight="BOLD"
                    colorKey={bestDistance.has(index) ? 'SUCCESS' : 'TEXT_PRIMARY'}
                  >
                    {distances[index] === undefined || distances[index] === null
                      ? PLACEHOLDER_TEXT
                      : (formatListingDistance(distances[index]) ?? PLACEHOLDER_TEXT)}
                  </Typography>
                  {typeof distances[index] === 'number' ? (
                    <Typography variant="tiny" weight="REGULAR" colorKey="TEXT_PLACEHOLDER">
                      {formatTravelEstimate(distances[index] as number)}
                    </Typography>
                  ) : null}
                </ValueCell>

                <ValueCell rowKey="rating">
                  <RatingValue rating={item.averageRating} reviewCount={item.reviewCount} />
                </ValueCell>

                <ValueCell rowKey="deposit">
                  <Typography variant="body1" weight="BOLD">
                    {typeof item.deposit === 'number' && Number.isFinite(item.deposit)
                      ? formatFullPrice(item.deposit)
                      : PLACEHOLDER_TEXT}
                  </Typography>
                  {getDepositMonths(item.deposit, item.price) ? (
                    <Typography variant="tiny" weight="REGULAR" colorKey="TEXT_PLACEHOLDER">
                      {`${getDepositMonths(item.deposit, item.price)} tháng`}
                    </Typography>
                  ) : null}
                </ValueCell>

                <ValueCell rowKey="status">
                  <AvailabilityBadge availability={item.availability} />
                </ValueCell>

                <View style={[styles.amenityBlock, { height: amenityBlockHeight }]}>
                  {amenityRows.map((row) => {
                    const hasAmenity = item.amenities?.some((amenity) => amenity.id === row.id);

                    return (
                      <View key={row.id} style={styles.amenityRow}>
                        {hasAmenity ? (
                          <Check size={AMENITY_ICON_SIZE} color={THEME_COLORS.SUCCESS} />
                        ) : (
                          <Minus size={AMENITY_ICON_SIZE} color={OVERLAY_COLORS.TEXT_UNAVAILABLE} />
                        )}
                        <Typography
                          variant="caption"
                          weight="REGULAR"
                          color={
                            hasAmenity
                              ? THEME_COLORS.TEXT_SECONDARY
                              : OVERLAY_COLORS.TEXT_UNAVAILABLE
                          }
                          numberOfLines={1}
                          style={styles.amenityName}
                        >
                          {row.name}
                        </Typography>
                      </View>
                    );
                  })}
                </View>

                <ValueCell rowKey="landlord">
                  <LandlordValue landlord={item.landlord} />
                </ValueCell>

                <View style={[styles.actionsCell, { height: ROW_HEIGHTS.actions }]}>
                  <ColumnActions item={item} onOpenDetail={() => onOpenDetail(item.id)} />
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
    </ScrollView>
  );
};

const LabelCell = ({ rowKey, label, hint }: { rowKey: RowKey; label: string; hint?: string }) => (
  <View
    style={[
      styles.labelCell,
      { height: ROW_HEIGHTS[rowKey] },
      BANDED_ROWS.includes(rowKey) && styles.banded,
    ]}
  >
    <Typography variant="tiny" weight="SEMIBOLD" colorKey="TEXT_MUTED" style={styles.label}>
      {label}
    </Typography>
    {hint ? (
      <Typography variant="tiny" weight="REGULAR" color={OVERLAY_COLORS.TEXT_DISABLED}>
        {hint}
      </Typography>
    ) : null}
  </View>
);

const ValueCell = ({
  rowKey,
  isBest = false,
  children,
}: {
  rowKey: RowKey;
  isBest?: boolean;
  children: ReactNode;
}) => (
  <View
    style={[
      styles.valueCell,
      { height: ROW_HEIGHTS[rowKey] },
      BANDED_ROWS.includes(rowKey) && styles.banded,
      isBest && styles.best,
    ]}
  >
    {children}
  </View>
);

const isItemAvailable = (item: ComparisonItem): boolean => item.isAvailable !== false;

const ImageCell = ({ item, onRemove }: { item: ComparisonItem; onRemove: () => void }) => {
  const [hasError, setHasError] = useState(false);
  const isAvailable = isItemAvailable(item);
  const coverImage = item.images?.find((image) => image.isCover) ?? item.images?.[0];
  const gradientColors = getPlaceholderGradient({
    id: item.id,
    isHighlighted: item.availability === 'holding',
  });

  return (
    <View style={[styles.imageCell, { height: ROW_HEIGHTS.image }]}>
      <View style={[styles.imageFrame, !isAvailable && styles.dimmed]}>
        {coverImage?.url && !hasError ? (
          <Image
            source={{ uri: coverImage.url }}
            style={styles.image}
            resizeMode="cover"
            onError={() => setHasError(true)}
          />
        ) : (
          <GradientView colors={gradientColors} style={styles.image} />
        )}
      </View>

      <TouchableOpacity
        onPress={onRemove}
        style={styles.removeButton}
        accessibilityRole="button"
        accessibilityLabel={`Bỏ ${item.title} khỏi so sánh`}
      >
        <X size={13} color={THEME_COLORS.TEXT_PRIMARY} />
      </TouchableOpacity>

      <Typography
        variant="label"
        weight="SEMIBOLD"
        numberOfLines={2}
        ellipsizeMode="tail"
        style={[styles.itemTitle, !isAvailable && styles.dimmed]}
      >
        {item.title}
      </Typography>

      {!isAvailable ? (
        <View accessibilityRole="alert" style={styles.unavailableNotice}>
          <Typography variant="caption" weight="SEMIBOLD" colorKey="ERROR" numberOfLines={1}>
            Phòng không còn trống
          </Typography>
          {item.unavailableReason ? (
            <Typography
              variant="tiny"
              weight="REGULAR"
              colorKey="TEXT_PLACEHOLDER"
              numberOfLines={1}
            >
              {item.unavailableReason}
            </Typography>
          ) : null}
        </View>
      ) : null}
    </View>
  );
};

const RatingValue = ({
  rating,
  reviewCount,
}: {
  rating: number | null | undefined;
  reviewCount: number | null | undefined;
}) => {
  if (rating === null || rating === undefined || !Number.isFinite(rating)) {
    return (
      <Typography variant="body2" colorKey="TEXT_MUTED" weight="SEMIBOLD">
        {PLACEHOLDER_TEXT}
      </Typography>
    );
  }

  return (
    <View style={styles.ratingRow}>
      <Star size={14} color={THEME_COLORS.SECONDARY} fill={THEME_COLORS.SECONDARY} />
      <Typography variant="body1" weight="BOLD">
        {rating.toFixed(1).replace('.', ',')}
      </Typography>
      {typeof reviewCount === 'number' ? (
        <Typography variant="tiny" weight="REGULAR" colorKey="TEXT_PLACEHOLDER">
          {`(${reviewCount})`}
        </Typography>
      ) : null}
    </View>
  );
};

const LandlordValue = ({ landlord }: { landlord: ComparisonItem['landlord'] }) => {
  if (!landlord) {
    return (
      <Typography variant="body2" colorKey="TEXT_MUTED" weight="SEMIBOLD">
        {PLACEHOLDER_TEXT}
      </Typography>
    );
  }

  return (
    <View style={styles.landlordRow}>
      <GradientView
        colors={[OVERLAY_COLORS.INFO_BORDER, THEME_COLORS.PRIMARY_LIGHT]}
        style={styles.landlordAvatar}
      >
        <View style={styles.landlordAvatarContent}>
          <Typography variant="label" weight="BOLD" colorKey="PRIMARY_DARK">
            {getInitials(landlord.fullName)}
          </Typography>
        </View>
      </GradientView>
      <View style={styles.landlordInfo}>
        <Typography variant="caption" weight="SEMIBOLD" numberOfLines={1}>
          {landlord.fullName}
        </Typography>
        {landlord.isVerified ? (
          <Typography variant="tiny" weight="REGULAR" colorKey="TEXT_PLACEHOLDER">
            Đã xác minh
          </Typography>
        ) : null}
      </View>
    </View>
  );
};

const ColumnActions = ({
  item,
  onOpenDetail,
}: {
  item: ComparisonItem;
  onOpenDetail: () => void;
}) => {
  const { openChat, isOpening } = useOpenListingChat();

  return (
    <View style={styles.actionsRow}>
      <Button
        title="Xem chi tiết"
        variant="outline"
        onPress={onOpenDetail}
        style={styles.detailButton}
        textStyle={styles.detailButtonText}
      />
      <TouchableOpacity
        onPress={() => void openChat(item.id)}
        disabled={isOpening}
        style={styles.chatButton}
        accessibilityRole="button"
        accessibilityLabel="Nhắn tin với Chủ trọ"
      >
        <MessageSquare size={16} color={THEME_COLORS.PRIMARY} />
      </TouchableOpacity>
    </View>
  );
};

const formatPrice = (price: number | null | undefined): string =>
  typeof price === 'number' && Number.isFinite(price) ? formatFullPrice(price) : PLACEHOLDER_TEXT;

const formatMeasure = (value: number | null | undefined, unit: string): string =>
  typeof value === 'number' && Number.isFinite(value) ? `${value} ${unit}` : PLACEHOLDER_TEXT;

const styles = StyleSheet.create({
  verticalContent: { flexGrow: 1 },
  table: { flexDirection: 'row', flexGrow: 1, backgroundColor: THEME_COLORS.SURFACE },
  labelColumn: {
    width: LABEL_COLUMN_WIDTH,
    borderRightWidth: 1,
    borderRightColor: THEME_COLORS.BORDER,
    backgroundColor: THEME_COLORS.SURFACE,
  },
  labelCell: { justifyContent: 'center', paddingHorizontal: SPACING_TOKENS.MD },
  amenityLabelCell: { justifyContent: 'flex-start', paddingTop: 14 },
  label: { letterSpacing: 0.5, textTransform: 'uppercase' },
  banded: { backgroundColor: THEME_COLORS.BACKGROUND },
  best: { backgroundColor: THEME_COLORS.SUCCESS_LIGHT },
  columnsScroll: { flex: 1 },
  columns: { gap: COLUMN_GAP, paddingHorizontal: COLUMN_GAP },
  column: { width: COLUMN_WIDTH },
  valueCell: { justifyContent: 'center', paddingHorizontal: CELL_PADDING },
  priceValue: { fontSize: 16, lineHeight: 24 },
  bestPill: {
    alignSelf: 'flex-start',
    height: 20,
    justifyContent: 'center',
    marginTop: 3,
    paddingHorizontal: SPACING_TOKENS.SM,
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
    backgroundColor: THEME_COLORS.SUCCESS_LIGHT,
  },
  bestPillText: { letterSpacing: 0.5, lineHeight: 14 },
  imageCell: { paddingHorizontal: CELL_PADDING, paddingTop: CELL_PADDING },
  imageFrame: {
    height: IMAGE_HEIGHT,
    overflow: 'hidden',
    borderRadius: BORDER_RADIUS_TOKENS.MD,
    backgroundColor: THEME_COLORS.SURFACE_MUTED,
  },
  image: { width: '100%', height: '100%' },
  dimmed: { opacity: DIMMED_OPACITY },
  dimmedColumn: { opacity: DIMMED_OPACITY },
  unavailableNotice: { marginTop: 2 },
  removeButton: {
    position: 'absolute',
    top: CELL_PADDING + 6,
    right: CELL_PADDING + 6,
    zIndex: 1,
    width: REMOVE_BUTTON_SIZE,
    height: REMOVE_BUTTON_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
    backgroundColor: OVERLAY_COLORS.FLOATING_BUTTON,
    shadowColor: OVERLAY_COLORS.SHADOW,
    shadowOpacity: 0.18,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  itemTitle: { marginTop: 9, lineHeight: 18 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING_TOKENS.SM - 2 },
  amenityBlock: { paddingTop: AMENITY_BLOCK_PADDING, paddingHorizontal: CELL_PADDING },
  amenityRow: {
    height: AMENITY_ROW_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  amenityName: { flex: 1 },
  landlordRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING_TOKENS.SM - 2 },
  landlordAvatar: { width: 32, height: 32, borderRadius: BORDER_RADIUS_TOKENS.FULL },
  landlordAvatarContent: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  landlordInfo: { flex: 1 },
  actionsCell: { justifyContent: 'flex-start', paddingTop: 22, paddingHorizontal: CELL_PADDING },
  actionsRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING_TOKENS.SM - 2 },
  detailButton: { width: 114, height: 36, borderColor: THEME_COLORS.PRIMARY },
  detailButtonText: { color: THEME_COLORS.PRIMARY_DARK, fontSize: 13, lineHeight: 20 },
  chatButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: THEME_COLORS.BORDER,
    borderRadius: 10,
  },
});
