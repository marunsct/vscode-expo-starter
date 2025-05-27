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
   
      await db.runAsync(
        `INSERT OR REPLACE INTO users (userId , username,first_name,last_name,email,gender ,phone,country,profile_picture,date_of_birth, token) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        [user.id, user.username, user.first_name, user.last_name, user.email, user.gender, user.phone, user.country, user.profile_picture, user.date_of_birth, user.token]
      );
  
    console.log('User saved to DB successfully');

  } catch (error) {
    console.error('Error saving user:', error);
  }
};

// Save friends to the database
export const saveFriends = async (friends: { id: string; first_name: string; last_name: string; username: string; phone: string; email: string }[]) => {

    for (const friend of friends) {
      await db.runAsync(
        `INSERT OR REPLACE INTO friends (userId, username, first_name, last_name, email, phone) VALUES (?, ?, ?,?,?,?);`,
        [friend.id, friend.username, friend.first_name, friend.last_name, friend.email, friend.phone]
      );
    }
 
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
   
      // Execute a SQL query to select all friends from the friends table
      const result = await db.getAllAsync(`SELECT * FROM friends;`);
      // Store the result in the friends array
      friends = result;
 
  } catch (error) {
    console.error("Error fetching friends:", error);
  }
  console.log('Friends fetched:', friends.length);
  return friends;
};

export const getFriend = async (): Promise<any[]> => {
  // Initialize an empty array to store friends
  let friends: any[] = [];
  try {
    // Log a message to the console indicating that friends are being fetched from the DB
    console.log('Fetching friends from DB...');
    // Use a transaction to fetch all friends from the DB
   
      // Execute a SQL query to select all friends from the friends table
      const result = await db.getFirstAsync(`SELECT * FROM friends;`);
      // Store the result in the friends array
      friends = [result];

  } catch (error) {
    console.error("Error fetching friends:", error);
  }
  console.log('Friends fetched:', friends.length);
  return friends;
};
export const saveBalance = async (balances: { user_id: string; currency: string; balance: number }[]) => {
  try {
    
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
   
    console.log('Balances saved successfully');
  } catch (error) {
    console.error('Error saving balances:', error);
  }
};
export const getBalance = async (): Promise<{ totalBalance: { Amount: number; Currency: string }[]; userBalance: { id: string; name: string; balances: { currency: string; amount: number }[] }[] }> => {
  let balance: { totalBalance: { Amount: number; Currency: string }[]; userBalance: { id: string; name: string; balances: { currency: string; amount: number }[] }[] } = { totalBalance: [], userBalance: [] };
  try {
  
      const result = await db.getAllAsync(`SELECT * FROM balance;`) as { id: string; userId:string; name: string; currency: string; balance: number }[];
      balance = await convertToBalanceFormat(result) as { totalBalance: { Amount: number; Currency: string }[]; userBalance: { id: string; name: string; balances: { currency: string; amount: number }[] }[] };
   
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
    try {
    await db.runAsync(`DELETE FROM users;`);
      console.log('User data cleared');
    await db.runAsync(`DELETE FROM expenses;`);
      console.log('Expense data cleared');
    await db.runAsync(`DELETE FROM balance;`);
    console.log('Balance data cleared');
    await db.runAsync(`DELETE FROM groups;`);
    console.log('Group data cleared');
    await db.runAsync(`DELETE FROM group_members;`);
    console.log('Group Members data cleared');
    await db.runAsync(`DELETE FROM friends;`);
    console.log('Friends data cleared');
    await db.runAsync(`DELETE FROM sync_queue;`);
    await db.runAsync(`DELETE FROM expense_splits;`);
    console.log(await getUser());
    console.log('User data cleared');
    } catch (error) {
      console.error('Error clearing data', error);
    }

 
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
export const saveGroups = async (
  groups: {
    id: number;
    name: string;
    currency: string;
    created_by: number;
    created_at: string;
    updated_by: number;
    updated_at: string;
    delete_flag: boolean;
    deleted_at: string | null;
  }[]
) => {
  try {
      for (const group of groups) {
        await db.runAsync(
          `INSERT OR REPLACE INTO groups (
            groupId, name, currency, created_by, created_at, updated_by, updated_at, is_deleted, deleted_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
          [
            group.id,
            group.name,
            group.currency,
            group.created_by,
            group.created_at,
            group.updated_by,
            group.updated_at,
            group.delete_flag ? 1 : 0, // convert to 1/0
            group.deleted_at,
          ]
        );
      }
    console.log('Group(s) saved successfully');
  } catch (error) {
    console.error('Error saving group(s):', error);
  }
};

