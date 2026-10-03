import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import MapView, { Marker } from 'react-native-maps';
import { Eye, Heart, ImageOff, MapPin, Scale, ShieldCheck, Star, Users } from 'lucide-react-native';
import { AppError, formatVND } from '@core';
import { useToast } from '@hooks';
import type { RootStackParamList } from '@navigation';
import { BORDER_RADIUS_TOKENS, SPACING_TOKENS, THEME_COLORS } from '@theme';
import { Avatar, Button, HeaderBar, Typography } from '@ui';
import { MAX_COMPARISON_ITEMS, useComparisonStore } from '@features/comparison';
import { useListingDetail, useRecordListingView } from '../hooks';
import type { ListingDetailImage } from '../types';

type DetailRoute = RouteProp<RootStackParamList, 'ListingDetail'>;
type DetailNavigation = NativeStackNavigationProp<RootStackParamList>;

export const ListingDetailScreen = () => {
  const route = useRoute<DetailRoute>();
  const navigation = useNavigation<DetailNavigation>();
  const toast = useToast();
  const { width } = useWindowDimensions();
  const listingId = route.params.id;
  const detailQuery = useListingDetail(listingId);
  const viewMutation = useRecordListingView(listingId);
  const hasRecordedView = useRef(false);
  const comparisonItems = useComparisonStore((state) => state.items);
  const addComparison = useComparisonStore((state) => state.add);
  const removeComparison = useComparisonStore((state) => state.remove);
  const isCompared = comparisonItems.some((item) => item.id === listingId);

  useEffect(() => {
    if (!detailQuery.data || hasRecordedView.current) {
      return;
    }

    hasRecordedView.current = true;
    viewMutation.mutate();
  }, [detailQuery.data, viewMutation]);

  const handleToggleComparison = () => {
    if (!detailQuery.data) {
      return;
    }

    if (isCompared) {
      removeComparison(listingId);
      toast.info('Đã bỏ tin khỏi danh sách so sánh');

      return;
    }

    const result = addComparison(detailQuery.data);

    if (result === 'limit-reached') {
      toast.warning('Bạn chỉ có thể so sánh tối đa 4 tin. Hãy bỏ bớt một tin trước.');

      return;
    }

    if (result === 'added') {
      toast.success('Đã thêm tin vào danh sách so sánh');
    }
  };

  if (detailQuery.isLoading) {
    return (
      <View style={styles.stateContainer}>
        <ActivityIndicator size="large" color={THEME_COLORS.PRIMARY} />
        <Typography variant="body2" colorKey="TEXT_MUTED" style={styles.stateText}>
          Đang tải thông tin phòng...
        </Typography>
      </View>
    );
  }

  if (detailQuery.isError || !detailQuery.data) {
    const isNotFound =
      detailQuery.error instanceof AppError && detailQuery.error.statusCode === 404;

    return (
      <View style={styles.screen}>
        <HeaderBar title="Chi tiết phòng" onBack={() => navigation.goBack()} />
        <View style={styles.stateContainer}>
          <ImageOff size={44} color={THEME_COLORS.TEXT_PLACEHOLDER} />
          <Typography variant="h3" weight="BOLD" align="center" style={styles.stateText}>
            {isNotFound ? 'Không tìm thấy tin đăng' : 'Không thể tải thông tin phòng'}
          </Typography>
          <Typography variant="body2" colorKey="TEXT_MUTED" align="center">
            {isNotFound
              ? 'Tin đăng không tồn tại hoặc bạn không có quyền xem.'
              : 'Vui lòng kiểm tra kết nối và thử lại.'}
          </Typography>
          <Button title="Thử lại" onPress={() => void detailQuery.refetch()} style={styles.retry} />
        </View>
      </View>
    );
  }

  const listing = detailQuery.data;
  const hasCoordinates =
    Number.isFinite(listing.location?.latitude) && Number.isFinite(listing.location?.longitude);

  return (
    <View style={styles.screen}>
      <HeaderBar
        title="Chi tiết phòng"
        onBack={() => navigation.goBack()}
        rightAction={
          <TouchableOpacity
            accessibilityLabel="Mở danh sách so sánh"
            style={styles.compareHeaderButton}
            onPress={() => navigation.navigate('Comparison')}
          >
            <Scale size={22} color={THEME_COLORS.PRIMARY} />
            {comparisonItems.length > 0 ? (
              <View style={styles.compareCount}>
                <Typography variant="tiny" weight="BOLD" color={THEME_COLORS.WHITE}>
                  {comparisonItems.length}
                </Typography>
              </View>
            ) : null}
          </TouchableOpacity>
        }
      />

      <FlatList
        data={[listing]}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        renderItem={() => (
          <View>
            <ListingImageGallery images={listing.images} width={width} />

            <View style={styles.content}>
              <View style={styles.priceRow}>
                <Typography variant="h2" weight="BOLD" colorKey="PRIMARY">
                  {formatVND(listing.price)}
                </Typography>
                <Typography variant="body2" colorKey="TEXT_MUTED">
                  /tháng
                </Typography>
              </View>

              <Typography variant="h2" weight="BOLD" style={styles.title}>
                {listing.title}
              </Typography>

              <View style={styles.metaRow}>
                <InfoPill label={`${listing.area} m²`} />
                <InfoPill label={`${listing.maxOccupants} người`} icon="users" />
                <InfoPill label={`${listing.viewCount} lượt xem`} icon="eye" />
              </View>

              <View style={styles.addressRow}>
                <MapPin size={18} color={THEME_COLORS.TEXT_MUTED} />
                <Typography variant="body2" colorKey="TEXT_SECONDARY" style={styles.flexText}>
                  {listing.address.fullAddress}
                </Typography>
              </View>

              <Section title="Mô tả">
                <Typography variant="body1" colorKey="TEXT_SECONDARY">
                  {listing.description?.trim() || 'Chủ trọ chưa bổ sung mô tả.'}
                </Typography>
              </Section>

              <Section title="Chi phí và thông tin phòng">
                <DetailRow label="Loại phòng" value={listing.roomType} />
                <DetailRow label="Tiền cọc" value={formatNullablePrice(listing.deposit)} />
                <DetailRow label="Giá điện" value={formatNullablePrice(listing.electricPrice)} />
                <DetailRow label="Giá nước" value={formatNullablePrice(listing.waterPrice)} />
              </Section>

              <Section title="Tiện ích">
                {listing.amenities.length > 0 ? (
                  <View style={styles.amenities}>
                    {listing.amenities.map((amenity) => (
                      <View key={amenity.id} style={styles.amenityChip}>
                        <Typography variant="caption" colorKey="TEXT_SECONDARY">
                          {amenity.name}
                        </Typography>
                      </View>
                    ))}
                  </View>
                ) : (
                  <Typography variant="body2" colorKey="TEXT_MUTED">
                    Chưa có thông tin tiện ích.
                  </Typography>
                )}
              </Section>

              <Section title="Vị trí">
                {hasCoordinates ? (
                  <View style={styles.mapWrapper}>
                    <MapView
                      style={styles.map}
                      initialRegion={{
                        latitude: listing.location.latitude,
                        longitude: listing.location.longitude,
                        latitudeDelta: 0.01,
                        longitudeDelta: 0.01,
                      }}
                      scrollEnabled={false}
                      zoomEnabled={false}
                      rotateEnabled={false}
                      pitchEnabled={false}
                    >
                      <Marker
                        coordinate={listing.location}
                        title={listing.title}
                        description={listing.address.fullAddress}
                        pinColor={THEME_COLORS.PRIMARY}
                      />
                    </MapView>
                  </View>
                ) : (
                  <Typography variant="body2" colorKey="TEXT_MUTED">
                    Chưa có tọa độ phòng trọ.
                  </Typography>
                )}
              </Section>

              <Section title="Chủ trọ">
                <View style={styles.landlordRow}>
                  <Avatar
                    uri={listing.landlord.avatarUrl}
                    name={listing.landlord.fullName}
                    size="lg"
                  />
                  <View style={styles.landlordInfo}>
                    <View style={styles.landlordNameRow}>
                      <Typography variant="body1" weight="BOLD">
                        {listing.landlord.fullName}
                      </Typography>
                      {listing.landlord.isVerified ? (
                        <ShieldCheck size={17} color={THEME_COLORS.SUCCESS} />
                      ) : null}
                    </View>
                    {listing.landlord.bio ? (
                      <Typography variant="caption" colorKey="TEXT_MUTED">
                        {listing.landlord.bio}
                      </Typography>
                    ) : null}
                  </View>
                </View>
              </Section>

              <Section title="Đánh giá">
                {listing.averageRating === null || listing.averageRating === undefined ? (
                  <Typography variant="body2" colorKey="TEXT_MUTED">
                    Chưa có dữ liệu đánh giá.
                  </Typography>
                ) : (
                  <View style={styles.ratingRow}>
                    <Star size={20} color={THEME_COLORS.SECONDARY} fill={THEME_COLORS.SECONDARY} />
                    <Typography variant="h3" weight="BOLD">
                      {listing.averageRating.toFixed(1)}
                    </Typography>
                  </View>
                )}
              </Section>

              {listing.isFavorite ? (
                <View style={styles.savedNotice}>
                  <Heart size={17} color={THEME_COLORS.ERROR} fill={THEME_COLORS.ERROR} />
                  <Typography variant="caption" colorKey="TEXT_SECONDARY">
                    Tin này đang nằm trong danh sách yêu thích của bạn.
                  </Typography>
                </View>
              ) : null}

              <Button
                title={isCompared ? 'Bỏ khỏi so sánh' : 'Thêm vào so sánh'}
                variant={isCompared ? 'secondary' : 'primary'}
                fullWidth
                leftIcon={
                  <Scale size={18} color={isCompared ? THEME_COLORS.PRIMARY : THEME_COLORS.WHITE} />
                }
                onPress={handleToggleComparison}
                style={styles.compareButton}
              />
              {comparisonItems.length > 0 ? (
                <TouchableOpacity onPress={() => navigation.navigate('Comparison')}>
                  <Typography variant="body2" weight="SEMIBOLD" colorKey="PRIMARY" align="center">
                    {`Xem so sánh (${comparisonItems.length}/${MAX_COMPARISON_ITEMS})`}
                  </Typography>
                </TouchableOpacity>
              ) : null}
            </View>
          </View>
        )}
      />
    </View>
  );
};

