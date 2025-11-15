import { Stack } from 'expo-router';
import { Text, View } from 'react-native';

const Notifications = () => {
  return (
    <View className={styles.container}>
      <Stack.Screen options={{ title: 'Manage Notifications' }} />
      <Text>Manage notifications here</Text>
    </View>
  );
};

const styles = {
  container: 'flex-1',
};

export default Notifications;
