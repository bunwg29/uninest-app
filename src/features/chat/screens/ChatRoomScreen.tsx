import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as Clipboard from 'expo-clipboard';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { THEME_COLORS, SPACING_TOKENS } from '@theme';
import { EmptyState, ScreenContainer, Typography } from '@ui';
import { useToast } from '@hooks';
import { useAuth, useRoleGuard } from '@features/auth';
import { useOpenListing } from '@features/listings/hooks/useOpenListing';
import type { RootStackParamList } from '@navigation/types';
import {
  ChatComposer,
  ChatRoomHeader,
  DateSeparator,
  DeleteConversationModal,
  ImageViewerModal,
  ListingPinBar,
  MessageActionSheet,
  MessageBubble,
  OfflineBanner,
  PendingNotice,
} from '../components';
import {
  useChatImagePicker,
  useChatRoom,
  useConversation,
  useDeleteConversation,
  useNetworkStatus,
  useRecallMessage,
} from '../hooks';
import { formatClockTime, formatDayLabel, isSameCalendarDay } from '../services';
import { useChatStore } from '../store';
import type { DisplayMessage } from '../types';
import { CHAT_LIMITS, QUICK_REPLIES } from '../types';

type ChatRoomScreenProps = NativeStackScreenProps<RootStackParamList, 'ChatRoom'>;

interface ViewerState {
  imageUrls: string[];
  index: number;
}

