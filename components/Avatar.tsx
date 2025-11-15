import { Text } from 'react-native';
import { useStore } from '@/store/store';

const Avatar = () => {
  const { session } = useStore();

  return <Text>{session?.access_token}</Text>;
};

export default Avatar;
