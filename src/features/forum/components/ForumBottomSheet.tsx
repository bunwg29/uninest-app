import type { ReactNode } from 'react';
import { StyleSheet } from 'react-native';
import { OVERLAY_COLORS, SPACING_TOKENS } from '@theme';
import { BottomSheet, Typography } from '@ui';

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
  return (
    <BottomSheet
      isVisible={isVisible}
      onClose={onClose}
      backdropColor={OVERLAY_COLORS.MODAL_BACKDROP}
      keyboardAvoiding
      sheetStyle={styles.sheet}
      handleStyle={styles.handle}
    >
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
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  sheet: {
    paddingTop: SPACING_TOKENS.SM + 2,
    maxHeight: '90%',
    shadowColor: OVERLAY_COLORS.SHADOW,
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.16,
    shadowRadius: 10,
    elevation: 16,
  },
  handle: {
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
