import { useMemo, useState } from 'react';
import { Image, ScrollView, StyleSheet, View } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  CalendarDays,
  Droplets,
  ImageOff,
  MapPin,
  Maximize2,
  Users,
  Zap,
} from 'lucide-react-native';
import type { RootStackParamList } from '@navigation';
import { BORDER_RADIUS_TOKENS, SPACING_TOKENS, THEME_COLORS } from '@theme';
import { Badge, Button, HeaderBar, ScreenContainer, Typography } from '@ui';
import { useResponsiveLayout } from '@hooks';
import {
  AMENITY_DISPLAY_LIST,
  DAYS_OF_WEEK,
  ROOM_TYPE_OPTIONS,
  VIEWING_SLOT_LABELS,
} from '../types/constants';
import type { DayKey, ViewingSlot } from '../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type ScreenRouteProp = RouteProp<RootStackParamList, 'StudentListingPreview'>;
type SlotKey = keyof ViewingSlot;

export const StudentListingPreviewScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ScreenRouteProp>();
  const { listing } = route.params;
  const [failedImageUrls, setFailedImageUrls] = useState<string[]>([]);
  const { contentWidth, isCompact } = useResponsiveLayout();
  const imageHeight = Math.min(Math.round(contentWidth * 0.62), 440);

  const imageUrls = useMemo(() => {
    if (listing.imageUrls?.length) return listing.imageUrls;

    return listing.imageUrl ? [listing.imageUrl] : [];
  }, [listing.imageUrl, listing.imageUrls]);

  const roomTypeLabel =
    ROOM_TYPE_OPTIONS.find((option) => option.value === listing.roomType)?.label ??
    listing.roomType ??
    'Phòng trọ';
  const amenityNames = AMENITY_DISPLAY_LIST.filter((amenity) =>
    listing.amenityIds?.includes(amenity.id)
  ).map((amenity) => amenity.name);
  const scheduleRows = DAYS_OF_WEEK.flatMap(({ key, label }) => {
    const daySchedule = listing.viewingSchedule?.[key];

    if (!daySchedule) return [];

    const slots = VIEWING_SLOT_LABELS.filter((slot) => daySchedule[slot.key as SlotKey]).map(
      (slot) => slot.label
    );

    return slots.length ? [{ key, label, slots }] : [];
  });

  return (
    <ScreenContainer applyTopInset applyBottomInset keyboardAvoiding={false}>
      <HeaderBar
        title="Xem tin như sinh viên"
        subtitle="Bản xem trước của tin đăng"
        onBack={() => navigation.goBack()}
        alignTitle="left"
      />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {listing.status !== 'published' ? (
          <View style={styles.previewNotice}>
            <Typography variant="caption" colorKey="WARNING">
              Tin chưa hiển thị công khai. Đây là giao diện sinh viên sẽ thấy sau khi tin được
              duyệt.
            </Typography>
          </View>
        ) : null}

        <View style={[styles.imageGallery, { width: contentWidth, height: imageHeight }]}>
          {imageUrls.length ? (
            <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}>
              {imageUrls.map((imageUrl, index) => (
                <View
                  key={`${imageUrl}-${index}`}
                  style={[styles.imageSlide, { width: contentWidth, height: imageHeight }]}
                >
                  {!failedImageUrls.includes(imageUrl) ? (
                    <Image
                      source={{ uri: imageUrl }}
                      style={styles.image}
                      resizeMode="cover"
                      onError={() => setFailedImageUrls((urls) => [...urls, imageUrl])}
                    />
                  ) : (
                    <ImagePlaceholder />
                  )}
                  <View style={styles.imageCounter}>
                    <Typography variant="tiny" color={THEME_COLORS.WHITE}>
                      {index + 1}/{imageUrls.length}
                    </Typography>
                  </View>
                </View>
              ))}
            </ScrollView>
          ) : (
            <ImagePlaceholder />
          )}
        </View>

        <View style={styles.card}>
          <Badge label={roomTypeLabel} variant="primary" size="md" />
          <Typography variant="h2" weight="BOLD" colorKey="PRIMARY" style={styles.price}>
            {listing.price.toLocaleString('vi-VN')} ₫
            <Typography variant="body2" colorKey="TEXT_SECONDARY">
              {' '}
              / tháng
            </Typography>
          </Typography>
          <Typography variant="h3" weight="BOLD" style={styles.title}>
            {listing.title}
          </Typography>
          <View style={styles.inlineRow}>
            <MapPin size={18} color={THEME_COLORS.PRIMARY} />
            <Typography variant="body2" colorKey="TEXT_SECONDARY" style={styles.flexText}>
              {listing.address || listing.streetAddress || 'Chưa cập nhật địa chỉ'}
            </Typography>
          </View>
        </View>

        <View style={styles.specsRow}>
          <Spec icon={Maximize2} label="Diện tích" value={`${listing.area} m²`} />
          <Spec icon={Users} label="Sức chứa" value={`${listing.maxOccupants || 1} người`} />
        </View>

        <View style={styles.card}>
          <Typography variant="body1" weight="BOLD" style={styles.sectionTitle}>
            Chi phí
          </Typography>
          <CostRow
            icon={Zap}
            label="Tiền điện"
            value={formatOptionalCurrency(listing.electricPrice, ' / kWh')}
          />
          <CostRow
            icon={Droplets}
            label="Tiền nước"
            value={formatOptionalCurrency(listing.waterPrice, ' / m³')}
          />
          <CostRow
            icon={CalendarDays}
            label="Tiền cọc"
            value={formatOptionalCurrency(listing.deposit)}
          />
        </View>

        <View style={styles.card}>
          <Typography variant="body1" weight="BOLD" style={styles.sectionTitle}>
            Mô tả phòng
          </Typography>
          <Typography variant="body2" colorKey="TEXT_SECONDARY" style={styles.description}>
            {listing.description || 'Chủ trọ chưa cập nhật mô tả cho phòng này.'}
          </Typography>
        </View>

        <View style={styles.card}>
          <Typography variant="body1" weight="BOLD" style={styles.sectionTitle}>
            Tiện ích
          </Typography>
          {amenityNames.length ? (
            <View style={styles.tags}>
              {amenityNames.map((name) => (
                <View key={name} style={styles.tag}>
                  <Typography variant="caption" weight="SEMIBOLD" colorKey="PRIMARY">
                    {name}
                  </Typography>
                </View>
              ))}
            </View>
          ) : (
            <Typography variant="body2" colorKey="TEXT_MUTED">
              Chưa cập nhật tiện ích.
            </Typography>
          )}
        </View>

        <View style={styles.card}>
          <Typography variant="body1" weight="BOLD" style={styles.sectionTitle}>
            Lịch có thể xem phòng
          </Typography>
          {scheduleRows.length ? (
            scheduleRows.map(({ key, label, slots }) => (
              <View key={key as DayKey} style={styles.scheduleRow}>
                <Typography variant="caption" weight="BOLD" colorKey="PRIMARY">
                  {label}
                </Typography>
                <Typography variant="body2" colorKey="TEXT_SECONDARY">
                  {slots.join(', ')}
                </Typography>
              </View>
            ))
          ) : (
            <Typography variant="body2" colorKey="TEXT_MUTED">
              Liên hệ chủ trọ để hẹn thời gian xem phòng.
            </Typography>
          )}
        </View>
      </ScrollView>

      <View style={[styles.bottomBar, isCompact && styles.bottomBarCompact]}>
        <Button
          title="Nhắn chủ trọ"
          variant="outline"
          onPress={() => undefined}
          disabled
          style={styles.secondaryButton}
        />
        <Button
          title="Đặt lịch xem phòng"
          onPress={() => undefined}
          disabled
          style={styles.primaryButton}
        />
      </View>
    </ScreenContainer>
  );
};