export const ChatRoomScreen = ({ navigation, route }: ChatRoomScreenProps) => {
  const { conversationId } = route.params;
  const toast = useToast();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { isStudent } = useRoleGuard();
  const currentUserId = user?.id ?? '';

  const isOnline = useNetworkStatus();
  const conversationQuery = useConversation(conversationId);
  const room = useChatRoom(conversationId, currentUserId);
  const { openListing } = useOpenListing();
  const recallMutation = useRecallMessage(conversationId);
  const deleteMutation = useDeleteConversation();
  const { pickFromLibrary, takePhoto } = useChatImagePicker();

  const draft = useChatStore((state) => state.drafts[conversationId] ?? '');
  const setDraft = useChatStore((state) => state.setDraft);

  const [selectedMessage, setSelectedMessage] = useState<DisplayMessage | null>(null);
  const [viewer, setViewer] = useState<ViewerState | null>(null);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [isDeleteVisible, setIsDeleteVisible] = useState(false);

  const conversation = conversationQuery.data;

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSubscription = Keyboard.addListener(showEvent, () => setIsKeyboardVisible(true));
    const hideSubscription = Keyboard.addListener(hideEvent, () => setIsKeyboardVisible(false));

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const handleChangeText = useCallback(
    (text: string) => setDraft(conversationId, text),
    [conversationId, setDraft]
  );

  const handleSend = useCallback(() => {
    room.sendMessage(draft);
    setDraft(conversationId, '');
  }, [room, draft, conversationId, setDraft]);

  const handleConfirmDeleteConversation = useCallback(() => {
    deleteMutation.mutate(conversationId, {
      onSuccess: () => navigation.goBack(),
      onError: (error) => {
        setIsDeleteVisible(false);
        toast.error(error.message || 'Không thể xoá đoạn chat');
      },
    });
  }, [deleteMutation, conversationId, navigation, toast]);

  const handlePressQuickReply = useCallback(
    (text: string) => setDraft(conversationId, text),
    [conversationId, setDraft]
  );

  const openImagePreview = useCallback(
    (imageUris: string[]) => {
      if (imageUris.length === 0) {
        return;
      }

      navigation.navigate('ChatImagePreview', {
        conversationId,
        counterpartName: conversation?.counterpart.fullName ?? '',
        imageUris,
      });
    },
    [navigation, conversationId, conversation]
  );

  const handlePickImages = useCallback(async () => {
    openImagePreview(await pickFromLibrary(CHAT_LIMITS.MAX_IMAGES_PER_MESSAGE));
  }, [openImagePreview, pickFromLibrary]);

  const handleTakePhoto = useCallback(async () => {
    openImagePreview(await takePhoto());
  }, [openImagePreview, takePhoto]);

  const handlePressImage = useCallback(
    (imageUrls: string[], index: number) => setViewer({ imageUrls, index }),
    []
  );

  const handleLongPressMessage = useCallback((message: DisplayMessage) => {
    if (message.id && !message.isRecalled) {
      setSelectedMessage(message);
    }
  }, []);

  const handleCopy = useCallback(async () => {
    if (selectedMessage?.content) {
      await Clipboard.setStringAsync(selectedMessage.content);
      toast.success('Đã sao chép tin nhắn');
    }

    setSelectedMessage(null);
  }, [selectedMessage, toast]);

  const handleRecall = useCallback(() => {
    const messageId = selectedMessage?.id;

    setSelectedMessage(null);

    if (!messageId) {
      return;
    }

    recallMutation.mutate(messageId, {
      onError: (error) => toast.error(error.message || 'Không thể thu hồi tin nhắn'),
    });
  }, [selectedMessage, recallMutation, toast]);

  const handleEndReached = useCallback(() => {
    if (room.hasNextPage && !room.isFetchingNextPage) {
      void room.fetchNextPage();
    }
  }, [room]);

  const canRecallSelected = selectedMessage !== null && selectedMessage.isMine;

  const renderMessage = ({ item, index }: { item: DisplayMessage; index: number }) => {
    const newerMessage = room.messages[index - 1];
    const olderMessage = room.messages[index + 1];

    const shouldShowTime =
      !newerMessage ||
      newerMessage.senderId !== item.senderId ||
      newerMessage.deliveryState !== 'sent' ||
      formatClockTime(newerMessage.createdAt) !== formatClockTime(item.createdAt);

    const shouldShowDate =
      !olderMessage || !isSameCalendarDay(olderMessage.createdAt, item.createdAt);

    return (
      <View>
        {shouldShowDate ? <DateSeparator label={formatDayLabel(item.createdAt)} /> : null}

        <MessageBubble
          message={item}
          shouldShowTime={shouldShowTime}
          onLongPress={handleLongPressMessage}
          onRetry={room.retryMessage}
          onDiscard={room.discardMessage}
          onPressImage={handlePressImage}
        />
      </View>
    );
  };

  const renderEmpty = () => {
    if (room.isLoading) {
      return (
        <View style={[styles.centered, styles.flipped]}>
          <ActivityIndicator color={THEME_COLORS.PRIMARY} />
        </View>
      );
    }

    if (room.isError) {
      return (
        <View style={styles.flipped}>
          <EmptyState
            title="Không tải được tin nhắn"
            description="Vui lòng kiểm tra kết nối mạng và thử lại."
            actionTitle="Thử lại"
            onAction={() => void room.refetch()}
          />
        </View>
      );
    }

    return (
      <View style={[styles.centered, styles.flipped]}>
        <Typography variant="body2" colorKey="TEXT_MUTED" align="center">
          {`Hãy gửi lời chào đầu tiên tới ${conversation?.counterpart.fullName ?? 'chủ trọ'}.`}
        </Typography>
      </View>
    );
  };

  return (
    <ScreenContainer style={styles.container} applyBottomInset={false} keyboardAvoiding={false}>
      <ChatRoomHeader
        counterpart={conversation?.counterpart ?? null}
        onBack={() => navigation.goBack()}
        onPressMenu={() => setIsDeleteVisible(true)}
      />

      {!isOnline ? <OfflineBanner /> : null}

      {conversation ? (
        <ListingPinBar
          listing={conversation.listing}
          onPress={() => void openListing(conversation.listing.id)}
        />
      ) : null}

      <KeyboardAvoidingView
        style={styles.body}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <FlatList
          style={styles.list}
          data={room.messages}
          inverted
          keyExtractor={(item) => item.key}
          renderItem={renderMessage}
          ListEmptyComponent={renderEmpty()}
          ListFooterComponent={
            room.isFetchingNextPage ? (
              <ActivityIndicator color={THEME_COLORS.PRIMARY} style={styles.footerLoader} />
            ) : null
          }
          contentContainerStyle={styles.listContent}
          initialNumToRender={15}
          maxToRenderPerBatch={10}
          windowSize={9}
          removeClippedSubviews={Platform.OS === 'android'}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.4}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
        />

        <View
          style={[
            styles.composerWrapper,
            { paddingBottom: Math.max(isKeyboardVisible ? 0 : insets.bottom, SPACING_TOKENS.SM) },
          ]}
        >
          {room.waitingCount > 0 ? <PendingNotice count={room.waitingCount} /> : null}

          <ChatComposer
            value={draft}
            onChangeText={handleChangeText}
            onSend={handleSend}
            onPickImages={() => void handlePickImages()}
            onTakePhoto={() => void handleTakePhoto()}
            quickReplies={isStudent ? QUICK_REPLIES : undefined}
            onPressQuickReply={handlePressQuickReply}
          />
        </View>
      </KeyboardAvoidingView>

      <MessageActionSheet
        isVisible={selectedMessage !== null}
        canCopy={Boolean(selectedMessage?.content)}
        canRecall={canRecallSelected}
        onClose={() => setSelectedMessage(null)}
        onCopy={() => void handleCopy()}
        onRecall={handleRecall}
      />

      <DeleteConversationModal
        isVisible={isDeleteVisible}
        isLoading={deleteMutation.isPending}
        onClose={() => setIsDeleteVisible(false)}
        onConfirm={handleConfirmDeleteConversation}
      />

      <ImageViewerModal
        isVisible={viewer !== null}
        imageUrls={viewer?.imageUrls ?? []}
        initialIndex={viewer?.index ?? 0}
        onClose={() => setViewer(null)}
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: THEME_COLORS.SURFACE,
  },
  body: {
    flex: 1,
    backgroundColor: THEME_COLORS.BACKGROUND,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: SPACING_TOKENS.MD,
    paddingVertical: SPACING_TOKENS.SM + 2,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING_TOKENS.XXL,
  },
  flipped: {
    transform: [{ scaleY: -1 }],
  },
  footerLoader: {
    paddingVertical: SPACING_TOKENS.MD,
  },
  composerWrapper: {
    backgroundColor: THEME_COLORS.SURFACE,
    borderTopWidth: 1,
    borderTopColor: THEME_COLORS.BORDER,
  },
});
