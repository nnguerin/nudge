import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Pressable,
  Image,
} from 'react-native';
import BottomSheet, { BottomSheetBackdrop, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import Animated from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import {
  useUpdateNudgeTarget,
  useAddContactToTarget,
  useRemoveContactFromTarget,
} from '@/hooks/nudge-targets';
import { useCreateContact } from '@/hooks/contacts';
import { useStore } from '@/store/store';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { ContactPicker, PhoneContact } from './ContactPicker';
import { NudgeTargetWithContacts, Contact } from '@/types';
import { PremiumModal } from './PremiumModal';
import { useSubmitAnimation } from './AnimatedSubmitButton';

interface EditTargetBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  target: NudgeTargetWithContacts | null;
}

export const EditTargetBottomSheet: React.FC<EditTargetBottomSheetProps> = ({
  isOpen,
  onClose,
  onSuccess,
  target,
}) => {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['75%', '90%'], []);

  const { profile } = useStore();

  const [name, setName] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPremiumModal, setShowPremiumModal] = useState(false);

  // Track existing contacts and their removal status
  const [existingContacts, setExistingContacts] = useState<Contact[]>([]);
  const [contactsToRemove, setContactsToRemove] = useState<Set<string>>(new Set());

  // Track new contacts to add
  const [newPhoneContacts, setNewPhoneContacts] = useState<PhoneContact[]>([]);

  const updateTargetMutation = useUpdateNudgeTarget();
  const addContactMutation = useAddContactToTarget();
  const removeContactMutation = useRemoveContactFromTarget();
  const createContactMutation = useCreateContact();

  const { triggerSuccessAnimation, buttonAnimatedStyle, shimmerStyle } = useSubmitAnimation();

  // Initialize form when target changes
  useEffect(() => {
    if (target) {
      setName(target.name);
      setImageUri(target.image_uri || null);
      setExistingContacts(target.contacts);
      setContactsToRemove(new Set());
      setNewPhoneContacts([]);
      setError(null);
    }
  }, [target]);

  useEffect(() => {
    if (isOpen) {
      bottomSheetRef.current?.expand();
    } else {
      bottomSheetRef.current?.close();
    }
  }, [isOpen]);

  const resetForm = () => {
    setName('');
    setImageUri(null);
    setExistingContacts([]);
    setContactsToRemove(new Set());
    setNewPhoneContacts([]);
    setError(null);
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
      Haptics.selectionAsync();
    }
  };

  const handleSheetChanges = useCallback(
    (index: number) => {
      if (index === -1) {
        onClose();
        resetForm();
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

  const handleRemoveExistingContact = (contactId: string) => {
    setContactsToRemove((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(contactId)) {
        newSet.delete(contactId);
      } else {
        newSet.add(contactId);
      }
      return newSet;
    });
    Haptics.selectionAsync();
  };

  const handleNewContactsChange = (contacts: PhoneContact[]) => {
    // Check premium limit
    const remainingExisting = existingContacts.filter((c) => !contactsToRemove.has(c.id)).length;
    const totalContacts = remainingExisting + contacts.length;

    if (!profile?.is_premium && totalContacts > 1) {
      setShowPremiumModal(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }

    setNewPhoneContacts(contacts);
  };

  const handleSubmit = async () => {
    if (!target) return;

    if (!name.trim()) {
      setError('Please enter a connection name');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    const remainingExisting = existingContacts.filter((c) => !contactsToRemove.has(c.id)).length;
    const totalContacts = remainingExisting + newPhoneContacts.length;

    if (totalContacts === 0) {
      setError('Please keep at least one contact');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Update the target name and image if changed
      const nameChanged = name.trim() !== target.name;
      const imageChanged = imageUri !== target.image_uri;

      if (nameChanged || imageChanged) {
        await updateTargetMutation.mutateAsync({
          id: target.id,
          name: name.trim(),
          image_uri: imageUri,
        });
      }

      // Remove contacts marked for removal
      for (const contactId of contactsToRemove) {
        await removeContactMutation.mutateAsync({
          recipient_id: target.id,
          contact_id: contactId,
        });
      }

      // Create and add new contacts
      for (const phoneContact of newPhoneContacts) {
        const contact = await createContactMutation.mutateAsync({
          name: phoneContact.name,
          email: phoneContact.email,
          phone: phoneContact.phone,
        });
        await addContactMutation.mutateAsync({
          recipient_id: target.id,
          contact_id: contact.id,
        });
      }

      triggerSuccessAnimation();

      setTimeout(() => {
        onSuccess?.();
        onClose();
        resetForm();
      }, 600);
    } catch (err) {
      console.error('Error updating target:', err);
      setError('Failed to update connection. Please try again.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const remainingExisting = existingContacts.filter((c) => !contactsToRemove.has(c.id)).length;
  const totalContacts = remainingExisting + newPhoneContacts.length;
  const isValid = name.trim().length > 0 && totalContacts > 0;

  // Calculate max selection for ContactPicker
  const maxNewContacts = profile?.is_premium ? undefined : Math.max(0, 1 - remainingExisting);

  return (
    <>
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
              <Text style={styles.title}>Edit Connection</Text>
              <Text style={styles.subtitle}>Update your connection details</Text>
            </View>

            {/* Image Picker */}
            <View style={styles.imagePickerContainer}>
              <Pressable onPress={pickImage} style={styles.imagePicker}>
                {imageUri ? (
                  <Image source={{ uri: imageUri }} style={styles.connectionImage} />
                ) : (
                  <View style={styles.imagePlaceholder}>
                    <MaterialCommunityIcons name="camera-plus" size={32} color="#999" />
                  </View>
                )}
              </Pressable>
              <Text style={styles.imagePickerHint}>Tap to change photo</Text>
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
              />
            </View>

            {/* Current Contacts Section */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Current Contacts</Text>
            </View>

            {existingContacts.length > 0 ? (
              <View style={styles.existingContactsList}>
                {existingContacts.map((contact) => {
                  const isMarkedForRemoval = contactsToRemove.has(contact.id);
                  return (
                    <View
                      key={contact.id}
                      style={[
                        styles.existingContactItem,
                        isMarkedForRemoval && styles.existingContactItemRemoved,
                      ]}>
                      <View style={styles.contactInfo}>
                        <Text
                          style={[
                            styles.contactName,
                            isMarkedForRemoval && styles.contactNameRemoved,
                          ]}>
                          {contact.name}
                        </Text>
                        {contact.phone && (
                          <Text style={styles.contactDetail}>{contact.phone}</Text>
                        )}
                        {contact.email && (
                          <Text style={styles.contactDetail}>{contact.email}</Text>
                        )}
                      </View>
                      <Pressable
                        onPress={() => handleRemoveExistingContact(contact.id)}
                        style={styles.removeButton}>
                        <MaterialCommunityIcons
                          name={isMarkedForRemoval ? 'undo' : 'close'}
                          size={20}
                          color={isMarkedForRemoval ? '#007AFF' : '#FF3B30'}
                        />
                      </Pressable>
                    </View>
                  );
                })}
              </View>
            ) : (
              <Text style={styles.noContactsText}>No contacts</Text>
            )}

            {/* Add New Contacts Section */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Add Contacts</Text>
            </View>

            <ContactPicker
              selectedContacts={newPhoneContacts}
              onSelectionChange={handleNewContactsChange}
              maxSelection={maxNewContacts}
              onMaxSelectionExceeded={() => setShowPremiumModal(true)}
            />

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
                  <Text style={styles.submitButtonText}>Save Changes</Text>
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

      <PremiumModal
        visible={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
      />
    </>
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
  imagePickerContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  imagePicker: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: 'hidden',
  },
  connectionImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  imagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#E5E5EA',
    borderStyle: 'dashed',
  },
  imagePickerHint: {
    marginTop: 8,
    fontSize: 12,
    color: '#999',
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
  existingContactsList: {
    marginBottom: 16,
  },
  existingContactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#F2F2F7',
    marginBottom: 8,
  },
  existingContactItemRemoved: {
    backgroundColor: '#FFE5E5',
    opacity: 0.7,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
  },
  contactNameRemoved: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  contactDetail: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  removeButton: {
    padding: 8,
  },
  noContactsText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginBottom: 16,
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
