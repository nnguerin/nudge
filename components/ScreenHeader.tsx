import { PropsWithChildren } from 'react';
import { Text, View } from 'react-native';
import Avatar from './Avatar';

interface ScreenHeaderProps {
  title: string;
}

const ScreenHeader = ({ title }: PropsWithChildren<ScreenHeaderProps>) => {
  return (
    <View className={styles.container}>
      <Text className={styles.title}>{title}</Text>
      <Avatar />
    </View>
  );
};

export default ScreenHeader;

const styles = {
  container: 'flex flex-row justify-between',
  title: 'text-2xl',
};
