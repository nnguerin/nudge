import { Stack } from 'expo-router';

import { View, Text } from 'react-native';

export default function Home() {
  return (
    <View>
      <Stack.Screen options={{ title: 'Home' }} />
      <Text>Home screen</Text>
    </View>
  );
}
