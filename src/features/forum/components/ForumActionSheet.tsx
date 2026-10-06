import type { ReactNode } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { SPACING_TOKENS, THEME_COLORS } from '@theme';
import { Button, Typography } from '@ui';
import { ForumBottomSheet } from './ForumBottomSheet';

const SHEET_TRANSITION_DELAY_MS = 350;

export interface ForumActionItem {
  key: string;
  label: string;
  icon: ReactNode;
  isDestructive?: boolean;
  onPress: () => void;
}

export interface ForumActionSheetProps {
  isVisible: boolean;
  actions: ForumActionItem[];
  onClose: () => void;
}

export const ForumActionSheet = ({ isVisible, actions, onClose }: ForumActionSheetProps) => (
  <ForumBottomSheet isVisible={isVisible} onClose={onClose}>
    <View style={styles.list}>
      {actions.map((action) => (
        <TouchableOpacity
          key={action.key}
          style={styles.item}
          onPress={() => {
            onClose();
            // iOS không mở được Modal mới khi Modal hiện tại chưa đóng xong animation.
            setTimeout(action.onPress, SHEET_TRANSITION_DELAY_MS);
          }}
        >
          {action.icon}
          <Typography
            variant="body1"
            colorKey={action.isDestructive ? 'ERROR' : 'TEXT_PRIMARY'}
            style={styles.label}
          >
            {action.label}
          </Typography>
        </TouchableOpacity>
      ))}
    </View>

    <Button title="Huỷ" variant="outline" size="lg" fullWidth onPress={onClose} />
  </ForumBottomSheet>
);

const styles = StyleSheet.create({
  list: {
    marginBottom: SPACING_TOKENS.MD,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING_TOKENS.SM + 4,
    paddingVertical: SPACING_TOKENS.MD,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: THEME_COLORS.DIVIDER,
  },
  label: {
    flex: 1,
  },
});
