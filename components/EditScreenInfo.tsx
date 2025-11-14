import { useStore } from '@/store/store';
import { Text, View } from 'react-native';
import { Button } from './Button';

export const EditScreenInfo = ({ path }: { path: string }) => {
  const { bears, signIn, signOut } = useStore();
  const title = 'Open up the code for this screen:';
  const description =
    'Change any of the text, save the file, and your app will automatically update.';

  const handleSignIn = () => {
    signIn('nnguerin@gmail.com', 'Panda581');
  };

  return (
    <View>
      <View className={styles.getStartedContainer}>
        <Text className={styles.getStartedText}>{title}</Text>
        <View className={styles.codeHighlightContainer + styles.homeScreenFilename}>
          <Text>{path}</Text>
        </View>
        <Text className={styles.getStartedText}>{description}</Text>
        <Text className={styles.getStartedText}>Bears: {bears}</Text>
        <Button title="Sign In" onPress={handleSignIn} />
        <Button title="Sign Out" onPress={signOut} />
      </View>
    </View>
  );
};

const styles = {
  codeHighlightContainer: `rounded-md px-1`,
  getStartedContainer: `items-center mx-12`,
  getStartedText: `text-lg leading-6 text-center`,
  helpContainer: `items-center mx-5 mt-4`,
  helpLink: `py-4`,
  helpLinkText: `text-center`,
  homeScreenFilename: `my-2`,
};
