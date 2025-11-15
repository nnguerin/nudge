import Button from '@/components/ui/Button';
import { ButtonMenu, MenuButton } from '@/components/ui/ButtonMenu';
import { useStore } from '@/store/store';
import { colors } from '@/utils/colors';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, Stack } from 'expo-router';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';

export const Settings = () => {
  const { signOut } = useStore();
  return (
    <View>
      <Stack.Screen options={{ title: 'Settings' }} />
      <View>
        <LinearGradient
          colors={[colors.orange[400], colors.orange[200]]}
          dither
          style={styleSheetStyles.premiumContainer}>
          <Pressable
            className="flex flex-row gap-4"
            onPress={() => router.navigate('/settings/premium')}>
            <View>
              <MaterialCommunityIcons
                name="crown-outline"
                size={40}
                color={colors.white}
                style={styleSheetStyles.premiumIcon}
              />
            </View>
            <View className="flex flex-1 flex-col gap-2">
              <Text style={styleSheetStyles.premiumTitleText}>Upgrade to Nudge Plus</Text>
              <Text style={styleSheetStyles.premiumText}>
                Unlock unlimited connections, premium scheduling, and more!
              </Text>
              <View style={styleSheetStyles.premiumButton}>
                <Text style={styleSheetStyles.premiumButtonText}>Learn More</Text>
              </View>
            </View>
          </Pressable>
        </LinearGradient>
      </View>
      <ButtonMenu className="m-4" title="Account">
        <MenuButton
          title="Profile"
          onPress={() => router.navigate('/settings/profile')}
          icon={<MaterialIcons name="person-outline" size={30} color={colors.white} />}
        />
        <MenuButton
          title="Notifications"
          onPress={() => router.navigate('/settings/notifications')}
          icon={<MaterialIcons name="notifications-none" size={30} color={colors.white} />}
        />
      </ButtonMenu>
      <ButtonMenu className="m-4" title="App">
        <MenuButton
          title="Help & FAQ"
          onPress={() => router.navigate('/settings/help')}
          icon={
            <MaterialCommunityIcons
              name="tooltip-question-outline"
              size={30}
              color={colors.white}
            />
          }
        />
        <MenuButton
          title="Request a Feature!"
          icon={<MaterialCommunityIcons name="git" size={24} color={colors.white} />}
          onPress={() => Linking.openURL('https://nudgey.canny.io/feature-requests')}
        />
      </ButtonMenu>
      <View className="p-8">
        <Button onPress={signOut} title="Sign out" />
      </View>
    </View>
  );
};

const styleSheetStyles = StyleSheet.create({
  premiumContainer: {
    borderRadius: 16,
    padding: 20,
    margin: 16,
  },
  premiumIcon: {
    borderRadius: 50,
    backgroundColor: 'rgba(240, 240, 240, 0.5)',
    padding: 8,
  },
  premiumTitleText: {
    fontSize: 22,
    color: colors.white,
  },
  premiumText: {
    fontSize: 16,
    color: colors.white,
  },
  premiumButton: {
    maxWidth: 150,
    backgroundColor: colors.white,
    borderRadius: 25,
    padding: 10,
  },
  premiumButtonText: {
    color: colors.orange[400],
    fontSize: 16,
    margin: 'auto',
  },
});

export default Settings;
