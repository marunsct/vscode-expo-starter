import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: {},
  friends : [],
  expenses :[],
  expense: {},
  expense_id: [],
  groups:[],
  group: {},
  group_images: [],
  totalExpenses: {},
  expenseBetweenUsers:[],
  addExpense: {
    createdBy: "",
    description :"",
    amount: "",
    date: "",
    group:[],
    friends: [],
    image: "",
  },
}

export const fetchContext = createSlice({
  name: 'context',
  initialState,
  reducers: {
    setUser: (state, action) => {
        state.user = action.payload;
        console.log("user in slice", state.user.userId);
    },
    setFriends: (state, action) => {
      state.friends = action.payload;
    },
    setExpenses: (state, action) => {
      state.expenses = action.payload;
    },
    setTotalExpenses: (state, action) => {
      state.totalExpenses = action.payload;
    },
    setGroups: (state, action) => {
      console.log("groups in slice", action.payload);
      state.groups = action.payload;
    },
    setAddExpense: (state, action) => {
      console.log("add expense in slice", action.payload);
      state.addExpense = action.payload;
    }
  },
})

// Action creators are generated for each case reducer function
export const {setExpenses, setFriends, setTotalExpenses, setUser, setGroups, setAddExpense } = fetchContext.actions

export default fetchContext.reducer