import type { ReactNode } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BORDER_RADIUS_TOKENS, SPACING_TOKENS, THEME_COLORS } from '@theme';
import { Typography } from '@ui';

export interface ForumBottomSheetProps {
  isVisible: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: ReactNode;
}

export const ForumBottomSheet = ({
  isVisible,
  onClose,
  title,
  description,
  children,
}: ForumBottomSheetProps) => {
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={isVisible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.root}>
        <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Đóng" />

        <View style={[styles.sheet, { paddingBottom: insets.bottom + SPACING_TOKENS.MD }]}>
          <View style={styles.handle} />

          {title ? (
            <Typography variant="h3" weight="BOLD" style={styles.title}>
              {title}
            </Typography>
          ) : null}

          {description ? (
            <Typography variant="caption" colorKey="TEXT_MUTED" style={styles.description}>
              {description}
            </Typography>
          ) : null}

          {children}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(23, 27, 34, 0.45)',
  },
  sheet: {
    backgroundColor: THEME_COLORS.SURFACE,
    borderTopLeftRadius: BORDER_RADIUS_TOKENS.XL,
    borderTopRightRadius: BORDER_RADIUS_TOKENS.XL,
    paddingHorizontal: SPACING_TOKENS.MD,
    paddingTop: SPACING_TOKENS.SM,
    maxHeight: '90%',
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
    backgroundColor: THEME_COLORS.BORDER,
    marginBottom: SPACING_TOKENS.MD,
  },
  title: {
    marginBottom: SPACING_TOKENS.XS,
  },
  description: {
    marginBottom: SPACING_TOKENS.MD,
  },
});
