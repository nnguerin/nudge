import { Stack } from 'expo-router';
import { Text, View } from 'react-native';

const Help = () => {
  return (
    <View className={styles.container}>
      <Stack.Screen options={{ title: 'Help' }} />
      <Text>Help!</Text>
    </View>
  );
};

const styles = {
  container: 'flex-1',
};

export default Help;
