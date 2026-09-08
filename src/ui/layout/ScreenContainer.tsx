import type { ReactNode, ReactElement } from 'react';
import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  ViewStyle,
  StyleProp,
  RefreshControlProps,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { THEME_COLORS, SPACING_TOKENS } from '@theme';

export type ScreenPadding = 'none' | 'sm' | 'md' | 'lg';

export interface ScreenContainerProps {
  children: ReactNode;
  scrollable?: boolean;
  keyboardAvoiding?: boolean;
  padding?: ScreenPadding;
  refreshControl?: ReactElement<RefreshControlProps>;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  applyTopInset?: boolean;
  applyBottomInset?: boolean;
}

export const ScreenContainer = ({
  children,
  scrollable = false,
  keyboardAvoiding = true,
  padding = 'none',
  refreshControl,
  style,
  contentContainerStyle,
  applyTopInset = true,
  applyBottomInset = true,
}: ScreenContainerProps) => {
  const insets = useSafeAreaInsets();

  const safePaddingStyle: ViewStyle = {
    paddingTop: applyTopInset ? insets.top : 0,
    paddingBottom: applyBottomInset ? insets.bottom : 0,
  };

  const content = scrollable ? (
    <ScrollView
      style={styles.flexOne}
      contentContainerStyle={[PADDING_STYLES[padding], contentContainerStyle]}
      showsVerticalScrollIndicator={false}
      refreshControl={refreshControl}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.flexOne, PADDING_STYLES[padding], contentContainerStyle]}>{children}</View>
  );

  return (
    <View style={[styles.container, safePaddingStyle, style]}>
      {keyboardAvoiding ? (
        <KeyboardAvoidingView
          style={styles.flexOne}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          {content}
        </KeyboardAvoidingView>
      ) : (
        content
      )}
    </View>
  );
};

const PADDING_STYLES = StyleSheet.create({
  none: {
    padding: 0,
  },
  sm: {
    padding: SPACING_TOKENS.SM,
  },
  md: {
    padding: SPACING_TOKENS.MD,
  },
  lg: {
    padding: SPACING_TOKENS.LG,
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME_COLORS.BACKGROUND,
  },
  flexOne: {
    flex: 1,
  },
});
