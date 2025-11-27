import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export interface ListItem {
  itemId: string;
  text: string;
  completed: boolean;
  order: number;
}

export interface List {
  _id: string;
  listId: string;
  name: string;
  owner: string;
  collaborators: string[];
  items: ListItem[];
  archived: boolean;
  pinned: boolean;
  order?: number;
  createdAt: string;
  updatedAt: string;
}

interface ListsState {
  lists: List[];
  currentList: List | null;
  loading: boolean;
  error: string | null;
}

const initialState: ListsState = {
  lists: [],
  currentList: null,
  loading: false,
  error: null,
};

const listsSlice = createSlice({
  name: 'lists',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setLists: (state, action: PayloadAction<List[]>) => {
      state.lists = action.payload;
      state.loading = false;
      state.error = null;
    },
    setCurrentList: (state, action: PayloadAction<List | null>) => {
      state.currentList = action.payload;
      state.loading = false;
      state.error = null;
    },
    addList: (state, action: PayloadAction<List>) => {
      state.lists.unshift(action.payload);
    },
    updateList: (state, action: PayloadAction<List>) => {
      const index = state.lists.findIndex(list => list.listId === action.payload.listId);
      if (index !== -1) {
        state.lists[index] = action.payload;
      }
      if (state.currentList?.listId === action.payload.listId) {
        state.currentList = action.payload;
      }
    },
    deleteList: (state, action: PayloadAction<string>) => {
      state.lists = state.lists.filter(list => list.listId !== action.payload);
      if (state.currentList?.listId === action.payload) {
        state.currentList = null;
      }
    },
    clearLists: (state) => {
      state.lists = [];
      state.currentList = null;
      state.error = null;
    },
  },
});

export const {
  setLoading,
  setError,
  setLists,
  setCurrentList,
  addList,
  updateList,
  deleteList,
  clearLists,
} = listsSlice.actions;

export default listsSlice.reducer;
