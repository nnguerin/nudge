import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Pressable,
  Image,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import * as Contacts from 'expo-contacts';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

export interface PhoneContact {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  imageUri?: string;
}

interface ContactPickerProps {
  selectedContacts: PhoneContact[];
  onSelectionChange: (contacts: PhoneContact[]) => void;
  maxSelection?: number;
  onMaxSelectionExceeded?: () => void;
}

export const ContactPicker: React.FC<ContactPickerProps> = ({
  selectedContacts,
  onSelectionChange,
  maxSelection,
  onMaxSelectionExceeded,
}) => {
  const [phoneContacts, setPhoneContacts] = useState<PhoneContact[]>([]);
  const [loadingContacts, setLoadingContacts] = useState(false);
  const [contactsPermission, setContactsPermission] = useState<boolean | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (contactsPermission === null) {
      loadContacts();
    }
  }, [contactsPermission]);

  const loadContacts = async () => {
    setLoadingContacts(true);
    try {
      const { status } = await Contacts.requestPermissionsAsync();

      if (status === 'granted') {
        setContactsPermission(true);
        const { data } = await Contacts.getContactsAsync({
          fields: [
            Contacts.Fields.Name,
            Contacts.Fields.Emails,
            Contacts.Fields.PhoneNumbers,
            Contacts.Fields.Image,
          ],
          sort: Contacts.SortTypes.FirstName,
        });

        const formattedContacts: PhoneContact[] = data
          .filter((c) => c.name)
          .map((c) => ({
            id: c.id,
            name: c.name || '',
            email: c.emails?.[0]?.email,
            phone: c.phoneNumbers?.[0]?.number,
            imageUri: c.image?.uri,
          }));

        setPhoneContacts(formattedContacts);
      } else {
        setContactsPermission(false);
      }
    } catch (err) {
      console.error('Error loading contacts:', err);
      setContactsPermission(false);
    } finally {
      setLoadingContacts(false);
    }
  };

  const filteredContacts = useMemo(() => {
    if (!searchQuery.trim()) return phoneContacts;
    const search = searchQuery.toLowerCase();
    return phoneContacts.filter(
      (c) =>
        c.name.toLowerCase().includes(search) ||
        c.email?.toLowerCase().includes(search) ||
        c.phone?.includes(search)
    );
  }, [phoneContacts, searchQuery]);

  const handleContactToggle = (contact: PhoneContact) => {
    const isSelected = selectedContacts.some((c) => c.id === contact.id);

    if (isSelected) {
      onSelectionChange(selectedContacts.filter((c) => c.id !== contact.id));
    } else {
      if (maxSelection && selectedContacts.length >= maxSelection) {
        onMaxSelectionExceeded?.();
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        return;
      }
      Haptics.selectionAsync();
      onSelectionChange([...selectedContacts, contact]);
    }
  };

  const handleClearSelection = () => {
    onSelectionChange([]);
  };

  if (loadingContacts) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading contacts...</Text>
      </View>
    );
  }

  if (contactsPermission === false) {
    return (
      <View style={styles.permissionDenied}>
        <MaterialCommunityIcons name="contacts" size={48} color="#CCC" />
        <Text style={styles.permissionDeniedTitle}>Contact Access Required</Text>
        <Text style={styles.permissionDeniedText}>
          Please allow access to your contacts in Settings to import contacts.
        </Text>
        <Pressable style={styles.retryButton} onPress={loadContacts}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <>
      {/* Search */}
      <View style={styles.searchContainer}>
        <MaterialCommunityIcons
          name="magnify"
          size={20}
          color="#999"
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search contacts..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Selected Contacts Summary */}
      {selectedContacts.length > 0 && (
        <View style={styles.selectedSummary}>
          <Text style={styles.selectedSummaryText}>
            {selectedContacts.length} contact
            {selectedContacts.length !== 1 ? 's' : ''} selected
          </Text>
          <Pressable onPress={handleClearSelection}>
            <Text style={styles.clearSelectionText}>Clear</Text>
          </Pressable>
        </View>
      )}

      {/* Contacts List */}
      <View style={styles.contactsList}>
        {filteredContacts.slice(0, 50).map((contact) => {
          const isSelected = selectedContacts.some((c) => c.id === contact.id);
          return (
            <Pressable
              key={contact.id}
              onPress={() => handleContactToggle(contact)}
              style={[styles.contactItem, isSelected && styles.contactItemSelected]}>
              {contact.imageUri ? (
                <Image source={{ uri: contact.imageUri }} style={styles.contactAvatar} />
              ) : (
                <View style={styles.contactAvatarPlaceholder}>
                  <Text style={styles.contactAvatarText}>
                    {contact.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
              <View style={styles.contactInfo}>
                <Text style={styles.contactName}>{contact.name}</Text>
                {contact.phone && (
                  <Text style={styles.contactDetail}>{contact.phone}</Text>
                )}
                {contact.email && (
                  <Text style={styles.contactDetail}>{contact.email}</Text>
                )}
              </View>
              <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                {isSelected && (
                  <MaterialCommunityIcons name="check" size={16} color="#FFF" />
                )}
              </View>
            </Pressable>
          );
        })}
        {filteredContacts.length > 50 && (
          <Text style={styles.moreContactsText}>
            Showing first 50 of {filteredContacts.length} contacts. Use search to
            find more.
          </Text>
        )}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    padding: 32,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  permissionDenied: {
    padding: 24,
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    marginBottom: 16,
  },
  permissionDeniedTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginTop: 12,
    marginBottom: 8,
  },
  permissionDeniedText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#007AFF',
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFF',
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#000',
  },
  selectedSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  selectedSummaryText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
  clearSelectionText: {
    fontSize: 14,
    color: '#FF3B30',
    fontWeight: '600',
  },
  contactsList: {
    marginBottom: 16,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#F2F2F7',
    marginBottom: 8,
  },
  contactAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  contactAvatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  contactAvatarText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  contactItemSelected: {
    backgroundColor: '#E3F2FD',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
  },
  contactDetail: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#CCC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  moreContactsText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
  },
});