const ListingImageGallery = ({
  images,
  width,
}: {
  images: ListingDetailImage[];
  width: number;
}) => {
  const [activeIndex, setActiveIndex] = useState(0);

  if (images.length === 0) {
    return (
      <View style={[styles.imageFallback, { width }]}>
        <ImageOff size={42} color={THEME_COLORS.TEXT_PLACEHOLDER} />
        <Typography variant="body2" colorKey="TEXT_MUTED" style={styles.stateText}>
          Tin đăng chưa có hình ảnh.
        </Typography>
      </View>
    );
  }

  return (
    <View>
      <FlatList
        horizontal
        pagingEnabled
        data={images}
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(event) =>
          setActiveIndex(Math.round(event.nativeEvent.contentOffset.x / width))
        }
        renderItem={({ item }) => <GalleryImage image={item} width={width} />}
      />
      <View style={styles.imageCounter}>
        <Typography variant="caption" weight="SEMIBOLD" color={THEME_COLORS.WHITE}>
          {`${activeIndex + 1}/${images.length}`}
        </Typography>
      </View>
    </View>
  );
};

const GalleryImage = ({ image, width }: { image: ListingDetailImage; width: number }) => {
  const [hasError, setHasError] = useState(false);

  return hasError ? (
    <View style={[styles.imageFallback, { width }]}>
      <ImageOff size={42} color={THEME_COLORS.TEXT_PLACEHOLDER} />
      <Typography variant="caption" colorKey="TEXT_MUTED" style={styles.stateText}>
        Không thể tải hình ảnh.
      </Typography>
    </View>
  ) : (
    <View style={[styles.galleryImageWrapper, { width }]}>
      <ActivityIndicator style={styles.imageLoader} color={THEME_COLORS.PRIMARY} />
      <Image
        source={{ uri: image.url }}
        style={styles.galleryImage}
        resizeMode="cover"
        onError={() => setHasError(true)}
      />
    </View>
  );
};

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <View style={styles.section}>
    <Typography variant="h3" weight="BOLD" style={styles.sectionTitle}>
      {title}
    </Typography>
    {children}
  </View>
);

