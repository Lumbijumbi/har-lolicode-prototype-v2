import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface UIState {
  isSidebarOpen: boolean;
  theme: 'dark' | 'light';
  modal: {
    isOpen: boolean;
    content: string | null;
  };
}

const initialState: UIState = {
  isSidebarOpen: true,
  theme: 'dark',
  modal: {
    isOpen: false,
    content: null,
  },
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.isSidebarOpen = !state.isSidebarOpen;
    },
    setTheme: (state, action: PayloadAction<'dark' | 'light'>) => {
      state.theme = action.payload;
    },
    openModal: (state, action: PayloadAction<string>) => {
      state.modal.isOpen = true;
      state.modal.content = action.payload;
    },
    closeModal: (state) => {
      state.modal.isOpen = false;
      state.modal.content = null;
    },
  },
});

export const { toggleSidebar, setTheme, openModal, closeModal } = uiSlice.actions;
export default uiSlice.reducer;
