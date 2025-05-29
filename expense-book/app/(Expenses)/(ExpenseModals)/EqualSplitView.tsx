import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

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

type EqualSplitViewProps = {
  participants: Friend[];
  selectedIds: Friend[];
  setSelectedIds: React.Dispatch<React.SetStateAction<Friend[]>>;
};

const EqualSplitView: React.FC<EqualSplitViewProps> = ({
  participants,
  selectedIds,
  setSelectedIds,
}) => {
  const isSelected = (friend: Friend) => selectedIds.some(f => f.userId === friend.userId);

  const toggleSelect = (friend: Friend) => {
    setSelectedIds((prev) => {
      if (prev.some(f => f.userId === friend.userId)) {
        return prev.filter(f => f.userId !== friend.userId);
      } else {
        return [...prev, friend];
      }
    });
  };

  return (
    <View>
    <ScrollView style={styles.content}>
      {participants.map((p) => (
        <TouchableOpacity key={p.userId} onPress={() => toggleSelect(p)}>
          <View key={p.userId} style={styles.item}>

            {p.profile_image ? (
              <Image source={{ uri: p.profile_image }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>
                  {p.first_name?.[0]?.toUpperCase() ?? p.username?.[0]?.toUpperCase() ?? '?'}
                </Text>
              </View>
            )}
            <Text style={styles.name}>{p.first_name ?? p.username}</Text>
            <View style={{ flex: 1 }} />

            <Ionicons
              name={isSelected(p) ? 'checkbox' : 'square-outline'}
              size={24}
              color={isSelected(p) ? '#2196F3' : '#bbb'}
            />

          </View>
        </TouchableOpacity>

      ))}
    </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  content: { width: '100%', backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 10, paddingBottom: 20, maxHeight: '100%', marginTop: 2 },
  contentContainer: { paddingBottom: 20 },
  item: { flexDirection: 'row', alignItems: 'center', marginVertical: 10 },
  avatar: { width: 36, height: 36, borderRadius: 18, marginRight: 12 },
  avatarPlaceholder: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#e0e0e0', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  avatarText: { fontWeight: 'bold', color: '#00796b', fontSize: 18 },
  name: { fontSize: 16, color: '#222' },
});

export default EqualSplitView;