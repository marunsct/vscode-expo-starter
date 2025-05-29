import React from 'react';
import { Image, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

type Friend = {
  id: string;
  userId?: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  email?: string;
  phone?: string;
  profile_image?: string;
  amount?: number;
  counter?: number;
};

type CustomSplitViewProps = {
  participants: Friend[];
  currency: string;
  setSelectedIds: React.Dispatch<React.SetStateAction<Friend[]>>;
};

const CustomSplitView: React.FC<CustomSplitViewProps> = ({ participants, currency, setSelectedIds }) => {
  const [amounts, setAmounts] = React.useState<{ [userId: string]: string }>({});

  React.useEffect(() => {
    // Initialize amounts from participants
    const initial: { [userId: string]: string } = {};
    participants.forEach((p) => {
      initial[p.id] = p.amount !== undefined ? String(p.amount) : '0';
    });
    setAmounts(initial);
  }, [participants]);

  // Update setSelectedIds whenever amounts change
  React.useEffect(() => {
    const selected = participants
      .map((p) => ({
        ...p,
        amount:
          amounts[p.id] !== undefined &&
          amounts[p.id] !== '' &&
          !isNaN(Number(amounts[p.id]))
            ? Number(amounts[p.id])
            : 0,
      }))
      .filter((p) => p.amount && p.amount > 0);
    setSelectedIds(selected);
  }, [amounts, participants, setSelectedIds]);

  const handleAmountChange = (id: string, value: string) => {
    // Allow only numbers and a single decimal point, and up to two decimal places
    let sanitized = value.replace(/[^0-9.]/g, '');
    const parts = sanitized.split('.');
    if (parts.length > 2) {
      sanitized = parts[0] + '.' + parts.slice(1).join('');
    }
    if (parts[1]?.length > 2) {
      sanitized = parts[0] + '.' + parts[1].slice(0, 2);
    }
    setAmounts((prev) => ({ ...prev, [id]: sanitized }));
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
          <View style={{ flexDirection: 'row', alignItems: 'center', minWidth: 90 }}>
            <Text style={{ fontSize: 14, color: '#888', marginLeft: 6 }}>{currency}</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={String(amounts[p.id] ?? 0)}
              onChangeText={(text) => handleAmountChange(p.id, text)}
              placeholder="0"
              textAlign="right"
              onFocus={e => {
                if (String(amounts[p.id] ?? 0) === "0") {
                  setAmounts(prev => ({ ...prev, [p.id]: "" }));
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
  avatar: { width: 36, height: 36, borderRadius: 18, marginRight: 12 },
  avatarPlaceholder: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#e0e0e0', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  avatarText: { fontWeight: 'bold', color: '#00796b', fontSize: 18 },
  name: { fontSize: 16, color: '#222' },
  input: {
    borderBottomWidth: 1,
    borderColor: 'rgba(188, 87, 255, 0.51)',
    fontSize: 14,
    minWidth: 55,
    paddingVertical: 2,
    paddingHorizontal: 4,
    backgroundColor: 'transparent',
  },
});

export default CustomSplitView;