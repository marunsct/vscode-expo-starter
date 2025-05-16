import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchWithAuth } from '../../app/authContext';
import { getBalance, getFriends, saveBalance, saveFriends, saveGroups } from '../../database/db';
import { setFriends, setTotalExpenses } from '../context/contextSlice';

// Accept dispatch and user as arguments
// Function to fetch initial data from the API, including friends, balance, and groups
const fetchApiData = async (dispatch, user) => {
  try {
    // Log that the initial data is being fetched
    console.log('Fetching initial data...',user);
    // Get the last login date from AsyncStorage
    const lastLogin = await AsyncStorage.getItem('lastLogin') || '1990-01-01' ;
    // Log the last login date
    console.log('Last login:', lastLogin);
    // Update the last login date in AsyncStorage
    await AsyncStorage.setItem('lastLogin', new Date().toISOString());
    // Log the updated last login date
    console.log('Updated last login:', new Date().toISOString());

    // Fetch friends data
    fetchFriendsData(user, lastLogin, dispatch);
    // Fetch balance data
    fetchBalanceData(user, dispatch);
    // Fetch groups data
   // fetchGroupsData(user, lastLogin, dispatch);
  } catch (error) {
    // Log any errors that occur during the fetching process
    console.error('Error fetching initial data:', error);
  }
};

// Function to fetch friends data for all users
const fetchFriendsData = async (user, lastLogin, dispatch) => {
    try {
    // Fetch friends
    const friends = await getFriends();
    console.log('Fetched friends:', friends.length);
    if (friends.length > 0 && lastLogin !== null) {
      console.log('Fetching updated friends after:', lastLogin);
      // If there are friends and lastLogin is not null, fetch updated friends
      // after the last login date
      const response = await fetchWithAuth('/users/updated-after/' + lastLogin, { method: 'GET' });
      const data = await response.json();
      await saveFriends(data);
    } else {
      console.log('Fetching all friends');
      // If there are no friends or lastLogin is null, fetch all friends
      // and save them to the database
      const response = await fetchWithAuth('/users/updated-after/1990-01-01', { method: 'GET' });
      const data = await response.json();
      console.log('Response from fetch:', data.length);
      await saveFriends(await data);
    }
    dispatch(setFriends(await getFriends()));
  } catch (error) {
    console.error('Error fetching initial data:', error);
  }
}

// Function to fetch balance data for a user
const fetchBalanceData = async (user, dispatch) => {
  try {
    // Fetch balance data from the server
    const fetchBalanceSRV = await fetchWithAuth('/users/' + user.userId + '/balances', { method: 'GET' });
    // Check if the request was successful
    if (fetchBalanceSRV.ok) {
      // Parse the response as JSON
      const data = await fetchBalanceSRV.json();
      // Log the fetched balance data
      console.log('Fetched balance:', data.length, user.userId);
      // Check if there is any data
      if (data.length > 0) {
        // Save the balance data
        await saveBalance(data);
        // Dispatch the total expenses to the Redux store
        dispatch(setTotalExpenses(await getBalance()));
      }
    } else {
      // Log any errors that occur
      console.error('Error fetching balance: API error', fetchBalanceSRV);
    }
  } catch (error) {
    // Log any errors that occur
    console.error('Error fetching Balance data:', error);
  }
};

// Fetch groups data for a user .
// check for user.groups has any data
// if yes then fetch groups data from server update after lastLogin
// if no then fetch groups data from server and save to local storage
const fetchGroupsData = async (user, lastLogin, dispatch) => {
  try {
    // Fetch groups data from the server
    const fetchGroupsSRV = await fetchWithAuth('/users/' + user.userId + '/groups', { method: 'GET' });
    // Check if the request was successful
    if (fetchGroupsSRV.ok) {
      // Parse the response as JSON
      const data = await fetchGroupsSRV.json();
      // Log the fetched groups data
      console.log('Fetched groups:', data.length, user.userId);
      // Check if there is any data
      if (data.length > 0) {
        // Save the groups data
        await saveGroups(data);
        // Dispatch the total expenses to the Redux store
        dispatch(setTotalExpenses(await getBalance()));
      }
    } else {
      // Log any errors that occur
      console.error('Error fetching groups: API error', fetchGroupsSRV);
    }
  } catch (error) {
    // Log any errors that occur
    console.error('Error fetching Groups data:', error);
  }
};

// Export the fetchApiData function as the default export

export default fetchApiData;