const DetailRow = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.detailRow}>
    <Typography variant="body2" colorKey="TEXT_MUTED">
      {label}
    </Typography>
    <Typography variant="body2" weight="SEMIBOLD" style={styles.detailValue}>
      {value}
    </Typography>
  </View>
);

const InfoPill = ({ label, icon }: { label: string; icon?: 'users' | 'eye' }) => (
  <View style={styles.infoPill}>
    {icon === 'users' ? <Users size={14} color={THEME_COLORS.TEXT_SECONDARY} /> : null}
    {icon === 'eye' ? <Eye size={14} color={THEME_COLORS.TEXT_SECONDARY} /> : null}
    <Typography variant="caption" colorKey="TEXT_SECONDARY">
      {label}
    </Typography>
  </View>
);

const formatNullablePrice = (value: number | null): string =>
  value === null ? 'Chưa cập nhật' : formatVND(value);

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: THEME_COLORS.BACKGROUND },
  stateContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING_TOKENS.XL,
    backgroundColor: THEME_COLORS.BACKGROUND,
  },
  stateText: { marginTop: SPACING_TOKENS.SM },
  retry: { marginTop: SPACING_TOKENS.LG, minWidth: 140 },
  compareHeaderButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  compareCount: {
    position: 'absolute',
    top: 1,
    right: 1,
    minWidth: 16,
    height: 16,
    paddingHorizontal: 3,
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
    backgroundColor: THEME_COLORS.ERROR,
    alignItems: 'center',
    justifyContent: 'center',
  },
  galleryImageWrapper: { height: 280, backgroundColor: THEME_COLORS.SURFACE_MUTED },
  galleryImage: { width: '100%', height: '100%' },
  imageLoader: { ...StyleSheet.absoluteFill },
  imageFallback: {
    height: 280,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: THEME_COLORS.SURFACE_MUTED,
  },
  imageCounter: {
    position: 'absolute',
    right: SPACING_TOKENS.MD,
    bottom: SPACING_TOKENS.SM,
    paddingHorizontal: SPACING_TOKENS.SM,
    paddingVertical: SPACING_TOKENS.XS,
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  content: { padding: SPACING_TOKENS.MD, paddingBottom: SPACING_TOKENS.XL },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: SPACING_TOKENS.XS },
  title: { marginTop: SPACING_TOKENS.SM },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING_TOKENS.SM,
    marginTop: SPACING_TOKENS.MD,
  },
  infoPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING_TOKENS.XS,
    paddingHorizontal: SPACING_TOKENS.SM,
    paddingVertical: SPACING_TOKENS.XS,
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
    backgroundColor: THEME_COLORS.SURFACE_MUTED,
  },
  addressRow: { flexDirection: 'row', gap: SPACING_TOKENS.SM, marginTop: SPACING_TOKENS.MD },
  flexText: { flex: 1 },
  section: {
    marginTop: SPACING_TOKENS.LG,
    paddingTop: SPACING_TOKENS.MD,
    borderTopWidth: 1,
    borderTopColor: THEME_COLORS.DIVIDER,
  },
  sectionTitle: { marginBottom: SPACING_TOKENS.SM },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING_TOKENS.XS,
  },
  detailValue: { flex: 1, textAlign: 'right', marginLeft: SPACING_TOKENS.MD },
  amenities: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING_TOKENS.SM },
  amenityChip: {
    paddingHorizontal: SPACING_TOKENS.SM + 2,
    paddingVertical: SPACING_TOKENS.SM,
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
    backgroundColor: THEME_COLORS.PRIMARY_LIGHT,
  },
  mapWrapper: { height: 220, overflow: 'hidden', borderRadius: BORDER_RADIUS_TOKENS.MD },
  map: { flex: 1 },
  landlordRow: { flexDirection: 'row', alignItems: 'center' },
  landlordInfo: { flex: 1, marginLeft: SPACING_TOKENS.MD },
  landlordNameRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING_TOKENS.XS },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING_TOKENS.SM },
  savedNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING_TOKENS.SM,
    marginTop: SPACING_TOKENS.LG,
    padding: SPACING_TOKENS.SM,
    borderRadius: BORDER_RADIUS_TOKENS.SM,
    backgroundColor: THEME_COLORS.ERROR_LIGHT,
  },
  compareButton: { marginTop: SPACING_TOKENS.LG, marginBottom: SPACING_TOKENS.MD },
});
