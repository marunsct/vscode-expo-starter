import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    BackHandler,
    FlatList,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { getFriends } from '../../../../database/db';
import { useTheme } from '../../../ThemeContext';

const currencyList = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  // ...add more as needed
];

// This is a modal screen
export default function AddExpenseModal() {
  const router = useRouter();
  const theme = useTheme();
  
  // Handle hardware back button and gesture
  useEffect(() => {
    const backHandler = () => {
      router.back();
      return true;
    };
    
    if (Platform.OS === 'android') {
      const subscription = BackHandler.addEventListener('hardwareBackPress', backHandler);
      return () => subscription.remove();
    }
  }, [router]);
  const [search, setSearch] = useState('');
  type Friend = {
    id: string;
    first_name?: string;
    last_name?: string;
    username?: string;
    email?: string;
    phone?: string;
  };
  
  const [searchResults, setSearchResults] = useState<Friend[]>([]);
  const [selectedFriends, setSelectedFriends] = useState<Friend[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState(currencyList[0]);
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  // Simplified state management to avoid TypeScript warnings
  const [note] = useState('');
  const [image] = useState(null);
  const [group] = useState(null);
  const inputRef = useRef<TextInput>(null);
  const descRef = useRef<TextInput>(null);
  const amountRef = useRef<TextInput>(null);

  // Focus on multi-input when screen opens
  useEffect(() => {
    setTimeout(() => {
      inputRef.current?.focus();
    }, 300);
  }, []);

  // Search friends when 3+ chars
  useEffect(() => {
    if (search.length >= 3) {
      getFriends().then((friends) => {
        const q = search.toLowerCase();
        const filtered = friends.filter(
          (f) =>
            f.first_name?.toLowerCase().includes(q) ||
            f.last_name?.toLowerCase().includes(q) ||
            f.username?.toLowerCase().includes(q) ||
            f.email?.toLowerCase().includes(q) ||
            f.phone?.toLowerCase().includes(q)
        );
        setSearchResults(filtered);
        setShowDropdown(true);
      });
    } else {
      setShowDropdown(false);
    }
  }, [search]);


interface HandleSelectFriend {
    (friend: Friend): void;
}

const handleSelectFriend: HandleSelectFriend = (friend) => {
    if (!selectedFriends.some((f: Friend) => f.id === friend.id)) {
        setSelectedFriends([...selectedFriends, friend]);
    }
    setSearch('');
    setShowDropdown(false);
    setTimeout(() => inputRef.current?.focus(), 100);
};

interface HandleRemoveFriend {
    (id: string): void;
}

const handleRemoveFriend: HandleRemoveFriend = (id) => {
    setSelectedFriends(selectedFriends.filter((f) => f.id !== id));
};

interface Currency {
    code: string;
    symbol: string;
    name: string;
}

const handleCurrencySelect = (cur: Currency): void => {
    setCurrency(cur);
    setShowCurrencyModal(false);
    setTimeout(() => amountRef.current?.focus(), 100);
};

// No need for unused interface and function declarations that trigger TypeScript warnings
// We'll keep the function reference for future implementation
const handleDateChange = (newDate: Date) => {
    setDate(newDate);
    setShowDatePicker(false);
};

  const handleSave = () => {
    // Save logic here
    router.back();
  };

  return (
    <KeyboardAvoidingView
      style={{ 
        flex: 1, 
        marginTop: 50, // Add space at the top to make it more modal-like
        backgroundColor: theme.colors.background,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        overflow: 'hidden',
        // Add shadow for modal effect
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 10,
      }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header with improved styling for modal */}
      <View style={[styles.headerBar, { 
        borderBottomWidth: 1, 
        borderBottomColor: '#e0e0e0',
        backgroundColor: theme.colors.background
      }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerIcon}>
          <Ionicons name="close" size={28} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>Add New Expense</Text>
        <TouchableOpacity onPress={handleSave} style={styles.headerIcon}>
          <Text style={[styles.saveText, { color: theme.colors.primary }]}>Save</Text>
        </TouchableOpacity>
      </View>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ flexGrow: 1 }}>
        {/* Multi-input field */}
        <Text style={[styles.label, { color: theme.colors.textPrimary }]}>With you and:</Text>
        <View style={styles.multiInputContainer}>
          <View style={styles.selectedFriendsRow}>
            {selectedFriends.map((f) => (
              <TouchableOpacity key={f.id} style={styles.selectedFriend} onPress={() => handleRemoveFriend(f.id)}>
                <Text style={styles.selectedFriendText}>{f.first_name || f.username}</Text>
                <Ionicons name="close-circle" size={18} color={theme.colors.accent} />
              </TouchableOpacity>
            ))}
            <TextInput
              ref={inputRef}
              style={[styles.multiInput, { color: theme.colors.textPrimary }]}
              placeholder="Enter names, email or Phone"
              placeholderTextColor={theme.colors.textSecondary}
              value={search}
              onChangeText={setSearch}
              onSubmitEditing={() => descRef.current?.focus()}
              autoFocus
              returnKeyType="next"
            />
          </View>
          {showDropdown && (
            <View style={styles.dropdown}>
              <FlatList
                data={searchResults}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity style={styles.dropdownItem} onPress={() => handleSelectFriend(item)}>
                    <Text style={{ color: theme.colors.textPrimary }}>{item.first_name} {item.last_name} ({item.username})</Text>
                  </TouchableOpacity>
                )}
                keyboardShouldPersistTaps="handled"
              />
            </View>
          )}
        </View>
        {/* Transparent container with shadow */}
        <View style={styles.transparentBox}>
          <TextInput
            ref={descRef}
            style={[styles.input, { color: theme.colors.textPrimary }]}
            placeholder="Enter description"
            placeholderTextColor={theme.colors.textSecondary}
            value={description}
            onChangeText={setDescription}
            onSubmitEditing={() => amountRef.current?.focus()}
            returnKeyType="next"
          />
          <View style={styles.amountRow}>
            <TouchableOpacity style={styles.currencyButton} onPress={() => setShowCurrencyModal(true)}>
              <Text style={styles.currencyText}>{currency.symbol}</Text>
            </TouchableOpacity>
            <TextInput
              ref={amountRef}
              style={[styles.input, { flex: 1, color: theme.colors.textPrimary }]}
              placeholder="Enter amount"
              placeholderTextColor={theme.colors.textSecondary}
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
              returnKeyType="done"
            />
          </View>
          <TouchableOpacity style={styles.splitButton}>
            <Text style={{ color: theme.colors.primary, fontWeight: 'bold' }}>Paid by you and split equally</Text>
          </TouchableOpacity>
        </View>
        {/* Bottom bar */}
        <View style={styles.bottomBar}>
          <TouchableOpacity style={styles.bottomIcon} onPress={() => setShowDatePicker(true)}>
            <Ionicons name="calendar" size={24} color={theme.colors.primary} />
            <Text style={{ marginLeft: 6, color: theme.colors.textPrimary, fontWeight: 'bold' }}>
              {date ?
                (new Date(date).toDateString() === new Date().toDateString()
                  ? 'Today'
                  : date.toLocaleString('default', { month: 'short', day: '2-digit' }))
                : 'Today'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.bottomIcon}>
            <Ionicons name="people" size={24} color={theme.colors.primary} />
            <Text style={{ marginLeft: 6, color: theme.colors.textPrimary }}>No groups</Text>
          </TouchableOpacity>
          <View style={styles.bottomRightIcons}>
            <TouchableOpacity style={styles.bottomIcon}>
              <Ionicons name="camera" size={24} color={theme.colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.bottomIcon}>
              <MaterialIcons name="note-add" size={24} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      {/* Currency Modal */}
      <Modal visible={showCurrencyModal} transparent animationType="fade">
        <TouchableOpacity style={styles.modalOverlay} onPress={() => setShowCurrencyModal(false)}>
          <View style={styles.currencyModal}>
            <FlatList
              data={currencyList}
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.currencyItem} onPress={() => handleCurrencySelect(item)}>
                  <Text style={{ fontSize: 18 }}>{item.symbol} {item.name}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
      {/* Date Picker Modal (implement with your preferred date picker library) */}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingTop: Platform.OS === 'ios' ? 48 : 16,
    paddingBottom: 12,
    backgroundColor: 'transparent',
  },
  headerIcon: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  saveText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 16,
    marginTop: 12,
    marginBottom: 4,
  },
  multiInputContainer: {
    marginHorizontal: 16,
    marginBottom: 12,
  },
  selectedFriendsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    minHeight: 40,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 8,
    backgroundColor: '#fafafa',
  },
  selectedFriend: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e0f7fa',
    borderRadius: 12,
    paddingHorizontal: 8,
    marginRight: 6,
    marginVertical: 4,
  },
  selectedFriendText: {
    marginRight: 4,
    color: '#00796b',
  },
  multiInput: {
    flex: 1,
    minWidth: 120,
    paddingVertical: 8,
    fontSize: 16,
    backgroundColor: 'transparent',
  },
  dropdown: {
    position: 'absolute',
    top: 44,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    zIndex: 10,
    maxHeight: 180,
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  transparentBox: {
    margin: 16,
    padding: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.7)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    fontSize: 16,
    marginBottom: 12,
    paddingVertical: 8,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  currencyButton: {
    marginRight: 8,
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#e0e0e0',
  },
  currencyText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  splitButton: {
    marginTop: 8,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#e0f7fa',
    alignItems: 'center',
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 24,
    marginHorizontal: 16,
    marginBottom: 24,
  },
  bottomIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  bottomRightIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  currencyModal: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    width: 280,
    maxHeight: 400,
  },
  currencyItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
});
