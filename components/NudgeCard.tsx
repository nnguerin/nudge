import { NudgeWithDetails } from '@/api/types';
import { Text, View } from 'react-native';
import { InteractiveButton } from './ui/InteractiveButton';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { colors } from '@/utils/colors';
import { useRemoveUpvote, useUpvoteNudge } from '@/hooks/nudges';

interface NudgeCardProps {
  nudge: NudgeWithDetails;
}

const NudgeCard = ({ nudge }: NudgeCardProps) => {
  const upvoteNudgeMutation = useUpvoteNudge();
  const removeUpvoteNudgeMutation = useRemoveUpvote();

  const handleUpvote = () => {
    upvoteNudgeMutation.mutate(nudge.id);
  };

  const handleRemoveUpvote = () => {
    removeUpvoteNudgeMutation.mutate(nudge.id);
  };

  return (
    <View className="flex flex-col gap-4 rounded-2xl border-2 border-slate-300 bg-white p-4">
      <View>
        <Text>{nudge.text}</Text>
      </View>
      <View className="flex flex-row items-center justify-between">
        <View className="flex flex-row items-center">
          {nudge.user_has_upvoted ? (
            <InteractiveButton
              variant="ghost"
              size="small"
              title={String(nudge.upvotes_count)}
              onPress={handleRemoveUpvote}
              icon={
                <MaterialCommunityIcons name="cards-heart" size={24} color={colors.orange[400]} />
              }
            />
          ) : (
            <InteractiveButton
              variant="ghost"
              size="small"
              title={String(nudge.upvotes_count)}
              onPress={handleUpvote}
              icon={
                <MaterialCommunityIcons
                  name="cards-heart-outline"
                  size={24}
                  color={colors.slate[400]}
                />
              }
            />
          )}
        </View>
        <InteractiveButton variant="ghost" title="Use" />
      </View>
    </View>
  );
};

export default NudgeCard;
