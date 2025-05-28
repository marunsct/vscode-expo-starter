import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  BackHandler,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { getFriends, getGroupMembers } from '../../database/db';
import CurrencyPicker from '../../features/UIComponents/CurrencyPicker';
import DatePickerComponent from '../../features/UIComponents/DatePickerComponent';
import SearchFriends from '../../features/UIComponents/SearchFriends';
import { setAddExpense } from '../../features/context/contextSlice';
import { currencyList } from '../../features/helpers/currencyHelper';
import { useTheme } from '../../features/theme/ThemeContext';
import ExpenseSplitModal from './(ExpenseModals)/ExpenseSplitModal';
import ImagePickerModal from './(ExpenseModals)/ImagePickerModal';

type Group = {
  id: string;
  name: string;
  balance: number;
  currency: string;
};
type Friend = {
  id: string;
  userId?: number; // Optional userId for the friend
  first_name?: string;
  last_name?: string;
  username?: string;
  email?: string;
  phone?: string;
  profile_image?: string;
  amount?: number; // Optional amount for the friend
  counter?: number; // Optional counter for the friend
};
type ContextExpense = {
  friends: Friend[];
  description: string;
  createdBy: string;
  image: string;
  amount: string;
  currency: string;
  date: string;
  split_type: 'equal' | 'parts' | 'percentage' | 'custom';
  group: Group | null;
  groupMembers: Friend[]; // Added group members to the context expense
  contributors: Friend[];
};

