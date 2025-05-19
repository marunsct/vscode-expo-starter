import { setExpenses, setFriends, setGroups, setTotalExpenses, setUser } from './contextSlice';

export const setUserAndGetState = (user) => async (dispatch, getState) => {
  dispatch(setUser(user));
  return getState().context.user;
};

export const setFriendsAndGetState = (friends) => async (dispatch, getState) => {
  dispatch(setFriends(friends));
  return getState().context.friends;
};

export const setExpensesAndGetState = (expenses) => async (dispatch, getState) => {
  dispatch(setExpenses(expenses));
  return getState().context.expenses;
};

export const setTotalExpensesAndGetState = (totalExpenses) => async (dispatch, getState) => {
  dispatch(setTotalExpenses(totalExpenses));
  return getState().context.totalExpenses;
};

export const setGroupsAndGetState = (groups) => async (dispatch, getState) => {
  dispatch(setGroups(groups));
  return getState().context.groups;
}