import { View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUIStore } from '@core';
import { SPACING_TOKENS } from '@theme';
import { Toast } from '../molecules/Toast';

export const GlobalToast = () => {
  const insets = useSafeAreaInsets();
  const toast = useUIStore((state) => state.toast);
  const hideToast = useUIStore((state) => state.hideToast);

  if (!toast) {
    return null;
  }

  return (
    <View
      style={[
        styles.overlay,
        {
          top: insets.top > 0 ? insets.top + SPACING_TOKENS.SM : SPACING_TOKENS.MD,
        },
      ]}
      pointerEvents="box-none"
    >
      <Toast
        isVisible={Boolean(toast)}
        message={toast.message}
        title={toast.title}
        type={toast.type}
        durationMs={toast.durationMs ?? 3500}
        onDismiss={hideToast}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    left: SPACING_TOKENS.MD,
    right: SPACING_TOKENS.MD,
    zIndex: 9999,
    elevation: 9999,
  },
});
