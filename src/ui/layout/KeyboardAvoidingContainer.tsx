import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Keyboard, Platform, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

export interface KeyboardAvoidingContainerProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}

export const KeyboardAvoidingContainer = ({ children, style }: KeyboardAvoidingContainerProps) => {
  const containerRef = useRef<View>(null);
  const [overlap, setOverlap] = useState(0);

  useEffect(() => {
    if (Platform.OS !== 'ios') {
      return undefined;
    }

    const changeSubscription = Keyboard.addListener('keyboardWillChangeFrame', (event) => {
      containerRef.current?.measureInWindow((_x, y, _width, height) => {
        setOverlap(Math.max(0, y + height - event.endCoordinates.screenY));
      });
    });
    const hideSubscription = Keyboard.addListener('keyboardWillHide', () => setOverlap(0));

    return () => {
      changeSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const flatStyle = StyleSheet.flatten(style);
  const basePadding = Number(flatStyle?.paddingBottom ?? flatStyle?.paddingVertical ?? 0);

  return (
    <View
      ref={containerRef}
      style={[style, overlap > 0 ? { paddingBottom: basePadding + overlap } : null]}
    >
      {children}
    </View>
  );
};
