import { Stack, Link } from 'expo-router';

import { Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { Container } from '@/components/Container';
import { ScreenContent } from '@/components/ScreenContent';
import { useStore } from '@/store/store';

export default function Home() {
  const { session } = useStore();

  const isLoggedIn = Object.hasOwn(session ?? {}, 'access_token');

  return (
    <View className={styles.container}>
      <Stack.Screen options={{ title: 'Home' }} />
      <Text>Is logged in: {String(isLoggedIn)}</Text>
      <Container>
        <ScreenContent path="app/index.tsx" title="Home" />
        <Link href={{ pathname: '/details', params: { name: 'Dan' } }} asChild>
          <Button title="Show Details" />
        </Link>
      </Container>
    </View>
  );
}

const styles = {
  container: 'flex flex-1 bg-white',
};
