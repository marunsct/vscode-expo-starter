// filepath: /workspaces/vscode-expo-starter/expense-book/database/db.ts
import NetInfo from '@react-native-community/netinfo';
import * as SQLite from 'expo-sqlite';
import { syncPendingActions } from '../features/backend/syncDevicetoDB';
import SQliteQuery from './SQLiteQuery';
// Check if the 'openDatabaseSync' method is available in the current version of expo-sqlite
if (!SQLite.openDatabaseSync) {
  throw new Error("The 'openDatabaseSync' method is not available in the current version of expo-sqlite.");
}

// Open the database
export const db = SQLite.openDatabaseSync('expenseBook.db');

// Initialize the database
export const initializeDatabase = async () => {
  console.log('Initializing database...');
  try {
    // Check if the database is already initialized
    const queries = SQliteQuery;

    // Execute the queries
    for (const query of queries) {
      await db.execAsync(query);
    }
    console.log('Initializing database complete...');
  } catch (error) {
    console.error('Error initializing database:', error);

  }

};

// Save user to the database
export const saveUser = async (user: { id: string; username: string; first_name: string; last_name: string; email: string; gender: string; phone: string; country: string; profile_picture: string; date_of_birth: string; token: string }) => {
  console.log('Saving user to DB...', user);
  try {
    await db.withTransactionAsync(async () => {
      await db.runAsync(
        `INSERT OR REPLACE INTO users (userId , username,first_name,last_name,email,gender ,phone,country,profile_picture,date_of_birth, token) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        [user.id, user.username, user.first_name, user.last_name, user.email, user.gender, user.phone, user.country, user.profile_picture, user.date_of_birth, user.token]
      );
    });
    console.log('User saved to DB successfully');

  } catch (error) {
    console.error('Error saving user:', error);
  }
};

// Save friends to the database
export const saveFriends = async (friends: { id: string; first_name: string; last_name: string; username: string; phone: string; email: string }[]) => {
  await db.withTransactionAsync(async () => {
    for (const friend of friends) {
      await db.runAsync(
        `INSERT OR REPLACE INTO friends (userId, username, first_name, last_name, email, phone) VALUES (?, ?, ?,?,?,?);`,
        [friend.id, friend.username, friend.first_name, friend.last_name, friend.email, friend.phone]
      );
    }
  });
};
// Get friends from the database
// Export a constant function called getFriends that returns a Promise of an array of any type
export const getFriends = async (): Promise<any[]> => {
  // Initialize an empty array to store friends
  let friends: any[] = [];
  try {
    // Log a message to the console indicating that friends are being fetched from the DB
    console.log('Fetching friends from DB...');
    // Use a transaction to fetch all friends from the DB
    await db.withTransactionAsync(async () => {
      // Execute a SQL query to select all friends from the friends table
      const result = await db.getAllAsync(`SELECT * FROM friends;`);
      // Store the result in the friends array
      friends = result;
    });
  } catch (error) {
    console.error("Error fetching friends:", error);
  }
  console.log('Friends fetched:', friends.length);
  return friends;
};
export const saveBalance = async (balances: { user_id: string; currency: string; balance: number }[]) => {
  try {
    await db.withTransactionAsync(async () => {
      for (const balance of balances) {
        // Fetch the name from the friends table using the user_id
        const result:{name:string} = (await db.getFirstAsync(
          `SELECT first_name AS name FROM friends WHERE userId = ?;`,
          [balance.user_id]
        )) || { name: '' };

        const name = result.name || ''; // Default to 'Unknown' if no name is found

        // Insert or replace the balance with the fetched name
        await db.runAsync(
          `INSERT OR REPLACE INTO balance (userId, name, currency, balance) VALUES (?, ?, ?, ?);`,
          [balance.user_id, name, balance.currency, balance.balance]
        );
      }
    });
    console.log('Balances saved successfully');
  } catch (error) {
    console.error('Error saving balances:', error);
  }
};
export const getBalance = async (): Promise<{ totalBalance: { Amount: number; Currency: string }[]; userBalance: { id: string; name: string; balances: { currency: string; amount: number }[] }[] }> => {
  let balance: { totalBalance: { Amount: number; Currency: string }[]; userBalance: { id: string; name: string; balances: { currency: string; amount: number }[] }[] } = { totalBalance: [], userBalance: [] };
  try {
    await db.withTransactionAsync(async () => {
      const result = await db.getAllAsync(`SELECT * FROM balance;`) as { id: string; userId:string; name: string; currency: string; balance: number }[];
      balance = await convertToBalanceFormat(result) as { totalBalance: { Amount: number; Currency: string }[]; userBalance: { id: string; name: string; balances: { currency: string; amount: number }[] }[] };
    });
  } catch (error) {
    console.error("Error fetching balance:", error);
  }
  console.log('Balance fetched:', balance);
  return balance;
};

export const getUser = async (): Promise<any> => {
  let user = null;
  console.log('Fetching user from DB...');
  try {
    // await db.withTransactionAsync(async () => {
    const db = SQLite.openDatabaseSync('expenseBook.db');
    const result = await db.getFirstAsync(`SELECT * FROM users LIMIT 1;`);
    console.log('User fetched:', result);
    user = result || null;
    // });
    return user;
  } catch (error) {
    console.error("Error fetching user:", error);
  }
};

export const clearUserData = async () => {
  await db.withTransactionAsync(async () => {
    await db.execAsync(`DELETE FROM users;`);
    await db.execAsync(`DELETE FROM expenses;`);
    await db.execAsync(`DELETE FROM balance;`);
    console.log(await getUser());
    console.log('User data cleared');
  });
};

export const queueSyncAction = async (
  action: string,
  entity: string,
  url: string,
  options: any
) => {
  await db.runAsync(
    `INSERT INTO sync_queue (action, entity, url, options, created_at) VALUES (?, ?, ?, ?, ?);`,
    [action, entity, url, JSON.stringify(options), new Date().toISOString()]
  );
  // After queuing, try to sync if online
  const state = await NetInfo.fetch();
  if (state.isConnected) {
    await syncPendingActions();
  }
};

/**
 * Asynchronously saves an array of group objects.
 * 
 * Each group object in the array should have the following structure:
 * - `id`: A unique identifier for the group (string).
 * - `name`: The name of the group (string).
 * - `members`: An array of strings representing the members of the group.
 * 
 * @param {Array<{ id: string; name: string; members: string[] }>} groups - An array of group objects to be saved.
 * 
 * @returns {Promise<void>} A promise that resolves when the groups have been successfully saved.
 */
export const saveGroups = async (groups: { id: string; name: string; members: string[] }[]) => {};



/**
 * Converts an array of balance items to a format with separate arrays for
 * the total balance and the user balance.
 *
 * @param {Array<{ id: string; userId: string; name: string; currency: string; balance: number }>} data
 *   The array of balance items to convert.
 * @returns {{ totalBalance: { Amount: number; Currency: string }[]; userBalance: { id: string; name: string; balances: { currency: string; amount: number }[] }[] }}
 *   An object with two properties: `totalBalance` and `userBalance`. `totalBalance` is an array of objects
 *   with the properties `Amount` and `Currency`, representing the total balance broken down by currency.
 *   `userBalance` is an array of objects with the properties `id`, `name`, and `balances`, representing the
 *   balance broken down by user.
 */
const convertToBalanceFormat = async (data: { id: string; userId: string; name: string; currency: string; balance: number }[]) =>{
  // Group by user for userBalance
  const userMap: Record<string, { id: string; name: string; balances: { currency: string; amount: number }[] }> = {};
  // Group by currency for totalBalance
  const currencyMap: Record<string, number> = {};

  data.forEach(item => {
    // Build userBalance
    //console.log('Item:', item);
    if (!userMap[item.userId]) {
      userMap[item.userId] = { id: item.userId, name: item.name, balances: [] };
    }
    userMap[item.userId].balances.push({ currency: item.currency, amount: item.balance });

    // Build totalBalance
    if (!currencyMap[item.currency]) {
      currencyMap[item.currency] = 0;
    }
    currencyMap[item.currency] += item.balance;
    //console.log('Currency Map:', currencyMap);
  });

  const userBalance = Object.values(userMap);
  const totalBalance = Object.entries(currencyMap).map(([Currency, Amount]) => ({ Amount, Currency }));

  return { totalBalance, userBalance };
}