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
import { useCreateNudgeTarget } from '@/hooks/nudge-targets';
import { useCreateContact } from '@/hooks/contacts';
import { BottomSheetScrollView } from '@gorhom/bottom-sheet';

interface CreateTargetBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const CreateTargetBottomSheet: React.FC<CreateTargetBottomSheetProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['75%', '90%'], []);

  const [name, setName] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createTargetMutation = useCreateNudgeTarget();
  const createContactMutation = useCreateContact();

  const scale = useSharedValue(1);
  const shimmer = useSharedValue(0);

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
        setName('');
        setContactName('');
        setContactEmail('');
        setContactPhone('');
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
    if (!name.trim()) {
      setError('Please enter a connection name');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    if (!contactName.trim()) {
      setError('Please enter a contact name');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // First create the contact
      const contact = await createContactMutation.mutateAsync({
        name: contactName.trim(),
        email: contactEmail.trim() || undefined,
        phone: contactPhone.trim() || undefined,
      });

      // Then create the target with the contact
      await createTargetMutation.mutateAsync({
        name: name.trim(),
        recurrence_pattern: null,
        contact_ids: [contact.id],
      });

      triggerSuccessAnimation();

      setTimeout(() => {
        onSuccess?.();
        onClose();
        setName('');
        setContactName('');
        setContactEmail('');
        setContactPhone('');
      }, 600);
    } catch (err) {
      console.error('Error creating target:', err);
      setError('Failed to create connection. Please try again.');
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

  const isValid = name.trim().length > 0 && contactName.trim().length > 0;

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
      <BottomSheetScrollView style={styles.contentContainer}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>New Connection</Text>
            <Text style={styles.subtitle}>Create a person or group to nudge</Text>
          </View>

          {/* Connection Name Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Connection Name</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g., Mom, Book Club, Best Friends"
              placeholderTextColor="#999"
              value={name}
              onChangeText={setName}
              maxLength={100}
              autoFocus
            />
          </View>

          {/* Contact Section */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Contact Details</Text>
          </View>

          {/* Contact Name */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Contact Name *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g., Jane Doe"
              placeholderTextColor="#999"
              value={contactName}
              onChangeText={setContactName}
              maxLength={100}
            />
          </View>

          {/* Contact Email */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email (optional)</Text>
            <TextInput
              style={styles.textInput}
              placeholder="jane@example.com"
              placeholderTextColor="#999"
              value={contactEmail}
              onChangeText={setContactEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              maxLength={100}
            />
          </View>

          {/* Contact Phone */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Phone (optional)</Text>
            <TextInput
              style={styles.textInput}
              placeholder="(555) 123-4567"
              placeholderTextColor="#999"
              value={contactPhone}
              onChangeText={setContactPhone}
              keyboardType="phone-pad"
              maxLength={20}
            />
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
                <Text style={styles.submitButtonText}>Create Connection</Text>
              )}
            </Pressable>
          </Animated.View>

          {/* Cancel Button */}
          <Pressable onPress={onClose} style={styles.cancelButton} disabled={isSubmitting}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </Pressable>
        </KeyboardAvoidingView>
      </BottomSheetScrollView>
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
  sectionHeader: {
    marginTop: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#000',
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
