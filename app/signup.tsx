import { useStore } from '@/store/store';
import { useState } from 'react';
import { Pressable, View, Text, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { colors } from '@/utils/colors';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { cn } from '@/utils/cn';
import { Link } from 'expo-router';

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

        <View className="py-4" />

        <Pressable
          disabled={authIsLoading}
          onPress={handleSignUp}
          className={cn(styles.authButton, 'bg-blue-300')}>
          <Text className="p-4 font-bold text-white">
            {authIsLoading ? 'Signing Up...' : 'Sign Up'}
          </Text>
          <MaterialCommunityIcons name="arrow-right" size={24} color={colors.white} />
        </Pressable>

        <View className="my-4 flex-row items-center">
          <View className="m-auto flex-row items-center gap-2">
            <Text className="mx-auto text-sm text-slate-500">Already have an account?</Text>
            <Pressable>
              <Link href={'/signin'}>
                <Text className="font-bold text-blue-500">Sign In</Text>
              </Link>
            </Pressable>
          </View>
        </View>

        <View className="my-4 flex-row items-center">
          <View className="h-[1px] flex-1 bg-slate-300" />
          <Text className="mx-4 text-sm text-slate-500">or continue with</Text>
          <View className="h-[1px] flex-1 bg-slate-300" />
        </View>

        <Pressable
          disabled={true}
          className={cn(styles.authButton, 'border-[1px] border-slate-400 bg-white')}>
          <MaterialCommunityIcons name="google" size={24} color={colors.blue[300]} />
          <Text className="p-4 font-bold text-slate-950">Continue with Google</Text>
          <MaterialCommunityIcons name="arrow-right" size={24} color={colors.white} />
        </Pressable>

        <Pressable
          disabled={true}
          className={cn(styles.authButton, 'border-[1px] border-slate-400 bg-white')}>
          <MaterialCommunityIcons name="apple" size={24} color={colors.blue[300]} />
          <Text className="p-4 font-bold text-slate-950">Continue with Apple</Text>
          <MaterialCommunityIcons name="arrow-right" size={24} color={colors.white} />
        </Pressable>
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