const ImagePlaceholder = () => (
  <View style={styles.imagePlaceholder}>
    <ImageOff size={34} color={THEME_COLORS.TEXT_PLACEHOLDER} />
    <Typography variant="caption" colorKey="TEXT_MUTED" style={styles.placeholderText}>
      Không thể hiển thị ảnh phòng
    </Typography>
  </View>
);

const Spec = ({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Maximize2;
  label: string;
  value: string;
}) => (
  <View style={styles.specCard}>
    <Icon size={20} color={THEME_COLORS.PRIMARY} />
    <Typography variant="caption" colorKey="TEXT_MUTED">
      {label}
    </Typography>
    <Typography variant="body2" weight="BOLD">
      {value}
    </Typography>
  </View>
);

const CostRow = ({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Zap;
  label: string;
  value: string;
}) => (
  <View style={styles.costRow}>
    <View style={styles.inlineRow}>
      <Icon size={18} color={THEME_COLORS.PRIMARY} />
      <Typography variant="body2">{label}</Typography>
    </View>
    <Typography variant="body2" weight="SEMIBOLD">
      {value}
    </Typography>
  </View>
);

const formatOptionalCurrency = (value?: number, suffix = '') => {
  if (value === undefined) return 'Theo thỏa thuận';

  return `${value.toLocaleString('vi-VN')} ₫${suffix}`;
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME_COLORS.BACKGROUND },
  scrollContent: {
    paddingBottom: SPACING_TOKENS.XL,
    gap: SPACING_TOKENS.MD,
  },
  previewNotice: {
    marginHorizontal: SPACING_TOKENS.MD,
    marginTop: SPACING_TOKENS.MD,
    padding: SPACING_TOKENS.SM,
    borderRadius: BORDER_RADIUS_TOKENS.MD,
    backgroundColor: THEME_COLORS.WARNING_LIGHT,
  },
  imageGallery: {
    backgroundColor: THEME_COLORS.SURFACE_MUTED,
  },
  imageSlide: { position: 'relative' },
  image: { width: '100%', height: '100%' },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: THEME_COLORS.SURFACE_MUTED,
  },
  placeholderText: { marginTop: SPACING_TOKENS.XS },
  imageCounter: {
    position: 'absolute',
    right: SPACING_TOKENS.MD,
    bottom: SPACING_TOKENS.MD,
    paddingHorizontal: SPACING_TOKENS.SM,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
  },
  card: {
    marginHorizontal: SPACING_TOKENS.MD,
    padding: SPACING_TOKENS.MD,
    borderWidth: 1,
    borderColor: THEME_COLORS.BORDER,
    borderRadius: BORDER_RADIUS_TOKENS.LG,
    backgroundColor: THEME_COLORS.SURFACE,
  },
  price: { marginTop: SPACING_TOKENS.SM },
  title: { marginTop: SPACING_TOKENS.XS, marginBottom: SPACING_TOKENS.SM },
  inlineRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING_TOKENS.XS },
  flexText: { flex: 1 },
  specsRow: {
    marginHorizontal: SPACING_TOKENS.MD,
    flexDirection: 'row',
    gap: SPACING_TOKENS.SM,
  },
  specCard: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    padding: SPACING_TOKENS.MD,
    borderWidth: 1,
    borderColor: THEME_COLORS.BORDER,
    borderRadius: BORDER_RADIUS_TOKENS.MD,
    backgroundColor: THEME_COLORS.SURFACE,
  },
  sectionTitle: { marginBottom: SPACING_TOKENS.SM },
  costRow: {
    minHeight: 42,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: THEME_COLORS.DIVIDER,
  },
  description: { lineHeight: 22 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING_TOKENS.SM },
  tag: {
    paddingHorizontal: SPACING_TOKENS.SM,
    paddingVertical: 5,
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
    backgroundColor: THEME_COLORS.PRIMARY_LIGHT,
  },
  scheduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING_TOKENS.MD,
    minHeight: 34,
  },
  bottomBar: {
    flexDirection: 'row',
    gap: SPACING_TOKENS.SM,
    padding: SPACING_TOKENS.MD,
    paddingBottom: SPACING_TOKENS.LG,
    borderTopWidth: 1,
    borderTopColor: THEME_COLORS.DIVIDER,
    backgroundColor: THEME_COLORS.SURFACE,
  },
  bottomBarCompact: {
    flexDirection: 'column',
  },
  secondaryButton: { flex: 1 },
  primaryButton: { flex: 1.35 },
});
