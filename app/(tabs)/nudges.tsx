import { CreateNudgeBottomSheet } from '@/components/CreateNudgeBottomSheet';
import FilterPill from '@/components/FilterPill';
import NudgeCard from '@/components/NudgeCard';
import { InteractiveButton } from '@/components/ui/InteractiveButton';
import { nudgeKeys, useNudges } from '@/hooks/nudges';
import { useStore } from '@/store/store';
import { colors } from '@/utils/colors';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useQueryClient } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { useMemo, useState } from 'react';
import { View } from 'react-native';
import { RefreshControl, ScrollView } from 'react-native-gesture-handler';

type FilterType = 'all' | 'trending' | 'mine';

export const Nudges = () => {
  const { profile } = useStore();
  const { data: nudges, isLoading: loadingNudges } = useNudges(profile?.id);
  const [showCreate, setShowCreate] = useState(false);
  const [filter, setFilter] = useState<FilterType>('all');
  const queryClient = useQueryClient();

  const handleNudgesRefresh = () => {
    queryClient.invalidateQueries({ queryKey: nudgeKeys.lists() });
  };

  const filteredNudges = useMemo(() => {
    if (!nudges) return [];

    if (filter === 'all') {
      return nudges;
    }

    if (filter === 'mine') {
      return nudges.filter((nudge) => nudge.created_by === profile?.id);
    }

    // Trending: sort by upvotes descending
    return [...nudges].sort((a, b) => (b.upvotes_count || 0) - (a.upvotes_count || 0));
  }, [nudges, filter, profile?.id]);

  return (
    <View className="flex-1">
      <Stack.Screen options={{ title: 'Nudges' }} />

      {/* Filter Header */}
      <View className="flex-row gap-2 border-b border-gray-200 px-4 py-3">
        <FilterPill onPress={() => setFilter('all')} title="All" isActive={filter === 'all'} />
        <FilterPill
          onPress={() => setFilter('trending')}
          title="Trending"
          isActive={filter === 'trending'}
        />
        <FilterPill
          onPress={() => setFilter('mine')}
          title="Created by me"
          isActive={filter === 'mine'}
        />
      </View>

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={loadingNudges} onRefresh={handleNudgesRefresh} />
        }>
        <View className="m-2 flex flex-col gap-2">
          {filteredNudges.map((nudge) => (
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
