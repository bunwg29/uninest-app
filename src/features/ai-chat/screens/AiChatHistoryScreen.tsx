import { useMemo, useState } from 'react';
import { RefreshControl, SectionList, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ChevronRight, Lock, MessageSquareText, Plus, Sparkles } from 'lucide-react-native';
import { BORDER_RADIUS_TOKENS, SPACING_TOKENS, THEME_COLORS } from '@theme';
import {
  Button,
  EmptyState,
  HeaderBar,
  Modal,
  NoticeBanner,
  ScreenContainer,
  SkeletonBox,
  Typography,
} from '@ui';
import type { RootStackParamList } from '@navigation';
import {
  useAiConversations,
  useDeleteAiConversation,
  useDeleteAllAiConversations,
} from '../hooks/useAiChat';
import type { AiConversationSummary } from '../types';
import { formatAiTime } from '../utils';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface ConversationSection {
  title: string;
  isRecent: boolean;
  data: AiConversationSummary[];
}

const DAY_MS = 24 * 60 * 60 * 1000;
const RECENT_DAYS = 7;

const formatDate = (value: string): string => {
  const date = new Date(value);

  return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}`;
};

const groupConversations = (items: AiConversationSummary[]): ConversationSection[] => {
  const startOfToday = new Date();

  startOfToday.setHours(0, 0, 0, 0);

  const recentThreshold = startOfToday.getTime() - RECENT_DAYS * DAY_MS;
  const sections: ConversationSection[] = [
    { title: 'HÔM NAY', isRecent: true, data: [] },
    { title: '7 NGÀY QUA', isRecent: false, data: [] },
    { title: 'CŨ HƠN', isRecent: false, data: [] },
  ];

  items.forEach((item) => {
    const time = new Date(item.lastMessageAt).getTime();
    const index = time >= startOfToday.getTime() ? 0 : time >= recentThreshold ? 1 : 2;

    sections[index].data.push(item);
  });

  return sections.filter((section) => section.data.length > 0);
};

const describeConversation = (item: AiConversationSummary, isToday: boolean): string =>
  [
    `${item.messageCount} tin nhắn`,
    item.suggestedListingCount > 0 ? `gợi ý ${item.suggestedListingCount} phòng` : null,
    isToday ? formatAiTime(item.lastMessageAt) : formatDate(item.lastMessageAt),
  ]
    .filter(Boolean)
    .join(' · ');

export const AiChatHistoryScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const conversationsQuery = useAiConversations();
  const deleteConversation = useDeleteAiConversation();
  const deleteAllConversations = useDeleteAllAiConversations();
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [isDeleteAllVisible, setIsDeleteAllVisible] = useState(false);
  const conversations = useMemo(
    () => conversationsQuery.data?.pages.flatMap((page) => page.items) ?? [],
    [conversationsQuery.data]
  );
  const sections = useMemo(() => groupConversations(conversations), [conversations]);

  const openConversation = (conversationId?: string) => {
    navigation.navigate('Main', {
      screen: 'AiChat',
      params: conversationId ? { conversationId } : undefined,
    });
  };

  const handleConfirmDelete = () => {
    if (!pendingDeleteId) return;

    deleteConversation.mutate(pendingDeleteId, {
      onSettled: () => setPendingDeleteId(null),
    });
  };

  const handleConfirmDeleteAll = () => {
    deleteAllConversations.mutate(undefined, {
      onSettled: () => setIsDeleteAllVisible(false),
    });
  };

  const renderItem = ({
    item,
    section,
  }: {
    item: AiConversationSummary;
    section: ConversationSection;
  }) => (
    <TouchableOpacity
      style={styles.row}
      onPress={() => openConversation(item.id)}
      onLongPress={() => setPendingDeleteId(item.id)}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityHint="Nhấn giữ để xoá cuộc trò chuyện"
    >
      <View style={[styles.rowIcon, !section.isRecent && styles.rowIconMuted]}>
        <Sparkles
          size={16}
          color={section.isRecent ? THEME_COLORS.PRIMARY_DARK : THEME_COLORS.TEXT_PLACEHOLDER}
        />
      </View>

      <View style={styles.rowContent}>
        <Typography variant="body2" weight="SEMIBOLD" colorKey="TEXT_PRIMARY" numberOfLines={1}>
          {item.title}
        </Typography>

        <Typography variant="caption" colorKey="TEXT_PLACEHOLDER">
          {describeConversation(item, section.isRecent)}
        </Typography>
      </View>

      <ChevronRight size={18} color={THEME_COLORS.TEXT_PLACEHOLDER} />
    </TouchableOpacity>
  );

  const renderBody = () => {
    if (conversationsQuery.isLoading) {
      return (
        <View style={styles.skeleton}>
          {[0, 1, 2, 3].map((item) => (
            <SkeletonBox key={item} height={64} />
          ))}
        </View>
      );
    }

    if (conversationsQuery.isError) {
      return (
        <EmptyState
          icon={<MessageSquareText size={40} color={THEME_COLORS.TEXT_PLACEHOLDER} />}
          title="Không tải được lịch sử"
          description={conversationsQuery.error.message}
          actionTitle="Thử lại"
          onAction={() => void conversationsQuery.refetch()}
        />
      );
    }

    return (
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        renderSectionHeader={({ section }) => (
          <Typography
            variant="caption"
            weight="MEDIUM"
            colorKey="TEXT_PLACEHOLDER"
            style={styles.sectionTitle}
          >
            {section.title}
          </Typography>
        )}
        stickySectionHeadersEnabled={false}
        onEndReached={() => {
          if (conversationsQuery.hasNextPage && !conversationsQuery.isFetchingNextPage) {
            void conversationsQuery.fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.4}
        refreshControl={
          <RefreshControl
            refreshing={conversationsQuery.isRefetching}
            onRefresh={() => void conversationsQuery.refetch()}
          />
        }
        ListEmptyComponent={
          <EmptyState
            icon={<MessageSquareText size={40} color={THEME_COLORS.TEXT_PLACEHOLDER} />}
            title="Chưa có cuộc trò chuyện nào"
            description="Hỏi trợ lý AI để tìm phòng phù hợp, lịch sử sẽ được lưu ở đây."
          />
        }
        ListFooterComponent={
          <NoticeBanner tone="info" icon={Lock} style={styles.notice}>
            Lịch sử này chỉ dùng để cải thiện gợi ý cho riêng bạn. Bạn có thể xoá bất cứ lúc nào.
          </NoticeBanner>
        }
        contentContainerStyle={styles.list}
      />
    );
  };

  return (
    <ScreenContainer style={styles.container}>
      <HeaderBar
        title="Lịch sử trò chuyện"
        alignTitle="left"
        onBack={() => navigation.goBack()}
        rightActionWidth={72}
        rightAction={
          conversations.length > 0 ? (
            <TouchableOpacity
              onPress={() => setIsDeleteAllVisible(true)}
              style={styles.deleteAll}
              accessibilityRole="button"
            >
              <Typography variant="label" weight="SEMIBOLD" color={THEME_COLORS.ERROR}>
                Xoá hết
              </Typography>
            </TouchableOpacity>
          ) : undefined
        }
      />

      <View style={styles.newChat}>
        <Button
          title="Cuộc trò chuyện mới"
          size="lg"
          leftIcon={<Plus size={20} color={THEME_COLORS.WHITE} />}
          onPress={() => openConversation()}
          fullWidth
        />
      </View>

      <View style={styles.body}>{renderBody()}</View>

      <Modal
        isVisible={pendingDeleteId !== null}
        onClose={() => setPendingDeleteId(null)}
        title="Xoá cuộc trò chuyện?"
        description="Cuộc trò chuyện này sẽ bị xoá khỏi lịch sử của bạn."
        confirmText="Xoá"
        cancelText="Huỷ"
        confirmVariant="danger"
        isConfirmLoading={deleteConversation.isPending}
        onConfirm={handleConfirmDelete}
      />

      <Modal
        isVisible={isDeleteAllVisible}
        onClose={() => setIsDeleteAllVisible(false)}
        title="Xoá toàn bộ lịch sử?"
        description="Mọi cuộc trò chuyện với trợ lý AI sẽ bị xoá. Phòng đã lưu và lịch hẹn không bị ảnh hưởng."
        confirmText="Xoá hết"
        cancelText="Huỷ"
        confirmVariant="danger"
        isConfirmLoading={deleteAllConversations.isPending}
        onConfirm={handleConfirmDeleteAll}
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME_COLORS.SURFACE,
  },
  newChat: {
    padding: SPACING_TOKENS.MD,
    backgroundColor: THEME_COLORS.BACKGROUND,
  },
  body: {
    flex: 1,
    backgroundColor: THEME_COLORS.BACKGROUND,
  },
  list: {
    paddingBottom: SPACING_TOKENS.LG,
  },
  sectionTitle: {
    paddingHorizontal: SPACING_TOKENS.MD,
    paddingTop: SPACING_TOKENS.SM,
    paddingBottom: SPACING_TOKENS.SM,
    letterSpacing: 0.6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING_TOKENS.SM + 4,
    minHeight: 64,
    paddingHorizontal: SPACING_TOKENS.MD,
    paddingVertical: SPACING_TOKENS.SM + 4,
    backgroundColor: THEME_COLORS.SURFACE,
    borderBottomWidth: 1,
    borderBottomColor: THEME_COLORS.DIVIDER,
  },
  rowIcon: {
    width: 32,
    height: 32,
    borderRadius: BORDER_RADIUS_TOKENS.SM,
    backgroundColor: THEME_COLORS.PRIMARY_LIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowIconMuted: {
    backgroundColor: THEME_COLORS.SURFACE_MUTED,
  },
  rowContent: {
    flex: 1,
    gap: 2,
  },
  notice: {
    marginHorizontal: SPACING_TOKENS.MD,
    marginTop: SPACING_TOKENS.LG,
  },
  skeleton: {
    padding: SPACING_TOKENS.MD,
    gap: SPACING_TOKENS.SM,
  },
  deleteAll: {
    height: 44,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
});
