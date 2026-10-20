import type { ReactNode } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { BORDER_RADIUS_TOKENS, SPACING_TOKENS, THEME_COLORS, TYPOGRAPHY_TOKENS } from '@theme';
import { Typography } from '@ui';
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
      {actions.map((action, index) => (
        <TouchableOpacity
          key={action.key}
          style={[styles.item, index < actions.length - 1 && styles.itemDivider]}
          onPress={() => {
            onClose();
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

    <TouchableOpacity style={styles.cancelButton} onPress={onClose} activeOpacity={0.8}>
      <Typography variant="body1" weight="SEMIBOLD" colorKey="TEXT_SECONDARY" style={styles.label}>
        Huỷ
      </Typography>
    </TouchableOpacity>
  </ForumBottomSheet>
);

const styles = StyleSheet.create({
  list: {
    marginBottom: SPACING_TOKENS.MD - 2,
  },
  item: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: SPACING_TOKENS.MD + 4,
  },
  itemDivider: {
    borderBottomWidth: 1,
    borderBottomColor: THEME_COLORS.DIVIDER,
  },
  label: {
    fontSize: TYPOGRAPHY_TOKENS.FONT_SIZES.BASE,
    lineHeight: TYPOGRAPHY_TOKENS.LINE_HEIGHTS.BASE,
  },
  cancelButton: {
    height: 52,
    marginHorizontal: SPACING_TOKENS.MD,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BORDER_RADIUS_TOKENS.MD,
    borderWidth: 1,
    borderColor: THEME_COLORS.BORDER,
    backgroundColor: THEME_COLORS.SURFACE,
  },
});
