import {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
  interpolate,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

// Hook for submit button animation
export const useSubmitAnimation = () => {
  const scale = useSharedValue(1);
  const shimmer = useSharedValue(0);

  const triggerSuccessAnimation = () => {
    scale.value = withSequence(
      withSpring(1.05, { damping: 10, stiffness: 200 }),
      withSpring(1, { damping: 15, stiffness: 150 })
    );

    shimmer.value = withSequence(
      withSpring(1, { damping: 20, stiffness: 300 }),
      withSpring(0, { damping: 20, stiffness: 300 })
    );

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const shimmerStyle = useAnimatedStyle(() => ({
    opacity: interpolate(shimmer.value, [0, 0.5, 1], [0, 0.3, 0]),
  }));

  return { triggerSuccessAnimation, buttonAnimatedStyle, shimmerStyle };
};
