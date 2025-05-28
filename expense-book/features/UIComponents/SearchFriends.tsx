import { Ionicons } from '@expo/vector-icons';
import React, { useRef } from 'react';
import { FlatList, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSelector } from 'react-redux';
interface Friend {
  id: string;
  userId?: number; // Optional userId for the friend
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
  handleRemoveGroup: () => void;
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
  handleRemoveGroup,
  theme,
}) => {
  const scrollRef = useRef<ScrollView | null>(null);
  const currentUser = useSelector((state: any) => state.context.user); // Get the current user from the context

  return (
    <>
      <View style={styles.containerRow}>
        <Text style={[styles.label, { color: theme.colors.textPrimary, flexShrink: 0, flexGrow: 0, flexBasis: 'auto', marginLeft: 5, marginRight: 8, textAlign: 'left' }]}>With you &:</Text>
        <View style={styles.multiInputContainerRow}>
          <ScrollView
            ref={scrollRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tokenScroll}
            keyboardShouldPersistTaps="handled"
            onContentSizeChange={() => {
              if (scrollRef.current) {
                scrollRef.current.scrollToEnd({ animated: true });
              }
            }}
          >
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
              style={[styles.inputFixed, { color: theme.colors.textPrimary, minWidth: 80, maxWidth: 120 }]}
              placeholder={selectedFriends.length === 0 ? "Enter names, email or Phone" : undefined}
              placeholderTextColor={theme.colors.textSecondary}
              value={search}
              onChangeText={setSearch}
              onSubmitEditing={() => descRef.current?.focus()}
              autoFocus
              returnKeyType="next"
            />
          </ScrollView>
          {showDropdown && (
            <View style={styles.dropdown}>
              <FlatList
                data={searchResults.filter(
                  (item) => !selectedFriends.some((f) => f.id === item.id && item.userId !== currentUser.userId) // Exclude already selected friends and current user
                ).slice(0, 4)}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity style={styles.dropdownItem} onPress={() => handleSelectFriend(item)}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      {/* Avatar: Use initials if no image */}
                      <View style={{
                        width: 32,
                        height: 32,
                        borderRadius: 16,
                        backgroundColor: '#e0e0e0',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: 12,
                      }}>
                        <Text style={{ fontWeight: 'bold', color: '#00796b' }}>
                          {item.first_name?.[0]?.toUpperCase() ?? item.username?.[0]?.toUpperCase() ?? '?'}
                        </Text>
                      </View>
                      <Text style={{ fontSize: 16, color: '#222' }}>{item.username}</Text>
                    </View>
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
};

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
    marginHorizontal: 16,
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
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    borderRadius: 0,
    paddingHorizontal: 8,
    backgroundColor: '#fafafa',
    flex: 1,
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
    minWidth: 80,
    flex: 1,
    paddingVertical: 8,
    fontSize: 16,
    backgroundColor: 'transparent',
  },
  tokenScroll: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 40,
    paddingHorizontal: 0,
    flexGrow: 1,
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
    maxHeight: 235, // <-- was 180, now fits 4 items
    overflow: 'hidden', // <-- ensures no overflow
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
});
