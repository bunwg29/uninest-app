import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { ChevronLeft, MoreVertical } from 'lucide-react-native';
import { THEME_COLORS, SPACING_TOKENS } from '@theme';
import { Avatar, Typography } from '@ui';
import { formatPresence } from '../services/chatFormatters';
import type { ChatCounterpart } from '../types';

export interface ChatRoomHeaderProps {
  counterpart: ChatCounterpart | null;
  onBack: () => void;
  onPressMenu: () => void;
}

export const ChatRoomHeader = ({ counterpart, onBack, onPressMenu }: ChatRoomHeaderProps) => (
  <View style={styles.container}>
    <TouchableOpacity
      style={styles.backButton}
      onPress={onBack}
      accessibilityLabel="Quay lại"
      hitSlop={8}
    >
      <ChevronLeft size={24} color={THEME_COLORS.TEXT_PRIMARY} />
    </TouchableOpacity>

    <Avatar
      uri={counterpart?.avatarUrl}
      name={counterpart?.fullName}
      size="md"
      isOnline={counterpart?.isOnline}
    />

    <View style={styles.info}>
      <Typography variant="body2" weight="SEMIBOLD" numberOfLines={1}>
        {counterpart?.fullName ?? 'Đang tải…'}
      </Typography>

      {counterpart ? (
        <Typography
          variant="caption"
          weight="MEDIUM"
          color={counterpart.isOnline ? THEME_COLORS.SUCCESS : THEME_COLORS.TEXT_PLACEHOLDER}
        >
          {formatPresence(counterpart.isOnline, counterpart.lastSeenAt)}
        </Typography>
      ) : null}
    </View>

    <TouchableOpacity
      style={styles.menuButton}
      onPress={onPressMenu}
      accessibilityLabel="Tuỳ chọn đoạn chat"
      hitSlop={8}
    >
      <MoreVertical size={20} color={THEME_COLORS.TEXT_PRIMARY} />
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  container: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING_TOKENS.SM + 4,
    backgroundColor: THEME_COLORS.SURFACE,
    gap: SPACING_TOKENS.SM + 2,
  },
  backButton: {
    width: 32,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
  },
  menuButton: {
    width: 36,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
