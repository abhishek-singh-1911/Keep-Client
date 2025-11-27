import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface UIState {
  sidebarOpen: boolean;
  searchQuery: string;
  viewMode: 'grid' | 'list';
  activeView: 'notes' | 'archived' | 'collaborated';
}

const initialState: UIState = {
  sidebarOpen: true,
  searchQuery: '',
  viewMode: 'grid',
  activeView: 'notes',
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setViewMode: (state, action: PayloadAction<'grid' | 'list'>) => {
      state.viewMode = action.payload;
    },
    setActiveView: (state, action: PayloadAction<'notes' | 'archived' | 'collaborated'>) => {
      state.activeView = action.payload;
    },
  },
});

export const { toggleSidebar, setSidebarOpen, setSearchQuery, setViewMode, setActiveView } = uiSlice.actions;
export default uiSlice.reducer;
