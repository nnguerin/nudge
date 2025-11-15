import { useStore } from '@/store/store';
import { Stack } from 'expo-router';
import { Text, View } from 'react-native';

const Profile = () => {
  const { profile } = useStore();

  return (
    <View className={styles.container}>
      <Stack.Screen options={{ title: 'Profile' }} />
      <Text>{JSON.stringify(profile, null, 2)}</Text>
    </View>
  );
};

const styles = {
  container: 'flex-1',
};

export default Profile;
