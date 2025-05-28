import React from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';

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

type PercentageSplitViewProps = {
  participants: Friend[];
};

const PercentageSplitView: React.FC<PercentageSplitViewProps> = ({ participants }) => (
  <ScrollView style={styles.content}>
    {participants.map((p:Friend) => (
      <View key={p.id} style={styles.item}>
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
      </View>
    ))}
  </ScrollView>
);

const styles = StyleSheet.create({
  content: { width: '100%', backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom:10 },
  item: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  avatar: { width: 36, height: 36, borderRadius: 18, marginRight: 12 },
  avatarPlaceholder: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#e0e0e0', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  avatarText: { fontWeight: 'bold', color: '#00796b', fontSize: 18 },
  name: { fontSize: 16, color: '#222' },
});

export default PercentageSplitView;