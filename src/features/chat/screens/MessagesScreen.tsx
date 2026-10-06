import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Search, X } from 'lucide-react-native';
import { THEME_COLORS, SPACING_TOKENS, BORDER_RADIUS_TOKENS, TYPOGRAPHY_TOKENS } from '@theme';
import { EmptyState, FilterChip, ScreenContainer, Typography } from '@ui';
import { useAuth, useRoleGuard } from '@features/auth';
import type { RootStackParamList } from '@navigation/types';
import { ConversationListItem, DeleteConversationModal, EmptyConversations } from '../components';
import {
  useChatSummary,
  useConversations,
  useDebouncedValue,
  useDeleteConversation,
} from '../hooks';
import type { Conversation, ConversationFilter } from '../types';
import { CHAT_LIMITS } from '../types';

const ItemSeparator = () => <View style={styles.separator} />;

export const MessagesScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { isStudent } = useRoleGuard();
  const { user } = useAuth();
  const currentUserId = user?.id ?? '';

  const [filter, setFilter] = useState<ConversationFilter>('all');
  const [isSearching, setIsSearching] = useState(false);
  const [keyword, setKeyword] = useState('');

  const [conversationToDelete, setConversationToDelete] = useState<Conversation | null>(null);

  const debouncedKeyword = useDebouncedValue(keyword.trim(), CHAT_LIMITS.SEARCH_DEBOUNCE_MS);

  const summaryQuery = useChatSummary();
  const conversationsQuery = useConversations(filter, debouncedKeyword);
  const deleteMutation = useDeleteConversation();

  const conversations = useMemo(() => {
    const uniqueConversations = new Map<string, Conversation>();

    for (const page of conversationsQuery.data?.pages ?? []) {
      for (const conversation of page.items) {
        uniqueConversations.set(conversation.id, conversation);
      }
    }

    return [...uniqueConversations.values()];
  }, [conversationsQuery.data]);

  const handleOpenConversation = useCallback(
    (conversation: Conversation) => {
      navigation.navigate('ChatRoom', { conversationId: conversation.id });
    },
    [navigation]
  );

  const handleConfirmDelete = useCallback(() => {
    if (!conversationToDelete) {
      return;
    }

    deleteMutation.mutate(conversationToDelete.id, {
      onSettled: () => setConversationToDelete(null),
    });
  }, [conversationToDelete, deleteMutation]);

  const handleFindRoom = useCallback(() => {
    navigation.navigate('Main', { screen: 'Search' });
  }, [navigation]);

  const handleToggleSearch = useCallback(() => {
    setIsSearching((current) => !current);
    setKeyword('');
  }, []);

  const handleRefresh = useCallback(() => {
    void conversationsQuery.refetch();
    void summaryQuery.refetch();
  }, [conversationsQuery, summaryQuery]);

  const handleEndReached = useCallback(() => {
    if (conversationsQuery.hasNextPage && !conversationsQuery.isFetchingNextPage) {
      void conversationsQuery.fetchNextPage();
    }
  }, [conversationsQuery]);

  const totalCount = summaryQuery.data?.totalConversations;
  const unreadCount = summaryQuery.data?.unreadConversations;
  const isPristine = filter === 'all' && !debouncedKeyword;
  const isInboxEmpty = summaryQuery.data?.totalConversations === 0 && isPristine;

  const renderEmpty = () => {
    if (conversationsQuery.isLoading) {
      return (
        <View style={styles.centered}>
          <ActivityIndicator color={THEME_COLORS.PRIMARY} />
        </View>
      );
    }

    if (conversationsQuery.isError) {
      return (
        <EmptyState
          title="Không tải được tin nhắn"
          description="Vui lòng kiểm tra kết nối mạng và thử lại."
          actionTitle="Thử lại"
          onAction={handleRefresh}
        />
      );
    }

    if (isPristine) {
      return <EmptyConversations isStudent={isStudent} onFindRoom={handleFindRoom} />;
    }

    return (
      <EmptyState
        title={
          filter === 'unread' && !debouncedKeyword ? 'Không có tin chưa đọc' : 'Không tìm thấy'
        }
        description={
          filter === 'unread' && !debouncedKeyword
            ? 'Bạn đã đọc hết tất cả tin nhắn.'
            : 'Không có cuộc trò chuyện nào khớp với từ khoá.'
        }
      />
    );
  };

  return (
    <ScreenContainer style={styles.container} applyBottomInset={false} keyboardAvoiding={false}>
      <View style={[styles.header, isInboxEmpty && styles.headerBordered]}>
        <Typography variant="h1" weight="BOLD" style={styles.title}>
          Tin nhắn
        </Typography>

        {isInboxEmpty ? null : (
          <TouchableOpacity
            onPress={handleToggleSearch}
            accessibilityLabel={isSearching ? 'Đóng tìm kiếm' : 'Tìm hội thoại'}
            hitSlop={8}
          >
            {isSearching ? (
              <X size={21} color={THEME_COLORS.TEXT_PRIMARY} />
            ) : (
              <Search size={21} color={THEME_COLORS.TEXT_PRIMARY} />
            )}
          </TouchableOpacity>
        )}
      </View>

      {isSearching ? (
        <View style={styles.searchBar}>
          <TextInput
            style={styles.searchInput}
            value={keyword}
            onChangeText={setKeyword}
            placeholder="Tìm theo tên hoặc tin đăng"
            placeholderTextColor={THEME_COLORS.TEXT_PLACEHOLDER}
            autoFocus
          />
        </View>
      ) : null}

      {isInboxEmpty ? null : (
        <View style={styles.filters}>
          <FilterChip
            label={totalCount !== undefined ? `Tất cả (${totalCount})` : 'Tất cả'}
            isSelected={filter === 'all'}
            onPress={() => setFilter('all')}
          />

          <FilterChip
            label={unreadCount !== undefined ? `Chưa đọc (${unreadCount})` : 'Chưa đọc'}
            isSelected={filter === 'unread'}
            onPress={() => setFilter('unread')}
          />
        </View>
      )}

      <FlatList
        data={conversations}
        ItemSeparatorComponent={ItemSeparator}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ConversationListItem
            conversation={item}
            currentUserId={currentUserId}
            onPress={handleOpenConversation}
            onLongPress={setConversationToDelete}
          />
        )}
        ListEmptyComponent={renderEmpty()}
        ListFooterComponent={
          conversationsQuery.isFetchingNextPage ? (
            <ActivityIndicator color={THEME_COLORS.PRIMARY} style={styles.footerLoader} />
          ) : null
        }
        contentContainerStyle={conversations.length === 0 ? styles.emptyContent : undefined}
        refreshControl={
          <RefreshControl
            refreshing={conversationsQuery.isRefetching && !conversationsQuery.isFetchingNextPage}
            onRefresh={handleRefresh}
            tintColor={THEME_COLORS.PRIMARY}
          />
        }
        initialNumToRender={12}
        windowSize={7}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.4}
        keyboardShouldPersistTaps="handled"
      />

      <DeleteConversationModal
        isVisible={conversationToDelete !== null}
        isLoading={deleteMutation.isPending}
        onClose={() => setConversationToDelete(null)}
        onConfirm={handleConfirmDelete}
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME_COLORS.BACKGROUND,
  },
  header: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING_TOKENS.MD,
    backgroundColor: THEME_COLORS.SURFACE,
  },
  headerBordered: {
    borderBottomWidth: 1,
    borderBottomColor: THEME_COLORS.BORDER,
  },
  title: {
    letterSpacing: -0.5,
    lineHeight: 26,
  },
  separator: {
    height: 1,
    backgroundColor: THEME_COLORS.DIVIDER,
  },
  searchBar: {
    paddingHorizontal: SPACING_TOKENS.MD,
    paddingBottom: SPACING_TOKENS.SM,
    backgroundColor: THEME_COLORS.SURFACE,
  },
  searchInput: {
    height: 40,
    paddingHorizontal: SPACING_TOKENS.MD,
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
    backgroundColor: THEME_COLORS.SURFACE_MUTED,
    fontSize: TYPOGRAPHY_TOKENS.FONT_SIZES.SM,
    color: THEME_COLORS.TEXT_PRIMARY,
  },
  filters: {
    flexDirection: 'row',
    gap: SPACING_TOKENS.SM,
    paddingHorizontal: SPACING_TOKENS.MD,
    paddingBottom: SPACING_TOKENS.SM + 4,
    backgroundColor: THEME_COLORS.SURFACE,
  },
  emptyContent: {
    flexGrow: 1,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING_TOKENS.XXL,
  },
  footerLoader: {
    paddingVertical: SPACING_TOKENS.MD,
  },
});
