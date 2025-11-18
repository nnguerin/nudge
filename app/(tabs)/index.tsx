import { CreateTargetBottomSheet } from '@/components/CreateTargetBottomSheet';
import { InteractiveButton } from '@/components/ui/InteractiveButton';
import { useNudgeTargets, useDeleteNudgeTarget, targetKeys } from '@/hooks/nudge-targets';
import { useStore } from '@/store/store';
import { colors } from '@/utils/colors';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useQueryClient } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { useState } from 'react';
import { View, Text, ActivityIndicator, Pressable, Alert } from 'react-native';
import { RefreshControl, ScrollView } from 'react-native-gesture-handler';

export default function Home() {
  const { profile } = useStore();
  const { data: targets, isLoading } = useNudgeTargets(profile?.id || '');
  const [showCreate, setShowCreate] = useState(false);
  const deleteTargetMutation = useDeleteNudgeTarget();
  const queryClient = useQueryClient();

  const handleTargetsRefresh = () => {
    queryClient.invalidateQueries({ queryKey: targetKeys.lists() });
  };

  const handleDelete = (id: string, name: string) => {
    Alert.alert('Delete Target', `Are you sure you want to delete "${name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => deleteTargetMutation.mutate(id),
      },
    ]);
  };

  return (
    <View className="flex-1">
      <Stack.Screen options={{ title: 'Home' }} />

      <ScrollView
        className="flex-1"
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={handleTargetsRefresh} />}>
        <View className="p-4">
          <Text className="mb-4 text-xl font-bold">Your Nudge Targets</Text>

          {isLoading && <ActivityIndicator size="large" />}

          {!isLoading && targets?.length === 0 && (
            <Text className="text-gray-500">No nudge targets yet</Text>
          )}

          {targets?.map((target) => (
            <View
              key={target.id}
              className="mb-2 flex-row items-center justify-between rounded-lg border border-gray-200 bg-white p-4">
              <View className="flex-1">
                <Text className="text-lg font-medium">{target.name}</Text>
                <Text className="text-sm text-gray-500">
                  {target.contacts.length} contact{target.contacts.length !== 1 ? 's' : ''}
                </Text>
                {target.contacts.length > 0 && (
                  <Text className="mt-1 text-xs text-gray-400">
                    {target.contacts.map((c) => c.name).join(', ')}
                  </Text>
                )}
              </View>
              <Pressable onPress={() => handleDelete(target.id, target.name)} className="ml-2 p-2">
                <MaterialCommunityIcons name="trash-can-outline" size={20} color="#FF3B30" />
              </Pressable>
            </View>
          ))}
        </View>
      </ScrollView>

      <InteractiveButton
        title="Add Connection"
        onPress={() => setShowCreate(true)}
        style={{
          position: 'absolute',
          bottom: 10,
          right: 20,
        }}
        icon={<MaterialCommunityIcons name="plus-circle-outline" size={24} color={colors.white} />}
      />

      <CreateTargetBottomSheet isOpen={showCreate} onClose={() => setShowCreate(false)} />
    </View>
  );
}
