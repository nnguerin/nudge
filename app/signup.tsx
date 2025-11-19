import { useStore } from '@/store/store';
import { useState } from 'react';
import { View, Text, TextInput } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { colors } from '@/utils/colors';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { router, Stack } from 'expo-router';
import { InteractiveButton } from '@/components/ui/InteractiveButton';

const SignUp = () => {
  const { signUp, authIsLoading } = useStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [hidePassword, setHidePassword] = useState(true);

  const handleSignUp = () => {
    signUp(email, password);
  };

  const toggleHidePassword = () => {
    setHidePassword((hide) => !hide);
  };

  return (
    <KeyboardAwareScrollView
      contentContainerClassName="flex-grow"
      keyboardShouldPersistTaps="handled"
      enableOnAndroid={true}
      extraScrollHeight={20}>
      <Stack.Screen options={{ headerShown: false }} />
      <View className={styles.logoContainer}>
        <Text className="m-auto text-slate-600">LOGO IMAGE</Text>
      </View>
      <View className={styles.headerContainer}>
        <Text className={styles.titleText}>Welcome to Nudge</Text>
        <Text className={styles.taglineText}>Sign up to stay connected</Text>
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
            title="Sign Up"
            loading={authIsLoading}
            onPress={handleSignUp}
            icon={<MaterialCommunityIcons name="arrow-right" size={24} color={colors.white} />}
            iconPosition="right"
          />
        </View>

        <View className="my-2 flex-row items-center">
          <View className="m-auto flex-row items-center">
            <Text>Already have an account?</Text>
            <InteractiveButton
              title="Sign in"
              variant="ghost"
              onPress={() => router.navigate('/signin')}
              style={{ paddingHorizontal: 8 }}
            />
          </View>
        </View>

        <View className="my-4 flex-row items-center">
          <View className="h-[1px] flex-1 bg-slate-300" />
          <Text className="mx-4 text-sm text-slate-500">or continue with</Text>
          <View className="h-[1px] flex-1 bg-slate-300" />
        </View>

        <View className="flex flex-col gap-4">
          <InteractiveButton
            title="Continue with Google"
            icon={<MaterialCommunityIcons name="google" size={24} color={colors.black} />}
            variant="secondary"
          />
          <InteractiveButton
            title="Continue with Apple"
            icon={<MaterialCommunityIcons name="apple" size={24} color={colors.black} />}
            variant="secondary"
          />
        </View>
      </View>
    </KeyboardAwareScrollView>
  );
};

export default SignUp;

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
