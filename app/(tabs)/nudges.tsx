import { CreateNudgeBottomSheet } from '@/components/CreateNudgeBottomSheet';
import NudgeCard from '@/components/NudgeCard';
import { InteractiveButton } from '@/components/ui/InteractiveButton';
import { nudgeKeys, useNudges } from '@/hooks/nudges';
import { useStore } from '@/store/store';
import { colors } from '@/utils/colors';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useQueryClient } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { RefreshControl, ScrollView } from 'react-native-gesture-handler';

export const Nudges = () => {
  const { profile } = useStore();
  const { data: nudges, isLoading: loadingNudges } = useNudges(profile?.id);
  const [showCreate, setShowCreate] = useState(false);
  const queryClient = useQueryClient();

  const handleListRefresh = () => {
    queryClient.invalidateQueries({ queryKey: nudgeKeys.lists() });
  };

  return (
    <View className="flex-1">
      <Stack.Screen options={{ title: 'Nudges' }} />

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={loadingNudges} onRefresh={handleListRefresh} />
        }>
        <View className="m-2 flex flex-col gap-2">
          {nudges?.map((nudge) => (
            <NudgeCard key={nudge.id} nudge={nudge} />
          ))}
        </View>
      </ScrollView>

      <InteractiveButton
        title="Create"
        onPress={() => setShowCreate(true)}
        style={{
          position: 'absolute',
          bottom: 10,
          right: 20,
        }}
        icon={<MaterialCommunityIcons name="plus-circle-outline" size={24} color={colors.white} />}
      />
      <CreateNudgeBottomSheet isOpen={showCreate} onClose={() => setShowCreate(false)} />
    </View>
  );
};

export default Nudges;
