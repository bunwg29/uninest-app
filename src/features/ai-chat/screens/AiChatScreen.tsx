import { useCallback, useEffect, useRef, useState } from 'react';
import { FlatList, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { History, Plus } from 'lucide-react-native';
import { AppError, HTTP_STATUS_CODES } from '@core';
import { SPACING_TOKENS, THEME_COLORS } from '@theme';
import { HeaderBar, ScreenContainer, SkeletonBox } from '@ui';
import { useToast } from '@hooks';
import { useOpenListing } from '@features/listings';
import { useSearchStore } from '@features/search';
import type { MainTabParamList, RootStackParamList } from '@navigation';
import { AiAssistantMessage } from '../components/AiAssistantMessage';
import { AiChatComposer } from '../components/AiChatComposer';
import { AiCriteriaSheet } from '../components/AiCriteriaSheet';
import { AiPendingMessage, AiUserBubble } from '../components/AiMessageBubbles';
import { AiWelcome } from '../components/AiWelcome';
import { useAiConversation, useSendAiMessage } from '../hooks/useAiChat';
import type {
  AiAssistantContent,
  AiChatCriteria,
  AiChatReply,
  AiChatTurn,
  AiConversationDetail,
  AiCriteriaDisplay,
  AiRelaxationSuggestion,
  SendAiMessagePayload,
} from '../types';
import { toSearchPreset } from '../utils';

type NavigationProp = NativeStackNavigationProp<RootStackParamList & MainTabParamList>;

const EDITED_CRITERIA_MESSAGE = 'Tìm lại theo tiêu chí đã sửa';
const USER_FACING_ERROR_STATUSES: readonly number[] = [
  HTTP_STATUS_CODES.BAD_REQUEST,
  HTTP_STATUS_CODES.NOT_FOUND,
  HTTP_STATUS_CODES.TOO_MANY_REQUESTS,
];

let turnSequence = 0;

const nextTurnId = (prefix: string): string => {
  turnSequence += 1;

  return `${prefix}-${Date.now()}-${turnSequence}`;
};

const toAssistantContent = (
  reply: AiChatReply,
  retryPayload: SendAiMessagePayload
): AiAssistantContent => ({
  type: reply.type,
  answer: reply.answer,
  errorCode: reply.errorCode,
  criteria: reply.criteria,
  criteriaDisplay: reply.criteriaDisplay,
  matchedCount: reply.matchedCount,
  totalActiveCount: reply.totalActiveCount,
  listings: reply.listings,
  suggestions: reply.suggestions,
  createdAt: reply.assistantMessage?.createdAt ?? new Date().toISOString(),
  retryPayload: reply.type === 'service_error' ? retryPayload : null,
});

const toTurnsFromHistory = (detail: AiConversationDetail): AiChatTurn[] => {
  const listingsById = new Map(detail.listings.map((listing) => [listing.id, listing]));
  const lastAssistantId = [...detail.messages]
    .reverse()
    .find((item) => item.role === 'assistant')?.id;

  return detail.messages.map((message): AiChatTurn => {
    if (message.role === 'user') {
      return { id: message.id, role: 'user', content: message.content };
    }

    return {
      id: message.id,
      role: 'assistant',
      content: {
        type: message.type ?? 'general',
        answer: message.content,
        errorCode: null,
        criteria: message.criteria,
        criteriaDisplay: message.id === lastAssistantId ? detail.criteriaDisplay : null,
        matchedCount: message.matchedCount ?? 0,
        totalActiveCount: null,
        listings: message.listingIds.flatMap((id) => {
          const listing = listingsById.get(id);

          return listing ? [listing] : [];
        }),
        suggestions: [],
        createdAt: message.createdAt,
        retryPayload: null,
      },
    };
  });
};

export const AiChatScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProp<MainTabParamList, 'AiChat'>>();
  const toast = useToast();
  const { openListing } = useOpenListing();
  const applySearchPreset = useSearchStore((state) => state.applyPreset);
  const sendMessage = useSendAiMessage();
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [turns, setTurns] = useState<AiChatTurn[]>([]);
  const [draft, setDraft] = useState('');
  const [criteria, setCriteria] = useState<AiChatCriteria>({});
  const [criteriaDisplay, setCriteriaDisplay] = useState<AiCriteriaDisplay | null>(null);
  const [isCriteriaSheetVisible, setIsCriteriaSheetVisible] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const listRef = useRef<FlatList<AiChatTurn>>(null);
  const requestedConversationId = route.params?.conversationId ?? null;
  const conversationQuery = useAiConversation(requestedConversationId);

  const resetConversation = useCallback(() => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    setConversationId(null);
    setTurns([]);
    setCriteria({});
    setCriteriaDisplay(null);
    setDraft('');
  }, []);

  useEffect(() => {
    const detail = conversationQuery.data;

    if (!detail || detail.id !== requestedConversationId) return;

    abortControllerRef.current?.abort();
    setConversationId(detail.id);
    setTurns(toTurnsFromHistory(detail));
    setCriteria(detail.criteria);
    setCriteriaDisplay(detail.criteriaDisplay);
    navigation.setParams({ conversationId: undefined });
  }, [conversationQuery.data, requestedConversationId, navigation]);

  useEffect(() => {
    if (!conversationQuery.isError || !requestedConversationId) return;

    toast.error(conversationQuery.error.message);
    navigation.setParams({ conversationId: undefined });
  }, [
    conversationQuery.isError,
    conversationQuery.error,
    requestedConversationId,
    navigation,
    toast,
  ]);

  useEffect(() => () => abortControllerRef.current?.abort(), []);

  const send = async (payload: SendAiMessagePayload, displayText: string) => {
    abortControllerRef.current?.abort();

    const abortController = new AbortController();
    const pendingId = nextTurnId('pending');
    const requestPayload: SendAiMessagePayload = {
      ...payload,
      conversationId: payload.conversationId ?? conversationId ?? undefined,
    };

    abortControllerRef.current = abortController;
    setTurns((current) => [
      ...current,
      { id: nextTurnId('user'), role: 'user', content: displayText },
      { id: pendingId, role: 'pending' },
    ]);

    try {
      const reply = await sendMessage.mutateAsync({
        payload: requestPayload,
        signal: abortController.signal,
      });

      if (abortController.signal.aborted) return;

      if (reply.conversationId) setConversationId(reply.conversationId);

      if (reply.type !== 'service_error') {
        setCriteria(reply.criteria);
        setCriteriaDisplay(reply.criteriaDisplay);
      }

      setTurns((current) =>
        current.map((turn) =>
          turn.id === pendingId
            ? {
                id: reply.assistantMessage?.id ?? pendingId,
                role: 'assistant',
                content: toAssistantContent(reply, requestPayload),
              }
            : turn
        )
      );
    } catch (error) {
      if (abortController.signal.aborted) return;

      if (error instanceof AppError && USER_FACING_ERROR_STATUSES.includes(error.statusCode)) {
        toast.error(error.message);
        setTurns((current) => current.slice(0, -2));
        setDraft(displayText);

        return;
      }

      setTurns((current) =>
        current.map((turn) =>
          turn.id === pendingId
            ? {
                id: pendingId,
                role: 'assistant',
                content: {
                  type: 'service_error',
                  answer:
                    'Trợ lý AI đang bận, mình chưa trả lời được lúc này. Bạn thử lại sau hoặc dùng tìm kiếm thường nhé.',
                  errorCode: 'AI-503',
                  criteria,
                  criteriaDisplay,
                  matchedCount: 0,
                  totalActiveCount: null,
                  listings: [],
                  suggestions: [],
                  createdAt: new Date().toISOString(),
                  retryPayload: requestPayload,
                },
              }
            : turn
        )
      );
    } finally {
      if (abortControllerRef.current === abortController) abortControllerRef.current = null;
    }
  };

  const handleSend = () => {
    const message = draft.trim();

    if (!message) return;

    setDraft('');
    void send({ message }, message);
  };

  const handleStop = () => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    setTurns((current) => current.filter((turn) => turn.role !== 'pending'));
    toast.info('Đã dừng trả lời');
  };

  const handleApplySuggestion = (suggestion: AiRelaxationSuggestion) => {
    void send({ message: suggestion.title, criteria: suggestion.criteria }, suggestion.title);
  };

  const handleSubmitCriteria = (nextCriteria: AiChatCriteria) => {
    setIsCriteriaSheetVisible(false);
    void send(
      { message: EDITED_CRITERIA_MESSAGE, criteria: nextCriteria },
      EDITED_CRITERIA_MESSAGE
    );
  };

  const handleUseSearch = (content: AiAssistantContent) => {
    applySearchPreset(toSearchPreset(content.criteria, content.criteriaDisplay));
    navigation.navigate('Search');
  };

  const handleRetry = (content: AiAssistantContent) => {
    const retryPayload = content.retryPayload;

    if (!retryPayload) return;

    setTurns((current) => current.slice(0, -2));
    void send(retryPayload, retryPayload.message);
  };

  const lastTurn = turns[turns.length - 1];
  const isPending = lastTurn?.role === 'pending';
  const isServiceUnavailable =
    lastTurn?.role === 'assistant' && lastTurn.content.type === 'service_error';
  const lastAssistantId = [...turns].reverse().find((turn) => turn.role === 'assistant')?.id;
  const isLoadingHistory = Boolean(requestedConversationId) && conversationQuery.isLoading;
  const hasConversation = turns.length > 0 || isLoadingHistory;

  const renderTurn = ({ item }: { item: AiChatTurn }) => {
    if (item.role === 'user') return <AiUserBubble content={item.content} />;

    if (item.role === 'pending') return <AiPendingMessage onStop={handleStop} />;

    return (
      <AiAssistantMessage
        content={item.content}
        canEditCriteria={
          item.id === lastAssistantId &&
          (item.content.type === 'results' || item.content.type === 'no_results')
        }
        onEditCriteria={() => setIsCriteriaSheetVisible(true)}
        onOpenListing={(listingId) => void openListing(listingId)}
        onApplySuggestion={handleApplySuggestion}
        onUseSearch={handleUseSearch}
        onRetry={handleRetry}
      />
    );
  };

  const historyAction = (
    <TouchableOpacity
      style={styles.headerAction}
      onPress={() => navigation.navigate('AiChatHistory')}
      accessibilityRole="button"
      accessibilityLabel="Lịch sử trò chuyện"
    >
      <History size={22} color={THEME_COLORS.TEXT_PRIMARY} />
    </TouchableOpacity>
  );

  const newChatAction = (
    <TouchableOpacity
      style={styles.headerAction}
      onPress={resetConversation}
      accessibilityRole="button"
      accessibilityLabel="Cuộc trò chuyện mới"
    >
      <Plus size={22} color={THEME_COLORS.TEXT_PRIMARY} />
    </TouchableOpacity>
  );

  return (
    <ScreenContainer applyBottomInset={false} style={styles.container}>
      <HeaderBar
        title="Trợ lý AI"
        alignTitle="left"
        onBack={hasConversation ? resetConversation : undefined}
        rightAction={hasConversation ? newChatAction : historyAction}
      />

      <View style={styles.body}>
        {isLoadingHistory ? (
          <View style={styles.skeleton}>
            <SkeletonBox width="70%" height={64} style={styles.skeletonUser} />
            <SkeletonBox width="85%" height={220} />
          </View>
        ) : hasConversation ? (
          <FlatList
            ref={listRef}
            data={turns}
            keyExtractor={(item) => item.id}
            renderItem={renderTurn}
            contentContainerStyle={styles.messages}
            keyboardShouldPersistTaps="handled"
            onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
          />
        ) : (
          <ScrollView keyboardShouldPersistTaps="handled">
            <AiWelcome onSelectPrompt={(prompt) => void send({ message: prompt }, prompt)} />
          </ScrollView>
        )}
      </View>

      <AiChatComposer
        value={draft}
        onChangeText={setDraft}
        onSend={handleSend}
        isDisabled={isPending || isServiceUnavailable}
        placeholder={
          isServiceUnavailable
            ? 'Trợ lý tạm thời không khả dụng'
            : hasConversation
              ? 'Nhắn cho trợ lý…'
              : 'Mô tả phòng bạn cần…'
        }
      />

      <AiCriteriaSheet
        isVisible={isCriteriaSheetVisible}
        criteria={criteria}
        display={criteriaDisplay}
        onClose={() => setIsCriteriaSheetVisible(false)}
        onSubmit={handleSubmitCriteria}
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME_COLORS.SURFACE,
  },
  body: {
    flex: 1,
    backgroundColor: THEME_COLORS.BACKGROUND,
  },
  messages: {
    padding: SPACING_TOKENS.MD,
    gap: SPACING_TOKENS.MD - 2,
  },
  headerAction: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skeleton: {
    padding: SPACING_TOKENS.MD,
    gap: SPACING_TOKENS.MD,
  },
  skeletonUser: {
    alignSelf: 'flex-end',
  },
});
