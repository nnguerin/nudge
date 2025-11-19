import React from 'react';
import { View, Text, StyleSheet, Pressable, Modal } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

interface PremiumModalProps {
  visible: boolean;
  onClose: () => void;
  onLearnMore?: () => void;
}

export const PremiumModal: React.FC<PremiumModalProps> = ({
  visible,
  onClose,
  onLearnMore,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <MaterialCommunityIcons name="crown" size={48} color="#FFD700" />
          <Text style={styles.modalTitle}>Upgrade to Premium</Text>
          <Text style={styles.modalText}>
            Group connections with multiple contacts are a premium feature. Upgrade to create
            connections with 2 or more contacts.
          </Text>
          <Pressable
            style={styles.upgradeButton}
            onPress={() => {
              onLearnMore?.();
              onClose();
            }}>
            <Text style={styles.upgradeButtonText}>Learn More</Text>
          </Pressable>
          <Pressable style={styles.modalCancelButton} onPress={onClose}>
            <Text style={styles.modalCancelText}>Maybe Later</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    width: '100%',
    maxWidth: 340,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#000',
    marginTop: 16,
    marginBottom: 8,
  },
  modalText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  upgradeButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 32,
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
  },
  upgradeButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  modalCancelButton: {
    paddingVertical: 8,
  },
  modalCancelText: {
    color: '#666',
    fontSize: 14,
  },
});
