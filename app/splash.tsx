import { colors } from '@/utils/colors';
import { ActivityIndicator, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack } from 'expo-router';

export default function Splash() {
  return (
    <LinearGradient
      colors={[colors.blue[300], colors.blue[300], colors.blue[300], colors.green[100]]}
      className={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <View className={styles.logoContainer}>
        <Text>Logo Image!</Text>
      </View>
      <ActivityIndicator size="large" color={colors.orange[200]} />
    </LinearGradient>
  );
}

const styles = {
  container: 'flex flex-1 items-center justify-center ',
  logoContainer: 'h-1/3',
};
