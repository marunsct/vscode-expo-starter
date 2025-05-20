import { Ionicons } from '@expo/vector-icons';
import { Link, router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSelector } from 'react-redux';
// Update the import path below to the correct location of ThemeContext in your project
import { useTheme } from '../../../ThemeContext';
// If ThemeContext is located elsewhere, adjust the path accordingly, e.g.:
// import { useTheme } from '../../../common/ThemeContext';

// Helper to get currency symbol
const getCurrencySymbol = (currency: string) => {
  switch (currency) {
    case 'USD': return '$';
    case 'EUR': return '€';
    case 'CAD': return 'C$';
    case 'INR': return '₹';
    case 'GBP': return '£';
    case 'AUD': return 'A$';
    case 'JPY': return '¥';
    case 'CNY': return '¥';
    case 'CHF': return 'CHF';
    case 'NZD': return 'NZ$';
    case 'ZAR': return 'R';
    case 'BRL': return 'R$';
    case 'MXN': return '$';
    case 'SGD': return 'S$';
    case 'HKD': return 'HK$';
    case 'KRW': return '₩';
    case 'SEK': return 'kr';
    case 'NOK': return 'kr';
    case 'DKK': return 'kr';
    case 'PLN': return 'zł';
    case 'RUB': return '₽';
    case 'TRY': return '₺';
    case 'THB': return '฿';
    case 'IDR': return 'Rp';
    case 'MYR': return 'RM';
    case 'PHP': return '₱';
    case 'VND': return '₫';
    case 'EGP': return '£';
    case 'ARS': return '$';
    case 'CLP': return '$';
    case 'COP': return '$';
    case 'PEN': return 'S/.';
    case 'UYU': return '$U';
    default: return currency;
  }
};

export default function Friends() {
  const theme = useTheme();
  interface BalanceEntry {
    Amount: number;
    Currency: string;
  }

  interface UserBalance {
    id: string;
    name: string;
    balances: { currency: string; amount: number }[];
  }

  const [totBalance, settotBalance] = useState<{
    totalBalance: BalanceEntry[];
    userBalance: UserBalance[];
  }>({ totalBalance: [], userBalance: [] });
  const user = useSelector((state: any) => state.context.user);
  const Balance = useSelector((state: any) => state.context.totalExpenses);

  useEffect(() => {
    if (user) {
      console.log('User loaded in Friends:', user.userId);
    }
    settotBalance(Balance);
    console.log('Total balance loaded in Friends:', Balance);
  }, [Balance, user]);

  // Prepare "You Owe" and "You are Owed" lists
  const youOwe = totBalance.totalBalance
    ? totBalance.totalBalance.filter((entry) => entry.Amount < 0)
    : [];
  const youAreOwed = totBalance.totalBalance
    ? totBalance.totalBalance.filter((entry) => entry.Amount > 0)
    : [];

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.totalContainerRow}>
        {/* Left: Only "Total Balance" text */}
        <View style={styles.totalLabelContainerLeft}>
          <Text style={styles.totalLabelLeft}>Total Balance</Text>
        </View>
        {/* Right: You Owe & You are Owed stacked */}
        <View style={styles.rightBalancesContainer}>
          {youOwe.length > 0 && (
            <View style={{ marginBottom: youAreOwed.length > 0 ? 4 : 0 }}>
              {youOwe.map((entry) => (
                <Text
                  key={'owe-' + entry.Currency}
                  style={[
                    styles.totalType,
                    { color: theme.colors.accent, textAlign: 'right' },
                  ]}
                >
                  You Owe: {getCurrencySymbol(entry.Currency)} {Math.abs(entry.Amount)}
                </Text>
              ))}
            </View>
          )}
          {youAreOwed.length > 0 && (
            <View>
              {youAreOwed.map((entry) => (
                <Text
                  key={'owed-' + entry.Currency}
                  style={[
                    styles.totalType,
                    { color: theme.colors.primary, textAlign: 'right' },
                  ]}
                >
                  You are Owed: {getCurrencySymbol(entry.Currency)} {entry.Amount}
                </Text>
              ))}
            </View>
          )}
        </View>
      </View>
      <FlatList
        data={totBalance.userBalance}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.userItemContainer}>
            {/* Avatar: Use a placeholder circle if no image */}
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {item.name ? item.name.charAt(0).toUpperCase() : '?'}
              </Text>
            </View>
            <View style={styles.userNameContainer}>
              <Text style={[styles.userName, { color: theme.colors.textPrimary }]}>{item.name}</Text>
            </View>
            <View style={styles.userBalancesContainer}>
              {item.balances.map((bal) => (
                <View key={bal.currency} style={styles.balanceItem}>
                  <Text
                    style={[
                      styles.userAmount,
                      { color: bal.amount > 0 ? theme.colors.primary : theme.colors.accent },
                    ]}
                  >
                    {getCurrencySymbol(bal.currency)} {bal.amount > 0 ? `+${bal.amount}` : bal.amount}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}
        contentContainerStyle={styles.listContainer}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
      {/* Floating "+" button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => {
          console.log('Floating button pressed12');
          router.navigate('/friends/add-expense'); // absolute path!
        }}
      >
        <Ionicons name="add" size={32} color="#fff" style={{ alignSelf: 'center' }} />
      </TouchableOpacity>
      <Link href="/friends/add-expense" withAnchor>
        Go to post
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  totalContainerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    minHeight: 48,
  },
  totalLabelContainerLeft: {
    flex: 2,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  totalLabelLeft: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#444',
    textAlign: 'left',
  },
  rightBalancesContainer: {
    flex: 3,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  totalType: {
    fontSize: 15,
    fontWeight: '600',
    color: '#666',
  },
  listContainer: {
    paddingVertical: 0,
  },
  userItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 0,
    borderBottomWidth: 0.5, // reduced by 50%
    borderBottomColor: '#e0e0e0',
    backgroundColor: 'transparent',
  },
  avatar: {
    width: 50.4, // 36 * 1.4
    height: 50.4, // 36 * 1.4
    borderRadius: 25.2, // 18 * 1.4
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
  userNameContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  userBalancesContainer: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 4,
  },
  balanceItem: {
    marginLeft: 8,
  },
  userName: {
    fontSize: 16,
  },
  userAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  separator: {
    height: 0.5, // reduced by 50%
    backgroundColor: '#e0e0e0',
    marginLeft: 48, // aligns with text, not avatar
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 32,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2ecc40', // green
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5, // for Android shadow
    shadowColor: '#000', // for iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});