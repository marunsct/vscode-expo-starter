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
  const [counters, setCounters] = React.useState<{ [userId: string]: string }>({});

  React.useEffect(() => {
    // On mount or participants change, initialize counters from participants
    const initial: { [userId: string]: string } = {};
    participants.forEach((p) => {
      initial[p.id] = String(p.counter ?? 0);
    });
    setCounters(initial);
  }, [participants]);

  // Update setSelectedIds whenever counters change
React.useEffect(() => {
  const selected = participants
    .map((p) => ({
      ...p,
      counter: counters[p.id] !== undefined && counters[p.id] !== '' && !isNaN(Number(counters[p.id]))
        ? Number(counters[p.id])
        : 0,
    }))
    .filter((p) => p.counter && p.counter > 0);
  setSelectedIds(selected);
}, [counters, participants, setSelectedIds]);

  const handleCounterChange = (id: string, value: string) => {
    // Allow only numbers and a single decimal point, and up to two decimal places
    let sanitized = value.replace(/[^0-9.]/g, '');
    // Prevent more than one decimal point
    const parts = sanitized.split('.');
    if (parts.length > 2) {
      sanitized = parts[0] + '.' + parts.slice(1).join('');
    }
    // Limit to two decimal places
    if (parts[1]?.length > 2) {
      sanitized = parts[0] + '.' + parts[1].slice(0, 2);
    }
    setCounters((prev) => ({ ...prev, [id]: sanitized }));
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
            <Text style={{ fontSize: 10, color: '#888', marginRight: 6 }}>No of Shares</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric" // Use numeric for better compatibility
              value={String(counters[p.id] ?? 0)}
              onChangeText={(text) => handleCounterChange(p.id, text)}
              placeholder="0"
              textAlign="right"
              onFocus={e => {
                if (String(counters[p.id] ?? 0) === "0") {
                  setCounters(prev => ({ ...prev, [p.id]: "" }));
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
  content: { width: '100%', backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 10, paddingBottom: 20, maxHeight: '100%', marginTop: 2 },
  item: { flexDirection: 'row', alignItems: 'center', marginVertical: 10 },
  avatar: { width: 40, height: 40, borderRadius: 20, marginRight: 12 },
  avatarPlaceholder: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#e0e0e0', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  avatarText: { fontWeight: 'bold', color: '#00796b', fontSize: 18 },
  name: { fontSize: 16, color: '#222' },
  input: {
    borderBottomWidth: 1,
    borderColor: 'rgba(175, 255, 211, 0.64)',
    fontSize: 14,
    minWidth: 55,
    paddingVertical: 2,
    paddingHorizontal: 4,
    backgroundColor: 'transparent',
  },
});

export default PartsSplitView;