export default function AddExpenseModal() {
  const router = useRouter();
  const theme = useTheme();
  const dispatch = useDispatch()

  const groups = useSelector((state: any) => state.context.groups);
  const [groupsData, setGroupsData] = useState<Group[]>([]);

  useEffect(() => {
    console.log('Group data:', groups);
    setGroupsData(groups);
  }, [groups]);

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


  const [searchResults, setSearchResults] = useState<Friend[]>([]);
  const [selectedFriends, setSelectedFriends] = useState<Friend[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState(currencyList[0]);
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [date, setDate] = useState<Date>(new Date());
  const [isImagePickerModalVisible, setIsImagePickerModalVisible] = useState(false); // State for new modal
  const [expenseImage, setExpenseImage] = useState<string | null>(null); // State for the image URI
  const [isGroupModalVisible, setIsGroupModalVisible] = useState(false);
  const [groupAnchor, setGroupAnchor] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<{ id: string; name: string } | null>(null);
  const [selectedGroupMembers, setSelectedGroupMembers] = useState<Friend[]>([]); // State for the selected group members
  const [isSplitModalVisible, setIsSplitModalVisible] = useState(false); // State for split modal
  const [splitType, setSplitType] = useState<'equal' | 'parts' | 'percentage' | 'custom'>('equal'); // State for split type
  const inputRef = useRef<TextInput>(null);
  const descRef = useRef<TextInput>(null);
  const amountRef = useRef<TextInput>(null);
  const groupIconRef = useRef<any>(null);
  const contextExpenseRef = useRef<ContextExpense>(
    useSelector((state: any) => state.context.addExpense)
  );
  const currentUser = useSelector((state: any) => state.context.user); // Get the current user from the context
  const [contributors, setContributors] = useState<Friend[]>([{...currentUser, amount : 0.00}]); // Initialize contributors with the current user
  const [participants, setParticipants] = useState<Friend[]>([]); // Initialize participants
  // When the expense data is set, update the context


  useEffect(() => {
    let contextExpense = { ...(contextExpenseRef.current) };
    let updateContext = false;
    if (contextExpense.friends.length > 0 && selectedFriends.length === 0) {
      setDescription(contextExpense.description);
      setAmount(contextExpense.amount);
      //setCurrency(contextExpense.currency);
      setDate(new Date(contextExpense.date));
      setSelectedGroup(contextExpense.group);
      setSelectedFriends(contextExpense.friends);
      return;
    }
    if (selectedFriends.length > 0) {
      updateContext = true;
      contextExpense.friends = selectedFriends;
    }
    if (description) {
      updateContext = true;
      contextExpense.description = description;
    }
    if (amount) {
      updateContext = true;
      contextExpense.amount = amount;
    }
    if (currency) {
      updateContext = true;
      contextExpense.currency = currency.code;
    }
    if (date) {
      updateContext = true;
      contextExpense.date = date.toISOString();
    }
    if (selectedGroup) {
      updateContext = true;
      contextExpense.group = { id: selectedGroup.id, name: selectedGroup.name, balance: 0, currency: currency.code };
    } else {
      contextExpense.group = null;
    }

    if (selectedGroupMembers.length > 0) {
      updateContext = true;
      contextExpense.groupMembers = selectedGroupMembers;
    }

    if(expenseImage) {
      updateContext = true;
      contextExpense.image = expenseImage;
    }

    if (splitType) {
      updateContext = true;
      contextExpense.split_type = splitType;
    }

    if (updateContext) {
      console.log('Updated context');
      dispatch(
        setAddExpense(contextExpense)
      );
    }
  }, [selectedFriends, splitType, description, amount, currency, date, selectedGroup, selectedGroupMembers, expenseImage, dispatch]);

  // Focus on multi-input when screen opens
  useEffect(() => {
    setTimeout(() => {
      inputRef.current?.focus();
    }, 300);
  }, []);

  useEffect(() => {

    if (contributors.length === 1) {
      setContributors([{ ...currentUser, amount: amount }]); // Initialize with current user if no contributors
    }
  }, [amount]);

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
    if (!selectedFriends.some((f: Friend) => f.userId === friend.userId)) {
      setSelectedFriends([...selectedFriends, friend]);
      console.log('Selected friends:', selectedFriends);
    }
    setSearch('');
    setParticipants([]);
    setShowDropdown(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  // Add group token to SearchFriends
  const searchFriendsTokens = selectedGroup
    ? [{ id: `group-${selectedGroup.id}`, username: selectedGroup.name, isGroup: true }, ...selectedFriends]
    : selectedFriends;

  // Handle group selection
  const handleGroupSelect = (group: Group) => {
    try {
      setParticipants([]);
      console.log('Selecting group members:', parseInt(group.id))
      getGroupMembers(parseInt(group.id)).then((members) => {
        setSelectedGroupMembers(members);
        console.log('Selected group members:', members.length);
      });
    } catch (error) {
      console.error('Error fetching group members:', error);
    }
  };
  // Remove group token handler
  const handleRemoveGroup = () => {
    console.log('Removing group token');
    setSelectedGroup(null);
    setSelectedGroupMembers([]);
    setParticipants([]);
  };

  interface HandleRemoveFriend {
    (id: string): void;
  }

  const handleRemoveFriend: HandleRemoveFriend = (id) => {
    // If the id matches the group token, remove the group
    if (selectedGroup && id === `group-${selectedGroup.id}`) {
      handleRemoveGroup();
      return;
    }
    setSelectedFriends(selectedFriends.filter((f) => f.id !== id));
    setParticipants([]);
  };

  const handleSave = () => {
    // Save logic here, including expenseImage
    //console.log('Expense Image URI:', expenseImage);
    router.back();
  };

  const openExpenseSplit = async () => {

    if (!amount || parseFloat(amount) <= 0) {
      alert('Please enter a valid amount to split.'); // Show an alert or some other feedback
      return;
    }
    if (selectedFriends.length === 0 && !selectedGroup) {
      alert('Please select at least one friend to split the expense with.'); // Show an alert or some other feedback
      return;
    }
    console.log('checking participants', participants.length, contributors.length, selectedFriends.length, selectedGroupMembers.length);
    if (participants.length === 0) {
      console.log('preparing participants', contributors.length, selectedFriends.length, selectedGroupMembers.length);
      const combined = [
        ...contributors,
        ...selectedFriends,
        ...selectedGroupMembers,

      ];
      console.log('Combined participants:', combined.length);
      
      const uniqueById = Array.from(
        new Map(combined.map(item => [item.userId, item])).values()
      );
      setParticipants(uniqueById);
      console.log('Participants:', uniqueById.length);
    }
    setIsSplitModalVisible(true);
  };

  const handleSaveImageFromModal = (uri: string | null) => {
    setExpenseImage(uri);
    setIsImagePickerModalVisible(false);
  };

  const onClose = () => {
    dispatch(setAddExpense({
      createdBy: "",
      description: "",
      amount: "",
      date: "",
      split_type: "equal",
      group: {},
      groupMembers: [],
      contributors: [],
      participants: [],
      friends: [],
      image: "",
    }));
    router.back();
  }


  return (
    <KeyboardAvoidingView
      style={{
        flex: 1,
        backgroundColor: theme.colors.background,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 10,
      }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
      {/* Header with improved styling for modal */}
      <View style={styles.headerBar}>
        <TouchableOpacity onPress={onClose} style={styles.headerIcon}>
          <Ionicons name="close" size={28} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>Add New Expense</Text>
        <TouchableOpacity onPress={handleSave} style={styles.headerIcon}>
          <Text style={[styles.saveText, { color: theme.colors.primary }]}>Save</Text>
        </TouchableOpacity>
      </View>
      <View style={{ flex: 1 }}>
        <FlatList
          ListHeaderComponent={
            <View style={{ flexGrow: 1, justifyContent: 'space-between' }}>
              <View>
                <SearchFriends
                  search={search}
                  setSearch={setSearch}
                  selectedFriends={searchFriendsTokens}
                  setSelectedFriends={setSelectedFriends}
                  showDropdown={showDropdown}
                  setShowDropdown={setShowDropdown}
                  searchResults={searchResults}
                  inputRef={inputRef}
                  descRef={descRef}
                  handleSelectFriend={handleSelectFriend}
                  handleRemoveFriend={handleRemoveFriend}
                  handleRemoveGroup={handleRemoveGroup}
                  theme={theme}
                />
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
                    <CurrencyPicker
                      currency={currency}
                      setCurrency={setCurrency}
                      showCurrencyModal={showCurrencyModal}
                      setShowCurrencyModal={setShowCurrencyModal}
                      amountRef={amountRef}
                      currencyList={currencyList}
                      theme={theme}
                    />
                    <TextInput
                      ref={amountRef}
                      style={[styles.inputCurrency, { flex: 1, color: theme.colors.textPrimary }]}
                      placeholder="Enter amount"
                      placeholderTextColor={theme.colors.textSecondary}
                      value={amount}
                      onChangeText={setAmount}
                      keyboardType="numeric"
                      returnKeyType="none"
                    />
                  </View>
                  <TouchableOpacity style={styles.splitButton} onPress={openExpenseSplit}>
                    <Text style={{ color: theme.colors.primary, fontWeight: 'bold' }}>Paid by you and split equally</Text>
                  </TouchableOpacity>
                </View>
              </View>
              <View style={styles.bottomBar}>
                <View style={styles.bottomIcon}>
                  <DatePickerComponent date={date} onDateChange={setDate} theme={theme} />
                </View>
                <TouchableOpacity
                  ref={groupIconRef}
                  style={styles.bottomIcon}
                  onPress={() => {
                    Keyboard.dismiss();
                    groupIconRef.current?.measureInWindow((x: number, y: number, width: number, height: number) => {
                      console.log(x,y,width, height);
                      x = x/2;
                      setGroupAnchor({ x, y, width, height });
                      setIsGroupModalVisible(true);
                    });
                  }}
                >
                  <Ionicons name="people" size={24} color={theme.colors.primary} />
                  <Text style={{ marginLeft: 6, color: theme.colors.textPrimary, fontWeight: 'bold' }}>
                    {selectedGroup ? selectedGroup.name : 'No groups'}
                  </Text>
                </TouchableOpacity>
                <View style={styles.bottomRightIcons}>
                  <TouchableOpacity
                    style={styles.bottomIcon}
                    onPress={() => setIsImagePickerModalVisible(true)}
                  >
                    <Ionicons name="camera" size={24} color={theme.colors.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.bottomIcon}>
                    <MaterialIcons name="note-add" size={24} color={theme.colors.primary} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          }
          data={[]}
          renderItem={null}
          keyExtractor={() => ''}
          keyboardShouldPersistTaps="always"
          contentContainerStyle={{ flexGrow: 1 }}
        />
      </View>
      <ImagePickerModal
        visible={isImagePickerModalVisible}
        onClose={() => setIsImagePickerModalVisible(false)}
        onSaveImage={handleSaveImageFromModal}
        theme={theme}
      />
      {isGroupModalVisible && groupAnchor && (
        <>
          <TouchableWithoutFeedback onPress={() => setIsGroupModalVisible(false)}>
            <View style={styles.floatingBackdrop} pointerEvents="box-none" />
          </TouchableWithoutFeedback>
          <View
            style={[
              styles.floatingGroupWindow,
              {
                position: 'absolute',
                top: groupAnchor.y - 300, // float above the icon (window height ~240)
                left: groupAnchor.x,
                width: 240,
                zIndex: 1000,
                backgroundColor: '#fff',
              },
            ]}
            pointerEvents="box-none"
          >
            <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 12, color: theme.colors.textPrimary }}>Select Group</Text>
            <ScrollView style={{ maxHeight: 220 }}>
              {groupsData.map((group) => (
                <TouchableOpacity
                  key={group.id}
                  style={[
                    styles.groupItem,
                    selectedGroup?.id === group.id && { backgroundColor: theme.colors.primary + '22' },
                  ]}
                  onPress={() => {
                    setSelectedGroup(group);
                    handleGroupSelect(group);
                    setIsGroupModalVisible(false);
                  }}
                >
                  <Text style={{ color: theme.colors.textPrimary, fontWeight: selectedGroup?.id === group.id ? 'bold' : 'normal' }}>{group.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </>
      )}
      <ExpenseSplitModal
        visible={isSplitModalVisible}
        onClose={() => setIsSplitModalVisible(false)}
        onSave={() => setIsSplitModalVisible(false)}
        setSplit={(splitType: 'equal' | 'parts' | 'percentage' | 'custom') => setSplitType(splitType)}
        paidBy={selectedFriends[0] || { id: '', username: 'You' }} // or your logic for payer
        setNewContributors={(paidBy: Friend[]) => { setContributors(paidBy) }}
        setNewParticipants={(participants: Friend[]) => { setParticipants(participants) }}
        participants={participants}
        contributors={contributors}
        amount={amount}
        currency={currency.code}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingTop: Platform.OS === 'ios' ? 40 : 16,
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
    marginHorizontal: 16,
    marginVertical: 20,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    backgroundColor: 'rgba(255,255,255,0.7)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: '#00796b',
    fontSize: 16,
    marginBottom: 25,
    paddingVertical: 8,
  },
  inputCurrency: {
    borderBottomWidth: 1,
    borderBottomColor: '#00796b',
    fontSize: 16,
    marginBottom: 2,
    paddingVertical: 8,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 25,
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
    marginBottom: Platform.OS === 'ios' ? 30 : 24,
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
  floatingBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.2)',
    zIndex: 999,
  },
  floatingGroupWindow: {
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  groupItem: {
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    width: 200,
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
