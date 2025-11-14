import { SupabaseAuthProvider } from '@/providers/auth-provider';
import '../global.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useDerivedState } from '@/hooks/useDerivedState';

const queryClient = new QueryClient();
function RootNavigator() {
  const { isLoggedIn } = useDerivedState();

  return (
    <Stack>
      <Stack.Protected guard={isLoggedIn}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack.Protected>
      <Stack.Protected guard={!isLoggedIn}>
        <Stack.Screen name="signup" options={{ headerShown: false }} />
      </Stack.Protected>
    </Stack>
  );
}

export default function Layout() {
  return (
    <QueryClientProvider client={queryClient}>
      <SupabaseAuthProvider>
        <GestureHandlerRootView>
          <RootNavigator />
        </GestureHandlerRootView>
      </SupabaseAuthProvider>
    </QueryClientProvider>
  );
}
