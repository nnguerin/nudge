import { Stack } from 'expo-router';
import { Text, View } from 'react-native';

export const Schedule = () => {
  return (
    <View>
      <Stack.Screen options={{ title: 'Schedule' }} />
      <Text>Schedule</Text>
    </View>
  );
};

export default Schedule;
