import { Stack } from 'expo-router';
import { Text, View } from 'react-native';

export const Settings = () => {
  return (
    <View>
      <Stack.Screen options={{ title: 'Settings' }} />
      <Text>Settings</Text>
    </View>
  );
};

export default Settings;
