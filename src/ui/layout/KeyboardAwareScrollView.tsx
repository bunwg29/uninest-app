import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef } from 'react';
import {
  Dimensions,
  Keyboard,
  ScrollView,
  TextInput,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  type ScrollViewInstance,
  type ScrollViewProps,
} from 'react-native';
import { useKeyboardHeight } from '@hooks/useKeyboardHeight';

const INPUT_BOTTOM_MARGIN = 28;
const FOCUS_CHECK_DELAY_MS = 120;
const KEYBOARD_CHECK_DELAY_MS = 60;

export interface KeyboardAwareScrollViewProps extends ScrollViewProps {
  shouldPadForKeyboard?: boolean;
}

export const KeyboardAwareScrollView = forwardRef<ScrollViewInstance, KeyboardAwareScrollViewProps>(
  (
    {
      shouldPadForKeyboard = false,
      contentContainerStyle,
      onScroll,
      onTouchEndCapture,
      children,
      ...rest
    },
    forwardedRef
  ) => {
    const scrollRef = useRef<ScrollViewInstance>(null);
    const offsetY = useRef(0);
    const keyboardTop = useRef(Dimensions.get('window').height);
    const keyboardHeight = useKeyboardHeight();

    useImperativeHandle(forwardedRef, () => scrollRef.current as ScrollViewInstance);

    const scrollFocusedInputIntoView = useCallback(() => {
      const input = TextInput.State.currentlyFocusedInput();

      if (!input || !scrollRef.current) return;

      input.measureInWindow((_x, y, _width, height) => {
        const overlap = y + height + INPUT_BOTTOM_MARGIN - keyboardTop.current;

        if (overlap > 0) {
          scrollRef.current?.scrollTo({ y: offsetY.current + overlap, animated: true });
        }
      });
    }, []);

    useEffect(() => {
      const showSubscription = Keyboard.addListener('keyboardDidShow', (event) => {
        keyboardTop.current = event.endCoordinates.screenY;
        setTimeout(scrollFocusedInputIntoView, KEYBOARD_CHECK_DELAY_MS);
      });
      const changeSubscription = Keyboard.addListener('keyboardDidChangeFrame', (event) => {
        keyboardTop.current = event.endCoordinates.screenY;
      });
      const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
        keyboardTop.current = Dimensions.get('window').height;
      });

      return () => {
        showSubscription.remove();
        changeSubscription.remove();
        hideSubscription.remove();
      };
    }, [scrollFocusedInputIntoView]);

    const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      offsetY.current = event.nativeEvent.contentOffset.y;
      onScroll?.(event);
    };

    return (
      <ScrollView
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        scrollEventThrottle={16}
        {...rest}
        ref={scrollRef}
        onScroll={handleScroll}
        onTouchEndCapture={(event) => {
          onTouchEndCapture?.(event);
          setTimeout(scrollFocusedInputIntoView, FOCUS_CHECK_DELAY_MS);
        }}
        contentContainerStyle={[
          contentContainerStyle,
          shouldPadForKeyboard && keyboardHeight > 0 ? { paddingBottom: keyboardHeight } : null,
        ]}
      >
        {children}
      </ScrollView>
    );
  }
);

KeyboardAwareScrollView.displayName = 'KeyboardAwareScrollView';
