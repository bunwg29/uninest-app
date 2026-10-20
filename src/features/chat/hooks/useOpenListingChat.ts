import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useToast } from '@hooks';
import type { RootStackParamList } from '@navigation/types';
import { useStartConversation } from './useChatQueries';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const useOpenListingChat = () => {
  const navigation = useNavigation<NavigationProp>();
  const toast = useToast();
  const startConversation = useStartConversation();

  const openChat = async (listingId: string, studentId?: string) => {
    try {
      const conversation = await startConversation.mutateAsync({ listingId, studentId });

      navigation.navigate('ChatRoom', { conversationId: conversation.id });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể mở cuộc trò chuyện');
    }
  };

  return { openChat, isOpening: startConversation.isPending };
};
