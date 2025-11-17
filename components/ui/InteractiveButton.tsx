import React, { useRef } from 'react';
import {
  Pressable,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
  View,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
  interpolate,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'small' | 'medium' | 'large';

interface InteractiveButtonProps {
  onPress?: () => void | Promise<void>;
  title?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  hapticEnabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

const springConfig = {
  damping: 15,
  stiffness: 150,
  mass: 0.5,
};

export const InteractiveButton: React.FC<InteractiveButtonProps> = ({
  onPress,
  title,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  hapticEnabled = true,
  style,
  textStyle,
  icon,
  iconPosition = 'left',
}) => {
  const scale = useSharedValue(1);
  const shimmer = useSharedValue(0);
  const isProcessing = useRef(false);

  const handlePressIn = () => {
    scale.value = withSpring(0.95, springConfig);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, springConfig);
  };

  const triggerSuccessAnimation = () => {
    // Success pulse animation
    scale.value = withSequence(
      withSpring(1.05, { damping: 10, stiffness: 200 }),
      withSpring(1, springConfig)
    );

    // Shimmer effect
    shimmer.value = withSequence(
      withSpring(1, { damping: 20, stiffness: 300 }),
      withSpring(0, { damping: 20, stiffness: 300 })
    );

    if (hapticEnabled) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const handlePress = async () => {
    if (disabled || loading || isProcessing.current) return;

    try {
      isProcessing.current = true;
      const result = onPress?.();

      // If onPress returns a promise, wait for it
      if (result instanceof Promise) {
        await result;
        triggerSuccessAnimation();
      } else {
        triggerSuccessAnimation();
      }
    } catch (error) {
      // Error haptic
      if (hapticEnabled) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      throw error;
    } finally {
      isProcessing.current = false;
    }
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: disabled ? 0.5 : 1,
    };
  });

  const shimmerStyle = useAnimatedStyle(() => {
    const shimmerOpacity = interpolate(shimmer.value, [0, 0.5, 1], [0, 0.3, 0]);

    return {
      opacity: shimmerOpacity,
    };
  });

  const containerStyle = [styles.base, styles[variant], styles[size], style];

  const textStyles = [styles.text, styles[`${variant}Text`], styles[`${size}Text`], textStyle];

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      style={[containerStyle, animatedStyle]}>
      {/* Shimmer overlay for success animation */}
      <Animated.View style={[styles.shimmerOverlay, shimmerStyle]} />

      <View style={styles.buttonContent}>
        {loading ? (
          <ActivityIndicator color={variant === 'primary' ? '#FFFFFF' : '#007AFF'} size="small" />
        ) : (
          <>
            {icon && iconPosition === 'left' && <View style={styles.iconLeft}>{icon}</View>}
            <Text style={textStyles}>{title}</Text>
            {icon && iconPosition === 'right' && <View style={styles.iconRight}>{icon}</View>}
          </>
        )}
      </View>
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  // Variants
  primary: {
    backgroundColor: '#007AFF',
  },
  secondary: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#007AFF',
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  danger: {
    backgroundColor: '#FF3B30',
  },
  // Sizes
  small: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 36,
  },
  medium: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    minHeight: 48,
  },
  large: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    minHeight: 56,
  },
  // Text styles
  text: {
    fontWeight: '600',
  },
  primaryText: {
    color: '#FFFFFF',
  },
  secondaryText: {
    color: '#000000',
  },
  ghostText: {
    color: '#007AFF',
  },
  dangerText: {
    color: '#FFFFFF',
  },
  smallText: {
    fontSize: 14,
  },
  mediumText: {
    fontSize: 16,
  },
  largeText: {
    fontSize: 18,
  },
  // Shimmer overlay
  shimmerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  // Icon positioning
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
  buttonContent: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
