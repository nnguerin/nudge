import { useStore } from '@/store/store';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { useMemo, useRef, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

const SignInButton = () => {
  const { signIn, signUp, authIsLoading } = useStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const loginSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['25%', '50%', '90%'], []);

  const handleSignIn = () => {
    signIn(email, password);
  };

  const handleSignUp = () => {
    signUp(email, password);
  };

  const handleOpenPress = () => loginSheetRef.current?.expand();

  return (
    <GestureHandlerRootView style={{ flex: 0 }}>
      <View>
        <Pressable onPress={handleOpenPress}>
          <Text>Login</Text>
        </Pressable>
      </View>

      <BottomSheet ref={loginSheetRef} index={-1} snapPoints={snapPoints} enablePanDownToClose>
        <BottomSheetView>
          <View className="flex-col gap-4 p-4">
            <View>
              <Text className="text-foreground mb-2 text-sm font-medium">Email</Text>
              <TextInput
                onChangeText={setEmail}
                value={email}
                placeholder="email@address.com"
                autoCapitalize="none"
                keyboardType="email-address"
                className="border-input bg-background text-foreground rounded-lg border px-4 py-3"
              />
            </View>

            <View>
              <Text className="text-foreground mb-2 text-sm font-medium">Password</Text>
              <TextInput
                onChangeText={setPassword}
                value={password}
                secureTextEntry={true}
                placeholder="Password"
                autoCapitalize="none"
                className="border-input bg-background text-foreground rounded-lg border px-4 py-3"
              />
            </View>

            <Pressable
              disabled={authIsLoading}
              onPress={handleSignIn}
              className={`bg-primary mt-2 rounded-lg px-6 py-3 active:opacity-80 ${
                authIsLoading ? 'opacity-50' : ''
              }`}>
              <Text className="text-primary-foreground text-center font-semibold">
                {authIsLoading ? 'Signing In...' : 'Sign In'}
              </Text>
            </Pressable>

            <Pressable
              disabled={authIsLoading}
              onPress={handleSignUp}
              className={`border-border bg-background active:bg-accent rounded-lg border px-6 py-3 ${
                authIsLoading ? 'opacity-50' : ''
              }`}>
              <Text className="text-foreground text-center font-semibold">
                {authIsLoading ? 'Signing Up...' : 'Sign Up'}
              </Text>
            </Pressable>
          </View>
        </BottomSheetView>
      </BottomSheet>
    </GestureHandlerRootView>
  );
};

export default SignInButton;
