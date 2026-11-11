import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useToast } from '@hooks';
import type { RootStackParamList } from '@navigation/types';
import type { StartConversationParams } from '../types';
import { useStartConversation } from './useChatQueries';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const useOpenListingChat = () => {
  const navigation = useNavigation<NavigationProp>();
  const toast = useToast();
  const startConversation = useStartConversation();

  const open = async (params: StartConversationParams) => {
    try {
      const conversation = await startConversation.mutateAsync(params);

      navigation.navigate('ChatRoom', {
        conversationId: conversation.id,
        listingId: params.listingId,
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể mở cuộc trò chuyện');
    }
  };

  const openChat = (listingId: string, studentId?: string) => open({ listingId, studentId });

  const openLandlordChat = (landlordId: string) => open({ landlordId });

  return { openChat, openLandlordChat, isOpening: startConversation.isPending };
};
