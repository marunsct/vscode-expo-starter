// authContext.tsx
// tokenUtils.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
const baseUrl = 'https://expensebook-rea1.onrender.com'; // Replace with your actual base URL
const getToken = async () => {
  const token = await AsyncStorage.getItem('token');
  return token;
};

const setToken = async (token: string) => {
  AsyncStorage.setItem('token', token);
  await getApiKey(token);

  console.log('Token and API key set successfully');
};

/**
 * Makes a request to the API to retrieve an API key for the given token.
 * The token must be a valid authentication token.
 * @param {string} token The authentication token to use for the request.
 * @returns {Promise<string>} The API key for the given token.
 */
const getApiKey = async (token: string) => {

  const localApiKey = await AsyncStorage.getItem('apiKey');
  if (!localApiKey) {
    const response = await fetch(baseUrl + '/api-keys/retrieve', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ consumer_name: "MobileApp" }),
    });
    const { apiKey } = await response.json();
    AsyncStorage.setItem('apiKey', apiKey);
    return apiKey;
  } else {
    console.log('API key already exists in local storage');
    return localApiKey;
  }
};

const removeToken = async () => {
  await AsyncStorage.removeItem('token');
  await AsyncStorage.removeItem('apiKey');
  await AsyncStorage.removeItem('lastLogin');
  console.log('Token and API key removed successfully');
}

const getLocalApiKey = async () => {
  const apiKey = await AsyncStorage.getItem('apiKey');
  if (!apiKey) {
    // throw new Error('API key not found in local storage');
  }
  return apiKey;
}

/**
 * Generates authentication headers for API requests.
 * 
 * @returns {Promise<{ 'Content-Type': string, Authorization: string, 'x-api-key': string | null }>} 
 * An object containing the content type, authorization token, and API key.
 */

const authHeaders = async () => {
  const token = await getToken();
  const apiKey = await AsyncStorage.getItem('apiKey');
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
    'x-api-key': apiKey,
  };
}
/**
 * Makes a request to the given url with authentication headers.
 * @param {string} url The url to make the request to.
 * @param {RequestInit} options The request options.
 * @returns {Promise<Response>} The response from the server.
 */
const fetchWithAuth = async (url: string, options: RequestInit) => {
  const token = await getToken();
  //console.log('Token:', token);
  if (!token) {
    throw new Error('No authentication token found. Please log in.');
  }
  const apiKey = await getApiKey(token);
  const optionsReq = {
    ...options,
    headers: {
      ...options.headers,
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      'x-api-key': apiKey ?? ''
    },
  }
  //console.log('Options:', optionsReq);
  return fetch( (baseUrl + url), optionsReq);
};

/**
 * Makes a request to the given url without any authentication headers.
 * @param {string} url The url to make the request to.
 * @param {RequestInit} options The request options.
 * @returns {Promise<Response>} The response from the server.
 */
const fetchWithoutAuth = async (url: string, options: RequestInit) => {
  return fetch(baseUrl + url, {
    ...options,
    headers: {
      ...options.headers,
      'Content-Type': 'application/json',
    },
  });
};

const fetchWithTimeout = async (url: string, options: RequestInit) => {
  const timeout = 15000; // 15 seconds
  const timeoutError = 45000; // 45 seconds

  const controller = new AbortController();
  const signal = controller.signal;

  const timeoutId = setTimeout(() => {
    if (timeoutError) {
      Alert.alert('Error', 'Unable to connect to server. Please try again.');
      controller.abort();
    }
  }, timeoutError);

  const timeoutWarningId = setTimeout(() => {
    if (timeout) {
      Alert.alert('Warning', 'Taking more time than expected. Please wait...');
    }
  }, timeout);

  try {
    const response = await fetch(url, { ...options, signal });
    clearTimeout(timeoutId);
    clearTimeout(timeoutWarningId);
    return response;
  } catch (error: any) {
    if (error.name === 'AbortError') {
      throw error;
    }
    throw error;
  }
};

export { authHeaders, fetchWithAuth, fetchWithoutAuth, fetchWithTimeout, getApiKey, getLocalApiKey, getToken, removeToken, setToken };
// This function fetches the API key from the server using the token
// and stores it in local storage. It is called when the token is set.
// The API key is used for making authenticated requests to the server.
// The API key is stored in local storage for later use.
// The API key is used for making authenticated requests to the server.