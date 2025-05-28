import React from 'react';
import { Image, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

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

type PartsSplitViewProps = {
  participants: Friend[];
  setSelectedIds: React.Dispatch<React.SetStateAction<Friend[]>>;
};

const PartsSplitView: React.FC<PartsSplitViewProps> = ({ participants, setSelectedIds }) => {
  // Local state to track counters for each participant
  const [counters, setCounters] = React.useState<{ [userId: string]: number }>({});

  React.useEffect(() => {
    // On mount or participants change, initialize counters from participants
    const initial: { [userId: string]: number } = {};
    participants.forEach((p) => {
      initial[p.id] = p.counter ?? 0;
    });
    setCounters(initial);
  }, [participants]);

  // Update setSelectedIds whenever counters change
  React.useEffect(() => {
    const selected = participants
      .map((p) => ({ ...p, counter: counters[p.id] ?? 0 }))
      .filter((p) => p.counter && p.counter > 0);
    setSelectedIds(selected);
  }, [counters, participants, setSelectedIds]);

  const handleCounterChange = (id: string, value: string) => {
    // Allow only numbers and decimals
    //const sanitized = value.replace(/[^0-9.]/g, '');
    const num = value === '' ? 0 : Math.max(0, parseFloat(value) || 0);
    setCounters((prev) => ({ ...prev, [id]: value === '' ? 0 : num }));
  };

  return (
    <ScrollView style={styles.content}>
      {participants.map((p) => (
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
          <View style={{ flex: 1 }} />
          <View style={{ flexDirection: 'row', alignItems: 'center', minWidth: 120 }}>
            <Text style={{ fontSize: 12, color: '#888', marginRight: 6 }}>No of Shares</Text>
            <TextInput
              style={styles.input}
              keyboardType="decimal-pad"
              value={String(counters[p.id] ?? 0)}
              onChangeText={(text) => handleCounterChange(p.id, text)}
              placeholder="0"
              textAlign="right"
              onFocus={(e) => {
                if (String(counters[p.id] ?? 0) === '0') {
                  // Clear the input when focused if value is 0
                  setCounters((prev) => ({ ...prev, [p.id]: 0 }));
                }
              }}
            />
          </View>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  content: { width: '100%', backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 10 },
  item: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  avatar: { width: 36, height: 36, borderRadius: 18, marginRight: 12 },
  avatarPlaceholder: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#e0e0e0', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  avatarText: { fontWeight: 'bold', color: '#00796b', fontSize: 18 },
  name: { fontSize: 16, color: '#222' },
  input: {
    borderBottomWidth: 1,
    borderColor: '#00796b',
    fontSize: 16,
    minWidth: 40,
    paddingVertical: 2,
    paddingHorizontal: 4,
    backgroundColor: 'transparent',
  },
});

export default PartsSplitView;