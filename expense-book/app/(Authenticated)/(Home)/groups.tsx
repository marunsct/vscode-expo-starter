import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSelector } from 'react-redux';
import { getCurrencySymbol } from '../../../features/helpers/currencyHelper';
import { useTheme } from '../../ThemeContext';

// Helper to get currency symbol
type Group = {
  id: string;
  name: string;
  balance: number;
  currency: string;
};

export default function Groups() {
  const theme = useTheme();
  const groups = useSelector((state: any) => state.context.groups);
  const [groupsData, setGroupsData] = useState<Group[]>([]);

 useEffect(() => {
  console.log('Group data:', groups);
   setGroupsData(groups);
 }, [groups]);

  // Render group item
  const renderGroup = ({ item }: any) => (
    <View style={styles.groupItemContainer}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {item.name ? item.name.charAt(0).toUpperCase() : '?'}
        </Text>
      </View>
      <View style={styles.groupNameContainer}>
        <Text style={[styles.groupName, { color: theme.colors.textPrimary }]}>{item.name}</Text>
      </View>
      <View style={styles.groupBalanceContainer}>
        <Text
          style={[
            styles.groupAmount,
            { color: item.balance > 0 ? '#2ecc40' : '#ff9800' }, // green if owed, orange if owe
          ]}
        >
          {item.balance > 0 ? 'You are Owed: ' : 'You Owe: '}
          {getCurrencySymbol(item.currency)} {Math.abs(item.balance)}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Groups</Text>
        <TouchableOpacity style={styles.addButton}>
          <Ionicons name="add" size={28} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>
      {/* Group List */}
      <FlatList
        data={groupsData}
        keyExtractor={(item) => item.id}
        renderItem={renderGroup}
        contentContainerStyle={styles.listContainer}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    minHeight: 48,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#444',
  },
  addButton: {
    padding: 6,
    borderRadius: 20,
  },
  listContainer: {
    paddingVertical: 0,
  },
  groupItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: '#e0e0e0',
    backgroundColor: 'transparent',
  },
  avatar: {
    width: 50.4,
    height: 50.4,
    borderRadius: 25.2,
    backgroundColor: '#bbb',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  groupNameContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  groupName: {
    fontSize: 16,
  },
  groupBalanceContainer: {
    alignItems: 'flex-end',
  },
  groupAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  separator: {
    height: 0.5,
    backgroundColor: '#e0e0e0',
    marginLeft: 48,
  },
});