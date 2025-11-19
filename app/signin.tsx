import { useStore } from '@/store/store';
import { useState } from 'react';
import { View, Text, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { colors } from '@/utils/colors';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Stack } from 'expo-router';
import { InteractiveButton } from '@/components/ui/InteractiveButton';

const SignIn = () => {
  const { signIn, authIsLoading } = useStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [hidePassword, setHidePassword] = useState(true);

  const handleSignIn = () => {
    signIn(email, password);
  };

  const toggleHidePassword = () => {
    setHidePassword((hide) => !hide);
  };

  return (
    <SafeAreaView className="flex-1">
      <Stack.Screen options={{ title: 'Sign In' }} />
      <KeyboardAwareScrollView
        contentContainerClassName="flex-grow"
        keyboardShouldPersistTaps="handled"
        enableOnAndroid={true}
        extraScrollHeight={20}>
        <View className={styles.logoContainer}>
          <Text className="m-auto text-slate-600">LOGO IMAGE</Text>
        </View>
        <View className={styles.bodyContainer}>
          <Text className={styles.inputLabel}>Email</Text>
          <View className={styles.inputContainer}>
            <MaterialIcons name="email" size={24} color={colors.slate[600]} />
            <TextInput
              onChangeText={setEmail}
              value={email}
              placeholder="email@address.com"
              autoCapitalize="none"
              className="flex-1"
            />
          </View>
          <View className="h-2" />
          <Text className={styles.inputLabel}>Password</Text>
          <View className={styles.inputContainer}>
            <MaterialIcons name="lock" size={24} color={colors.slate[600]} />
            <TextInput
              onChangeText={setPassword}
              value={password}
              placeholder="Password"
              autoCapitalize="none"
              secureTextEntry={hidePassword}
              className="flex-1"
            />
            <MaterialCommunityIcons
              name={hidePassword ? 'eye' : 'eye-off'}
              size={24}
              color={colors.slate[600]}
              className="ml-auto"
              onPress={toggleHidePassword}
            />
          </View>

          <View className="pt-4">
            <InteractiveButton
              title="Sign In"
              onPress={handleSignIn}
              loading={authIsLoading}
              icon={<MaterialCommunityIcons name="arrow-right" size={24} color={colors.white} />}
              iconPosition="right"
            />
          </View>

          {__DEV__ && (
            <View className="pt-4">
              <InteractiveButton
                title="Sign In as Nima"
                loading={authIsLoading}
                onPress={() => {
                  signIn('nnguerin@gmail.com', 'Panda581');
                }}
                icon={<MaterialCommunityIcons name="arrow-right" size={24} color={colors.white} />}
                iconPosition="right"
              />
            </View>
          )}
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};

export default SignIn;

const styles = {
  container: 'flex-1',
  logoContainer: 'h-1/6 w-full',
  headerContainer: 'h-1/6 flex-col flex items-center justify-center gap-2',
  titleText: 'text-4xl text-blue-300',
  taglineText: 'text-lg text-slate-600',
  bodyContainer: 'flex-1 flex-col flex p-6',
  inputLabel: 'p-2 text-slate-600',
  inputContainer:
    'flex flex-row items-center px-4 py-2 bg-white border border-slate-600 rounded-[16px] text-slate-600',
  authButton: 'my-2 flex flex-row items-center justify-center rounded-[16px]',
};
