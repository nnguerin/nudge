import { useStore } from '@/store/store';
import { Stack } from 'expo-router';
import { Text, View } from 'react-native';

export const Nudges = () => {
  const {} = useStore();
  return (
    <View>
      <Stack.Screen options={{ title: 'Nudges' }} />
      <Text>Nudges</Text>
    </View>
  );
};

export default Nudges;
