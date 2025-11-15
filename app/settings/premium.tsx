import { Stack } from 'expo-router';
import { Text, View } from 'react-native';

const Premium = () => {
  return (
    <View className={styles.container}>
      <Stack.Screen options={{ title: 'Nudge Premium' }} />
      <Text>Nudge Premium features + stripe link</Text>
    </View>
  );
};

const styles = {
  container: 'flex-1',
};

export default Premium;
