import type { ReactNode } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BORDER_RADIUS_TOKENS, OVERLAY_COLORS, SPACING_TOKENS, THEME_COLORS } from '@theme';
import { KeyboardAvoidingContainer, Typography } from '@ui';

const SHEET_RADIUS = 24;

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
      <KeyboardAvoidingContainer style={styles.root}>
        <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Đóng" />

        <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, SPACING_TOKENS.MD) }]}>
          <View style={styles.handle} />

          {title ? (
            <Typography variant="h3" weight="SEMIBOLD" style={styles.title}>
              {title}
            </Typography>
          ) : null}

          {description ? (
            <Typography
              variant="caption"
              weight="MEDIUM"
              colorKey="TEXT_PLACEHOLDER"
              style={styles.description}
            >
              {description}
            </Typography>
          ) : null}

          {children}
        </View>
      </KeyboardAvoidingContainer>
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
    backgroundColor: OVERLAY_COLORS.MODAL_BACKDROP,
  },
  sheet: {
    backgroundColor: THEME_COLORS.SURFACE,
    borderTopLeftRadius: SHEET_RADIUS,
    borderTopRightRadius: SHEET_RADIUS,
    paddingTop: SPACING_TOKENS.SM + 2,
    maxHeight: '90%',
    shadowColor: OVERLAY_COLORS.SHADOW,
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.16,
    shadowRadius: 10,
    elevation: 16,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
    backgroundColor: OVERLAY_COLORS.FIELD_BORDER,
    marginBottom: SPACING_TOKENS.MD - 2,
  },
  title: {
    paddingHorizontal: SPACING_TOKENS.MD,
  },
  description: {
    paddingHorizontal: SPACING_TOKENS.MD,
    marginTop: SPACING_TOKENS.XS,
    marginBottom: SPACING_TOKENS.SM + 6,
    letterSpacing: 0.2,
  },
});
