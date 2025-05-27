import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  getBalance,
  getFriend,
  getFriends,
  getUserGroupsWithBalance,
  saveBalance,
  saveExpenses,
  saveExpenseSplits,
  saveFriends,
  saveGroupMembers,
  saveGroups,
} from "../../database/db";
import { fetchWithAuth } from "../context/authContext";
import {
  setFriends,
  setGroups,
  setTotalExpenses,
} from "../context/contextSlice";

// Accept dispatch and user as arguments
// Function to fetch initial data from the API, including friends, balance, and groups
const fetchApiData = async (dispatch, user) => {
  try {
    // Log that the initial data is being fetched
    console.log("Fetching initial data...", user);
    // Get the last login date from AsyncStorage
    const lastLogin = (await AsyncStorage.getItem("lastLogin")) || "1990-01-01";
    // Log the last login date
    console.log("Last login:", lastLogin);
    // Update the last login date in AsyncStorage
    AsyncStorage.setItem("lastLogin", new Date().toISOString());
    // Log the updated last login date
    console.log("Updated last login:", new Date().toISOString());
    /*
    // Fetch all data and save it to the database
    fetchAllDataAndSave(user, lastLogin, dispatch).then(async (result) => {
      if (result) {
        console.log("Fetched balance data successfully");
        // Dispatch the total expenses to the Redux store
      } else {
        console.log("No balance data to fetch dispatching group to redux");
        const groups = await getUserGroupsWithBalance(parseInt(user.userId));
        console.log("Fetched groups data:", groups);
        dispatch(setGroups(groups));
      }
    });
    // Fetch friends data
    fetchFriendsData(user, lastLogin, dispatch);
    // Fetch balance data
    fetchBalanceData(user, dispatch);
*/
    console.log("Promise started");
    await Promise.all([
      fetchAllDataAndSave(user, lastLogin, dispatch),
      fetchFriendsData(user, lastLogin, dispatch),
      fetchBalanceData(user, dispatch),
    ]);
    console.log("Promise ended");
  } catch (error) {
    // Log any errors that occur during the fetching process
    console.error("Error fetching initial data:", error);
  }
};

// Function to fetch friends data for all users
const fetchFriendsData = async (user, lastLogin, dispatch) => {
  try {
    // Fetch friends
    const friends = await getFriend();
    console.log("Fetched friends:", friends.length);
    if (friends.length > 0 && lastLogin !== null) {
      console.log("Fetching updated friends after:", lastLogin);
      // If there are friends and lastLogin is not null, fetch updated friends
      // after the last login date
      const response = await fetchWithAuth(
        "/users/updated-after/" + lastLogin,
        { method: "GET" }
      );
      const data = await response.json();
      await saveFriends(data);
    } else {
      console.log("Fetching all friends");
      // If there are no friends or lastLogin is null, fetch all friends
      // and save them to the database
      const response = await fetchWithAuth("/users/updated-after/1990-01-01", {
        method: "GET",
      });
      const data = await response.json();
      console.log("Response from fetch:", data.length);
      await saveFriends(await data);
    }
    dispatch(setFriends(await getFriends()));
  } catch (error) {
    console.error("Error fetching initial data:", error);
  }
};

// Function to fetch balance data for a user
const fetchBalanceData = async (user, dispatch) => {
  try {
    // Fetch balance data from the server
    const fetchBalanceSRV = await fetchWithAuth(
      "/users/" + user.userId + "/balances",
      { method: "GET" }
    );
    // Check if the request was successful
    if (fetchBalanceSRV.ok) {
      // Parse the response as JSON
      const data = await fetchBalanceSRV.json();
      // Log the fetched balance data
      console.log("Fetched balance:", data.length, user.userId);
      // Check if there is any data
      if (data.length > 0) {
        // Save the balance data
        await saveBalance(data);
        // Dispatch the total expenses to the Redux store
        dispatch(setTotalExpenses(await getBalance()));
      }
    } else {
      // Log any errors that occur
      console.error("Error fetching balance: API error", fetchBalanceSRV);
    }
  } catch (error) {
    // Log any errors that occur
    console.error("Error fetching Balance data:", error);
  }
};

/**
 * Fetches all data for a user from the server and saves it to the
 * local database. The data is fetched after the last login date.
 *
 * @param {Object} user - The user object with the userId property.
 * @param {string} lastLogin - The last login date as a string in the
 *   format 'YYYY-MM-DD HH:MM:SS'.
 * @param {function} dispatch - The Redux dispatch function to
 *   dispatch the total expenses to the Redux store.
 */
// Function to fetch all data for a user from the server and save it to the local database
export const fetchAllDataAndSave = async (user, lastLogin, dispatch) => {
  try {
    // Fetch all data from the server
    const fetchAllSRV = await fetchWithAuth(
      "/users/" + user.userId + "/all-data-after/" + lastLogin,
      { method: "GET" }
    );
    // Check if the request was successful
    if (fetchAllSRV.ok) {
      // Parse the response as JSON
      const data = await fetchAllSRV.json();
      // Log the fetched all data
      console.log("Fetched all data:", user.userId);
      // Check if there is any data
      if (data.Groups.length > 0) {
        // Save the all data
        saveGroups(data.Groups)
          .then(async () => {
            console.log("Sending Groups data to redux");
            // Dispatch the Groups data to the Redux store
            dispatch(
              setGroups(await getUserGroupsWithBalance(parseInt(user.userId)))
            );
            console.log("Groups data sent to redux");
          })
          .catch((error) => {
            console.error("Error saving groups data:", error);
          });
      } else {
        console.log("No new groups data to save");
      }
      if (data.groupMembers.length > 0) {
        // Save the all data
        await saveGroupMembers(data.groupMembers);
      } else {
        console.log("No new group members data to save");
      }
      if (data.expenses.length > 0) {
        // Save the all data
        await saveExpenses(data.expenses);
      } else {
        console.log("No new expenses data to save");
      }
      if (data.expenseSplits.length > 0) {
        // Save the all data
        await saveExpenseSplits(data.expenseSplits);
      } else {
        console.log("No new expense splits data to save");
      }
      return true;
    } else {
      // Log any errors that occur
      console.log("No User Found: API error");
      dispatch(
        setGroups(await getUserGroupsWithBalance(parseInt(user.userId)))
      );
      return false;
    }
  } catch (error) {
    // Log any errors that occur
    console.error("Error fetching All data:", error);
    return false;
  }
};

// Export the fetchApiData function as the default export

export default fetchApiData;
