import type { ReactNode, ReactElement } from 'react';
import {
  View,
  Platform,
  StyleSheet,
  StatusBar,
  ViewStyle,
  StyleProp,
  RefreshControlProps,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { THEME_COLORS, SPACING_TOKENS } from '@theme';
import { RESPONSIVE_MAX_CONTENT_WIDTH } from '@hooks';
import { KeyboardAvoidingContainer } from './KeyboardAvoidingContainer';
import { KeyboardAwareScrollView } from './KeyboardAwareScrollView';

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
  maxContentWidth?: number | null;
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
  maxContentWidth = RESPONSIVE_MAX_CONTENT_WIDTH,
}: ScreenContainerProps) => {
  const insets = useSafeAreaInsets();
  const flatStyle = StyleSheet.flatten(style);
  const extraPaddingTop = Number(flatStyle?.paddingTop ?? flatStyle?.paddingVertical ?? 0);
  const extraPaddingBottom = Number(flatStyle?.paddingBottom ?? flatStyle?.paddingVertical ?? 0);

  const topInset = applyTopInset
    ? Math.max(insets.top, Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) : 0)
    : 0;

  const safePaddingStyle: ViewStyle = {
    paddingTop: topInset + extraPaddingTop,
    paddingBottom: (applyBottomInset ? insets.bottom : 0) + extraPaddingBottom,
  };
  const responsiveContentStyle: ViewStyle = {
    width: '100%',
    maxWidth: maxContentWidth ?? undefined,
    alignSelf: 'center',
  };

  const content = scrollable ? (
    <KeyboardAwareScrollView
      style={styles.flexOne}
      contentContainerStyle={[
        responsiveContentStyle,
        PADDING_STYLES[padding],
        contentContainerStyle,
      ]}
      showsVerticalScrollIndicator={false}
      refreshControl={refreshControl}
    >
      {children}
    </KeyboardAwareScrollView>
  ) : (
    <View
      style={[
        styles.flexOne,
        responsiveContentStyle,
        PADDING_STYLES[padding],
        contentContainerStyle,
      ]}
    >
      {children}
    </View>
  );

  return (
    <View style={[styles.container, style, safePaddingStyle]}>
      {keyboardAvoiding ? (
        <KeyboardAvoidingContainer style={styles.flexOne}>{content}</KeyboardAvoidingContainer>
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
