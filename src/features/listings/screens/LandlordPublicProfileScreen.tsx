import { useMemo } from 'react';
import {
  ActivityIndicator,
  Linking,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Eye, GraduationCap, MessageSquare, Phone, ShieldCheck } from 'lucide-react-native';
import { BORDER_RADIUS_TOKENS, SPACING_TOKENS, THEME_COLORS } from '@theme';
import { BackButton, GradientAvatar, ScreenContainer, Typography } from '@ui';
import { useToast } from '@hooks';
import { useAuth } from '@features/auth';
import { useOpenListingChat } from '@features/chat';
import {
  DEFAULT_SEARCH_FILTERS,
  SearchListingRow,
  useFavoriteIds,
  useSearchListings,
  useToggleFavorite,
} from '@features/search';
import type { RootStackParamList } from '@navigation/types';
import { useLandlordPublicProfile } from '../hooks';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'LandlordPublicProfile'>;
type ScreenRoute = RouteProp<RootStackParamList, 'LandlordPublicProfile'>;

const formatJoinedAt = (value: string) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return '';

  return `${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
};

interface StatItemProps {
  value: string;
  label: string;
}

const StatItem = ({ value, label }: StatItemProps) => (
  <View style={styles.statItem}>
    <Typography variant="h3" weight="BOLD">
      {value}
    </Typography>
    <Typography variant="caption" colorKey="TEXT_MUTED">
      {label}
    </Typography>
  </View>
);

export const LandlordPublicProfileScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { params } = useRoute<ScreenRoute>();
  const toast = useToast();
  const { user } = useAuth();
  const { openChat, isOpening } = useOpenListingChat();
  const profileQuery = useLandlordPublicProfile(params.landlordId);
  const filters = useMemo(
    () => ({ ...DEFAULT_SEARCH_FILTERS, ownerId: params.landlordId, sortBy: 'newest' as const }),
    [params.landlordId]
  );
  const listingsQuery = useSearchListings(filters);
  const favoriteIdsQuery = useFavoriteIds();
  const toggleFavorite = useToggleFavorite();
  const favoriteIds = useMemo(() => new Set(favoriteIdsQuery.data ?? []), [favoriteIdsQuery.data]);
  const listings = useMemo(
    () => listingsQuery.data?.pages.flatMap((page) => page.items) ?? [],
    [listingsQuery.data]
  );
  const profile = profileQuery.data;
  const isPreview = Boolean(params.isPreview);
  const isSelf = user?.id === params.landlordId;
  const canContact = !isPreview && !isSelf;

  const handleMessage = () => {
    const firstListing = listings[0];

    if (!firstListing) {
      toast.error('Chủ trọ chưa có phòng nào để bắt đầu trò chuyện');

      return;
    }

    void openChat(firstListing.id);
  };

  const handleCall = () => {
    if (!profile?.phone) {
      toast.info('Nhắn tin hoặc đặt lịch với chủ trọ để xem số điện thoại');

      return;
    }

    void Linking.openURL(`tel:${profile.phone}`);
  };

  return (
    <ScreenContainer keyboardAvoiding={false}>
      <View style={styles.header}>
        <BackButton onPress={() => navigation.goBack()} />
        <Typography variant="h3" weight="BOLD" style={styles.headerTitle}>
          Hồ sơ công khai
        </Typography>
        <View style={styles.headerSpacer} />
      </View>

      {isPreview ? (
        <View style={styles.previewBanner}>
          <Eye size={16} color={THEME_COLORS.WHITE} />
          <Typography variant="body2" weight="SEMIBOLD" color={THEME_COLORS.WHITE}>
            Đang xem như sinh viên nhìn thấy
          </Typography>
        </View>
      ) : null}

      {profileQuery.isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={THEME_COLORS.PRIMARY} />
        </View>
      ) : profileQuery.isError || !profile ? (
        <View style={styles.center}>
          <Typography variant="body2" colorKey="TEXT_MUTED">
            Không thể tải hồ sơ chủ trọ.
          </Typography>
          <TouchableOpacity onPress={() => void profileQuery.refetch()} accessibilityRole="button">
            <Typography variant="body2" weight="SEMIBOLD" colorKey="PRIMARY">
              Thử lại
            </Typography>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.identity}>
            <GradientAvatar name={profile.fullName} uri={profile.avatarUrl} size={84} />
            <View style={styles.identityBody}>
              <Typography variant="h3" weight="BOLD">
                {profile.fullName}
              </Typography>
              {profile.isVerified ? (
                <View style={styles.verifiedBadge}>
                  <ShieldCheck size={13} color={THEME_COLORS.SUCCESS} />
                  <Typography variant="caption" weight="SEMIBOLD" color={THEME_COLORS.SUCCESS}>
                    ĐÃ XÁC MINH
                  </Typography>
                </View>
              ) : null}
              <Typography variant="caption" colorKey="TEXT_MUTED">
                Cho thuê trên UniNest từ {formatJoinedAt(profile.joinedAt)}
              </Typography>
            </View>
          </View>

          <View style={styles.stats}>
            <StatItem
              value={profile.averageRating === null ? '--' : profile.averageRating.toFixed(1)}
              label={`${profile.reviewCount} đánh giá`}
            />
            <View style={styles.statDivider} />
            <StatItem value={String(profile.activeListingCount)} label="Tin đang đăng" />
            <View style={styles.statDivider} />
            <StatItem
              value={profile.responseMinutes === null ? '--' : `~${profile.responseMinutes} phút`}
              label="Phản hồi"
            />
          </View>

          {profile.universities.length > 0 ? (
            <View style={styles.universities}>
              <Typography variant="caption" weight="SEMIBOLD" colorKey="TEXT_MUTED">
                GẦN CÁC TRƯỜNG
              </Typography>
              {profile.universities.map((university) => (
                <View key={university.code} style={styles.universityRow}>
                  <GraduationCap size={16} color={THEME_COLORS.PRIMARY} />
                  <Typography variant="body2" style={styles.universityName}>
                    {university.name}
                  </Typography>
                </View>
              ))}
            </View>
          ) : null}

          {profile.bio ? (
            <Typography variant="body2" style={styles.bio}>
              {profile.bio}
            </Typography>
          ) : null}

          {canContact ? (
            <View style={styles.actions}>
              <TouchableOpacity
                style={[styles.action, styles.actionPrimary]}
                onPress={handleMessage}
                disabled={isOpening}
                activeOpacity={0.85}
                accessibilityRole="button"
                accessibilityLabel="Nhắn tin"
              >
                <MessageSquare size={18} color={THEME_COLORS.WHITE} />
                <Typography variant="body1" weight="BOLD" color={THEME_COLORS.WHITE}>
                  Nhắn tin
                </Typography>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.action, styles.actionOutline]}
                onPress={handleCall}
                activeOpacity={0.85}
                accessibilityRole="button"
                accessibilityLabel="Gọi điện"
              >
                <Phone size={18} color={THEME_COLORS.TEXT_SECONDARY} />
                <Typography variant="body1" weight="BOLD" color={THEME_COLORS.TEXT_SECONDARY}>
                  Gọi điện
                </Typography>
              </TouchableOpacity>
            </View>
          ) : null}

          <View style={styles.listSection}>
            <Typography variant="h3" weight="BOLD">
              {profile.activeListingCount} phòng đang cho thuê
            </Typography>

            {listingsQuery.isLoading ? (
              <ActivityIndicator color={THEME_COLORS.PRIMARY} style={styles.listLoading} />
            ) : listings.length === 0 ? (
              <Typography variant="body2" colorKey="TEXT_MUTED">
                Chủ trọ chưa có phòng nào đang hiển thị.
              </Typography>
            ) : (
              listings.map((listing) => (
                <SearchListingRow
                  key={listing.id}
                  listing={listing}
                  isSaved={favoriteIds.has(listing.id)}
                  onPress={() => navigation.push('ListingDetail', { id: listing.id })}
                  onToggleSaved={() =>
                    toggleFavorite.mutate({
                      listingId: listing.id,
                      isSaved: favoriteIds.has(listing.id),
                    })
                  }
                />
              ))
            )}

            {listingsQuery.hasNextPage ? (
              <TouchableOpacity
                style={styles.loadMore}
                onPress={() => void listingsQuery.fetchNextPage()}
                disabled={listingsQuery.isFetchingNextPage}
                accessibilityRole="button"
              >
                <Typography variant="body2" weight="SEMIBOLD" colorKey="PRIMARY">
                  {listingsQuery.isFetchingNextPage ? 'Đang tải...' : 'Xem thêm'}
                </Typography>
              </TouchableOpacity>
            ) : null}
          </View>
        </ScrollView>
      )}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING_TOKENS.MD,
    paddingVertical: SPACING_TOKENS.SM,
  },
  headerTitle: { flex: 1, marginLeft: SPACING_TOKENS.SM },
  headerSpacer: { width: 40 },
  previewBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    backgroundColor: THEME_COLORS.TEXT_PRIMARY,
  },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  content: { padding: SPACING_TOKENS.MD, paddingBottom: SPACING_TOKENS.XL, gap: SPACING_TOKENS.MD },
  identity: { flexDirection: 'row', alignItems: 'center', gap: SPACING_TOKENS.MD },
  identityBody: { flex: 1, gap: 6 },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
    backgroundColor: THEME_COLORS.SUCCESS_LIGHT,
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING_TOKENS.MD,
    borderRadius: BORDER_RADIUS_TOKENS.LG,
    backgroundColor: THEME_COLORS.SURFACE_MUTED,
  },
  statItem: { flex: 1, alignItems: 'center', gap: 2 },
  statDivider: { width: 1, height: 32, backgroundColor: THEME_COLORS.BORDER },
  bio: { lineHeight: 22 },
  universities: { gap: SPACING_TOKENS.XS },
  universityRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING_TOKENS.SM },
  universityName: { flex: 1 },
  actions: { flexDirection: 'row', gap: SPACING_TOKENS.SM },
  action: {
    flex: 1,
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: BORDER_RADIUS_TOKENS.LG,
  },
  actionPrimary: { backgroundColor: THEME_COLORS.PRIMARY },
  actionOutline: {
    borderWidth: 1,
    borderColor: THEME_COLORS.BORDER,
    backgroundColor: THEME_COLORS.SURFACE,
  },
  listSection: { gap: SPACING_TOKENS.SM },
  listLoading: { marginVertical: SPACING_TOKENS.MD },
  loadMore: { alignItems: 'center', paddingVertical: SPACING_TOKENS.SM },
});
