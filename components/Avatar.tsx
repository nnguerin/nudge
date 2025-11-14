import { useDerivedState } from '@/hooks/useDerivedState';
import { Text } from 'react-native';
import { useStore } from '@/store/store';
import SignInButton from './SignInButton';

const Avatar = () => {
  const { session } = useStore();
  const { isLoggedIn } = useDerivedState();

  if (!isLoggedIn) {
    return <SignInButton />;
  }

  return <Text>{session?.access_token}</Text>;
};

export default Avatar;
