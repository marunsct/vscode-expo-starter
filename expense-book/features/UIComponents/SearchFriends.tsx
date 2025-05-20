import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface Friend {
  id: string;
  first_name?: string;
  last_name?: string;
  username?: string;
  email?: string;
  phone?: string;
}

interface SearchFriendsProps {
  search: string;
  setSearch: (s: string) => void;
  selectedFriends: Friend[];
  setSelectedFriends: (f: Friend[]) => void;
  showDropdown: boolean;
  setShowDropdown: (b: boolean) => void;
  searchResults: Friend[];
  inputRef: React.RefObject<TextInput | null>;
  descRef: React.RefObject<TextInput | null>;
  handleSelectFriend: (friend: Friend) => void;
  handleRemoveFriend: (id: string) => void;
  theme: any;
}


const SearchFriends: React.FC<SearchFriendsProps> = ({
  search,
  setSearch,
  selectedFriends,
  showDropdown,
  searchResults,
  inputRef,
  descRef,
  handleSelectFriend,
  handleRemoveFriend,
  theme,
}) => (
  <>
    <View style={styles.containerRow}>
      <Text style={[styles.label, { color: theme.colors.textPrimary }]}>With you &:</Text>
      <View style={styles.multiInputContainerRow}>
        <View style={styles.inputRow}>
          {selectedFriends.map((f) => (
            <TouchableOpacity
              key={f.id}
              style={[
                styles.token,
                { backgroundColor: theme.colors.primary + '22' },
              ]}
              onPress={() => handleRemoveFriend(f.id)}
            >
              <Text style={[styles.tokenText, { color: theme.colors.primary }]}>{f.username}</Text>
              <Ionicons name="close-circle" size={18} color={theme.colors.primary} />
            </TouchableOpacity>
          ))}
          <TextInput
            ref={inputRef}
            style={[styles.inputFixed, { color: theme.colors.textPrimary }]}
            placeholder={selectedFriends.length === 0 ? "Enter names, email or Phone" : undefined}
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
              data={searchResults.filter(
                (item) => !selectedFriends.some((f) => f.id === item.id)
              ).slice(0, 4)}
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
    </View>
  </>
);

export default SearchFriends;


const styles = StyleSheet.create({
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 5,
    marginTop: 12,
    marginBottom: 4,
  },
  containerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 5,
    marginBottom: 12,
  },
  multiInputContainerRow: {
    flex: 1,
    alignItems: 'center',
    marginLeft: 8,
  },
  inputRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    minHeight: 40,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 8,
    backgroundColor: '#fafafa',
    maxWidth: 220, // fixed width for the multi-input field
  },
  token: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingHorizontal: 10,
    marginRight: 6,
    marginVertical: 4,
    height: 32,
  },
  tokenText: {
    marginRight: 4,
    fontWeight: 'bold',
  },
  inputFixed: {
    width: 200,
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
});
