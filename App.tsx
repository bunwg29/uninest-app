import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClientProvider } from '@tanstack/react-query';
import '@i18n';
import { QUERY_CLIENT } from '@core';
import { ErrorBoundary } from '@ui';
import { RootNavigator } from '@navigation';

export default function App() {
  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <QueryClientProvider client={QUERY_CLIENT}>
          <RootNavigator />
          <StatusBar style="auto" />
        </QueryClientProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}
