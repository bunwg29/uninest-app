import { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { THEME_COLORS } from '@theme';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Unhandled UI Exception caught by ErrorBoundary:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <View style={styles.container}>
          <Text style={styles.title}>Đã xảy ra sự cố</Text>
          <Text style={styles.message}>
            {this.state.error?.message || 'Ứng dụng gặp lỗi ngoài dự kiến. Vui lòng thử lại.'}
          </Text>
          <TouchableOpacity style={styles.button} onPress={this.handleReset}>
            <Text style={styles.buttonText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: THEME_COLORS.BACKGROUND,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: THEME_COLORS.TEXT_PRIMARY,
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    color: THEME_COLORS.TEXT_MUTED,
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    backgroundColor: THEME_COLORS.PRIMARY,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  buttonText: {
    color: THEME_COLORS.SURFACE,
    fontWeight: '600',
  },
});
