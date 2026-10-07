import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { MoreVertical } from 'lucide-react-native';
import { THEME_COLORS, SPACING_TOKENS } from '@theme';
import { GradientAvatar, Typography, BackButton } from '@ui';
import { formatPresence } from '../services/chatFormatters';
import type { ChatCounterpart } from '../types';

export interface ChatRoomHeaderProps {
  counterpart: ChatCounterpart | null;
  onBack: () => void;
  onPressMenu: () => void;
}

export const ChatRoomHeader = ({ counterpart, onBack, onPressMenu }: ChatRoomHeaderProps) => (
  <View style={styles.container}>
    <BackButton onPress={onBack} accessibilityLabel="Quay lại" />

    <GradientAvatar
      uri={counterpart?.avatarUrl}
      name={counterpart?.fullName}
      seed={counterpart?.id}
      size={40}
      isOnline={counterpart?.isOnline}
    />

    <View style={styles.info}>
      <Typography variant="body2" weight="SEMIBOLD" numberOfLines={1} style={styles.name}>
        {counterpart?.fullName ?? 'Đang tải…'}
      </Typography>

      {counterpart ? (
        <Typography
          variant="caption"
          weight="MEDIUM"
          color={counterpart.isOnline ? THEME_COLORS.SUCCESS : THEME_COLORS.TEXT_PLACEHOLDER}
          style={styles.presence}
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
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: SPACING_TOKENS.SM + 4,
    paddingRight: SPACING_TOKENS.MD,
    backgroundColor: THEME_COLORS.SURFACE,
    gap: SPACING_TOKENS.SM + 2,
  },
  backButton: {
    width: 40,
    height: 40,
    marginRight: -SPACING_TOKENS.XS,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    gap: SPACING_TOKENS.XXS,
  },
  name: {
    lineHeight: 22,
  },
  presence: {
    letterSpacing: 0.2,
  },
  menuButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
