import type { ReactNode } from 'react';
import { Modal, Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BORDER_RADIUS_TOKENS, OVERLAY_COLORS, SPACING_TOKENS, THEME_COLORS } from '@theme';
import { KeyboardAvoidingContainer } from '../layout/KeyboardAvoidingContainer';

export const BOTTOM_SHEET_RADIUS = 24;

export interface BottomSheetProps {
  isVisible: boolean;
  onClose: () => void;
  children: ReactNode;
  backdropColor?: string;
  backdropAccessibilityLabel?: string;
  keyboardAvoiding?: boolean;
  showHandle?: boolean;
  applyBottomInset?: boolean;
  sheetStyle?: StyleProp<ViewStyle>;
  handleStyle?: StyleProp<ViewStyle>;
}

export const BottomSheet = ({
  isVisible,
  onClose,
  children,
  backdropColor = OVERLAY_COLORS.SHEET_BACKDROP,
  backdropAccessibilityLabel = 'Đóng',
  keyboardAvoiding = false,
  showHandle = true,
  applyBottomInset = true,
  sheetStyle,
  handleStyle,
}: BottomSheetProps) => {
  const insets = useSafeAreaInsets();
  const content = (
    <>
      <Pressable
        style={[styles.backdrop, { backgroundColor: backdropColor }]}
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel={backdropAccessibilityLabel}
      />

      <View
        style={[
          styles.sheet,
          applyBottomInset && { paddingBottom: Math.max(insets.bottom, SPACING_TOKENS.MD) },
          sheetStyle,
        ]}
      >
        {showHandle ? <View style={[styles.handle, handleStyle]} /> : null}
        {children}
      </View>
    </>
  );

  return (
    <Modal visible={isVisible} transparent animationType="slide" onRequestClose={onClose}>
      {keyboardAvoiding ? (
        <KeyboardAvoidingContainer style={styles.root}>{content}</KeyboardAvoidingContainer>
      ) : (
        <View style={styles.root}>{content}</View>
      )}
    </Modal>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFill },
  sheet: {
    borderTopLeftRadius: BOTTOM_SHEET_RADIUS,
    borderTopRightRadius: BOTTOM_SHEET_RADIUS,
    backgroundColor: THEME_COLORS.SURFACE,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
    backgroundColor: OVERLAY_COLORS.FIELD_BORDER,
  },
});
