import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import BottomSheet, { BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
  interpolate,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useCreateNudge } from '@/hooks/nudges';

interface CreateNudgeBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const CreateNudgeBottomSheet: React.FC<CreateNudgeBottomSheetProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['50%', '75%', '90%'], []);

  const [text, setText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createNudgeMutation = useCreateNudge();

  const scale = useSharedValue(1);
  const shimmer = useSharedValue(0);

  // Open/close the bottom sheet based on isOpen prop
  React.useEffect(() => {
    if (isOpen) {
      bottomSheetRef.current?.expand();
    } else {
      bottomSheetRef.current?.close();
    }
  }, [isOpen]);

  const handleSheetChanges = useCallback(
    (index: number) => {
      if (index === -1) {
        onClose();
        // Reset form when closed
        setText('');
        setError(null);
      }
    },
    [onClose]
  );

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.5} />
    ),
    []
  );

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

  const handleSubmit = async () => {
    if (!text.trim()) {
      setError('Please enter some text');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    setIsSubmitting(true);
    setError(null);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    try {
      console.log('calling mutate');
      createNudgeMutation.mutate({ text });

      // Success!
      triggerSuccessAnimation();

      // Wait a bit for animation
      setTimeout(() => {
        onSuccess?.();
        onClose();
        setText('');
      }, 600);
    } catch (err) {
      console.error('Error creating nudge:', err);
      setError('Failed to create nudge. Please try again.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const buttonAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const shimmerStyle = useAnimatedStyle(() => {
    const shimmerOpacity = interpolate(shimmer.value, [0, 0.5, 1], [0, 0.3, 0]);

    return {
      opacity: shimmerOpacity,
    };
  });

  const isValid = text.trim().length > 0;

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={-1}
      snapPoints={snapPoints}
      onChange={handleSheetChanges}
      backdropComponent={renderBackdrop}
      enablePanDownToClose
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      android_keyboardInputMode="adjustResize">
      <BottomSheetView style={styles.contentContainer}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Create a Nudge</Text>
            <Text style={styles.subtitle}>Connect about something fun</Text>
          </View>

          {/* Text Input */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder="What would you like to say?"
              placeholderTextColor="#999"
              value={text}
              onChangeText={setText}
              multiline
              maxLength={280}
              autoFocus
              textAlignVertical="top"
            />
            <Text style={styles.characterCount}>{text.length}/280</Text>
          </View>

          {/* Error Message */}
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Submit Button */}
          <Animated.View style={buttonAnimatedStyle}>
            <Pressable
              onPress={handleSubmit}
              disabled={!isValid || isSubmitting}
              style={[
                styles.submitButton,
                (!isValid || isSubmitting) && styles.submitButtonDisabled,
              ]}>
              <Animated.View style={[styles.shimmerOverlay, shimmerStyle]} />

              {isSubmitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.submitButtonText}>Create Nudge</Text>
              )}
            </Pressable>
          </Animated.View>

          {/* Cancel Button */}
          <Pressable onPress={onClose} style={styles.cancelButton} disabled={isSubmitting}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </Pressable>
        </KeyboardAvoidingView>
      </BottomSheetView>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    paddingHorizontal: 24,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  inputContainer: {
    marginBottom: 16,
  },
  textInput: {
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#000',
    minHeight: 120,
    maxHeight: 200,
  },
  characterCount: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
    marginTop: 8,
  },
  errorContainer: {
    backgroundColor: '#FFE5E5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 14,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    overflow: 'hidden',
    position: 'relative',
    minHeight: 56,
  },
  submitButtonDisabled: {
    backgroundColor: '#B0B0B0',
    opacity: 0.6,
  },
  shimmerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  cancelButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