export const saveGroupMembers = async (
  groupMembers: {
    id: number;
    group_id: number;
    user_id: number;
    first_name: string;
    last_name: string;
    username: string;
    email: string;
    phone: string;
    joined_at: string;
    delete_flag: boolean;
    deleted_at?: string | null;
    created_by?: number;
  }[]
) => {
  try {
      for (const member of groupMembers) {
        await db.runAsync(
          `INSERT OR REPLACE INTO group_members (
            member_id, groupId, userId, first_name, last_name, username, email, phone, created_by, joined_at, is_deleted, deleted_at
          ) VALUES (?,?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
          [
            member.id,
            member.group_id,
            member.user_id,
            member.first_name,
            member.last_name,
            member.username,
            member.email,
            member.phone,
            member.created_by ?? null,
            member.joined_at,
            member.delete_flag ? 1 : 0, // convert to 1/0
            member.deleted_at ?? null,
          ]
        );
      }
    console.log('Group member(s) saved successfully');
  } catch (error) {
    console.error('Error saving group member(s):', error);
  }
};

export const saveExpenses = async (
  expense:
    | {
        id: number;
        description: string;
        currency: string;
        amount: number;
        group_id: number;
        split_method: string;
        paid_by_user: number;
        image_url: string | null;
        flag: boolean;
        created_by: number;
        created_at: string;
        updated_by: number;
        updated_at: string;
        delete_flag: boolean;
        deleted_at: string | null;
      }
    | {
        id: number;
        description: string;
        currency: string;
        amount: number;
        group_id: number;
        split_method: string;
        paid_by_user: number;
        image_url: string | null;
        flag: boolean;
        created_by: number;
        created_at: string;
        updated_by: number;
        updated_at: string;
        delete_flag: boolean;
        deleted_at: string | null;
      }[]
) => {
  const expenses = Array.isArray(expense) ? expense : [expense];
  try {
      for (const exp of expenses) {
        await db.runAsync(
          `INSERT OR REPLACE INTO expenses (
            expenseId, description, currency, amount, groupId, split_method, paid_by, image_url, is_settled, created_by, created_at, updated_by, updated_at, is_deleted, deleted_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
          [
            exp.id,
            exp.description,
            exp.currency,
            exp.amount,
            exp.group_id,
            exp.split_method,
            exp.paid_by_user,
            exp.image_url,
            exp.flag ? 1 : 0, // convert to 1/0
            exp.created_by,
            exp.created_at,
            exp.updated_by,
            exp.updated_at,
            exp.delete_flag ? 1 : 0, // convert to 1/0
            exp.deleted_at,
          ]
        );
      }
    console.log('Expense(s) saved successfully');
  } catch (error) {
    console.error('Error saving expense(s):', error);
  }
};

export const saveExpenseSplits = async (
  expenseSplits: {
    id: number;
    expense_id: number;
    user_id: number;
    paid_to_user: number;
    share: number;
    counter: number;
    flag: boolean;
    created_at: string;
    updated_by: number;
    updated_at: string;
    delete_flag: boolean;
    deleted_at: string | null;
  }[]
) => {
  try {
      for (const split of expenseSplits) {
        await db.runAsync(
          `INSERT OR REPLACE INTO expense_splits (
            split_id, expenseId, userId, paid_to_user, amount, counter, is_settled, created_at, updated_by, updated_at, is_deleted, deleted_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
          [
            split.id,
            split.expense_id,
            split.user_id,
            split.paid_to_user,
            split.share,
            split.counter,
            split.flag ? 1 : 0, // convert to 1/0
            split.created_at,
            split.updated_by,
            split.updated_at,
            split.delete_flag ? 1 : 0, // convert to 1/0
            split.deleted_at,
          ]
        );
      }
    console.log('Expense split(s) saved successfully');
  } catch (error) {
    console.error('Error saving expense split(s):', error);
  }
};

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

/**
 * Fetch all groups from the database.
 * @returns {Promise<any[]>} Array of group objects.
 */
export const getGroups = async (): Promise<any[]> => {
  let groups: any[] = [];
  try {
 
      const result = await db.getAllAsync(`SELECT * FROM groups;`);
      groups = result;

  } catch (error) {
    console.error('Error fetching groups:', error);
  }
  return groups;
};

/**
 * Fetch all group members for a given groupId.
 * @param {number} groupId - The group ID to fetch members for.
 * @returns {Promise<any[]>} Array of group member objects.
 */
export const getGroupMembers = async (groupId: number): Promise<any[]> => {
  let members: any[] = [];
  console.log('Fetching group members for groupId and friends table');
  try {
 // Join group_members with users to get all required fields
    const result = await db.getAllAsync(
      `SELECT
          u.id,
          u.userId,
          u.first_name,
          u.last_name,
          u.username,
          u.email,
          u.phone,
          "" as profile_picture
        FROM group_members gm
        INNER JOIN friends u ON gm.userId = u.userId
        WHERE gm.groupId = ? AND gm.is_deleted = 0;`,
      [groupId]
    );
    members = result;
    console.log('Group members fetched:');
  } catch (error) {
    console.error('Error fetching group members:', error);
  }
  return members;
};

/**
 * Fetch all expenses for a given groupId.
 * @param {number} groupId - The group ID to fetch expenses for.
 * @returns {Promise<any[]>} Array of expense objects.
 */
export const getExpenses = async (groupId: number): Promise<any[]> => {
  let expenses: any[] = [];
  try {
   
      const result = await db.getAllAsync(
        `SELECT * FROM expenses WHERE groupId = ?;`,
        [groupId]
      );
      expenses = result;
   
  } catch (error) {
    console.error('Error fetching expenses:', error);
  }
  return expenses;
};

/**
 * Fetch all expense splits for a given expenseId.
 * @param {number} expenseId - The expense ID to fetch splits for.
 * @returns {Promise<any[]>} Array of expense split objects.
 */
export const getExpenseSplits = async (expenseId: number): Promise<any[]> => {
  let splits: any[] = [];
  try {
  
      const result = await db.getAllAsync(
        `SELECT * FROM expense_splits WHERE expenseId = ?;`,
        [expenseId]
      );
      splits = result;
   
  } catch (error) {
    console.error('Error fetching expense splits:', error);
  }
  return splits;
};

/**
 * Fetch all expenses between two users, with splits for each expense.
 * @param {number} userA - First user ID.
 * @param {number} userB - Second user ID.
 * @returns {Promise<any[]>} Array of { ...expense, splits: [expenseSplit, ...] }
 */
export const getExpensesBetweenUsers = async (userA: number, userB: number): Promise<any[]> => {
  let expensesWithSplits: any[] = [];
  try {
   
      // Get all expenses where both users are involved in splits
      const expenses: any[] = await db.getAllAsync(
        `SELECT DISTINCT e.*
         FROM expenses e
         JOIN expense_splits s1 ON e.expenseId = s1.expenseId
         JOIN expense_splits s2 ON e.expenseId = s2.expenseId
         WHERE s1.userId = ? AND s2.userId = ?;`,
        [userA, userB]
      );

      for (const expense of expenses) {
        // Get all splits for this expense
        const splits = await db.getAllAsync(
          `SELECT * FROM expense_splits WHERE expenseId = ?;`,
          [expense.expenseId]
        );
        expensesWithSplits.push({
          ...expense,
          splits,
        });
      }
   
  } catch (error) {
    console.error('Error fetching expenses between users:', error);
  }
  return expensesWithSplits;
};

export const deleteAllTables = async () => {
  const tables = [
    'users',
    'friends',
    'balance',
    'expenses',
    'sync_queue',
    'groups',
    'group_members',
    'expense_splits'
  ];
  try {
    
      for (const table of tables) {
        await db.execAsync(`DROP TABLE IF EXISTS ${table};`);
      }
 
    console.log('All tables deleted successfully');
  } catch (error) {
    console.error('Error deleting tables:', error);
  }
};

/**
 * Fetch groups for a user and calculate their total balance in each group.
 * Only includes groups and group memberships that are not deleted,
 * and only considers expenses/splits that are not deleted or settled.
 *
 * @param userId The user's ID
 * @returns Array of groups with { id, name, currency, balance }
 */
export const getUserGroupsWithBalance = async (userId: number): Promise<
  { id: string; name: string; balance: number; currency: string }[]
> => {
  try {

    console.log("before selecting groups",userId);
    // 1. Get all groups where user is a member and not deleted
    const groups: { id: string; name: string; currency: string }[] = await db.getAllAsync(
      `SELECT g.groupId AS id, g.name, g.currency
       FROM groups g
       INNER JOIN group_members gm ON g.groupId = gm.groupId
       WHERE  gm.userId = ? AND g.is_deleted = 0 AND gm.is_deleted = 0;`,
      [userId]
    );
    //console.log('Groups:', groups);
    // Initialize result array
    const result: { id: string; name: string; balance: number; currency: string }[] = [];

    for (const group of groups) {
      // 2. Get all expenses for this group that are not deleted or settled
      const expenses: { expenseId: number; amount: number; currency: string; paid_by: number }[] = await db.getAllAsync(
        `SELECT expenseId, amount, currency, paid_by
         FROM expenses
         WHERE groupId = ? AND is_deleted = 0 AND is_settled = 0`,
        [group.id]
      );
    //console.log('Expenses:', expenses);
      let balance = 0;

      for (const expense of expenses) {
        // 3. Get all splits for this expense that are not deleted or settled
        const splits: { userId: number; paid_to_user: number; amount: number }[] = await db.getAllAsync(
          `SELECT userId, paid_to_user, amount
           FROM expense_splits
           WHERE expenseId = ? AND is_deleted = 0 AND is_settled = 0
           AND userId != paid_to_user AND (userId = ? OR paid_to_user = ?)`,
          [expense.expenseId, userId, userId]
        );

       // console.log('Splits:', splits);
        // 4. Calculate user's share and paid amount for this expense
        splits.forEach((s) => { 
          if (s.userId === userId) {
            balance -= s.amount;
            //console.log('User owes:', s.amount);
          }else if (s.paid_to_user === userId) {
            balance += s.amount;
           // console.log('User is owed:', s.amount);
          }
        });
        // User's net for this expense: paid - share
        //balance += paidByUser - userShare;
      }

      result.push({
        id: String(group.id),
        name: group.name,
        balance,
        currency: group.currency,
      });
    }
    console.log(result);
    return result;
  } catch (error) {
    console.error('Error fetching user groups with balance:', error);
    return [];
  }
};