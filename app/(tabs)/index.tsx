import { Stack, Link } from 'expo-router';

import { Button } from '@/components/Button';
import { Container } from '@/components/Container';
import { ScreenContent } from '@/components/ScreenContent';
import { useStore } from '@/store/store';
import { View, Text } from 'react-native';

export default function Home() {
  const { session, signIn, signOut } = useStore();

  const handleSignIn = () => {
    signIn('nnguerin@gmail.com', 'Panda581');
  };

  const isLoggedIn = Object.hasOwn(session ?? {}, 'access_token');

  return (
    <View className={styles.container}>
      <Stack.Screen options={{ title: 'Home' }} />
      <Container>
        <Text>Is logged in: {String(isLoggedIn)}</Text>
        <ScreenContent path="app/index.tsx" title="Home" />
        <Link href={{ pathname: '/details', params: { name: 'Dan' } }} asChild>
          <Button title="Show Details" />
        </Link>
        <Button title="Sign In" onPress={handleSignIn} />
        <Button title="Sign Out" onPress={signOut} />
      </Container>
    </View>
  );
}

const styles = {
  container: 'flex flex-1 bg-white',
};
