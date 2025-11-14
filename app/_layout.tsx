import { SupabaseAuthProvider } from '@/providers/auth-provider';
import '../global.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { Stack } from 'expo-router';
import Avatar from '@/components/Avatar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const queryClient = new QueryClient();

export default function Layout() {
  return (
    <QueryClientProvider client={queryClient}>
      <SupabaseAuthProvider>
        <GestureHandlerRootView>
          <Stack screenOptions={{ headerRight: Avatar }} />
        </GestureHandlerRootView>
      </SupabaseAuthProvider>
    </QueryClientProvider>
  );
}
