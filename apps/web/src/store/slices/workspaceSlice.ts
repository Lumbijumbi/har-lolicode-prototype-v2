import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { SemanticHarEntry } from '@har2lolicode/parser';

export interface Workspace {
  id: string;
  name: string;
  harEntries: SemanticHarEntry[];
  createdAt: string;
}

export interface WorkspaceState {
  workspaces: Workspace[];
  currentWorkspace: Workspace | null;
}

const initialState: WorkspaceState = {
  workspaces: [],
  currentWorkspace: {
      id: '1',
      name: 'Sample Workspace',
      harEntries: [],
      createdAt: new Date().toISOString(),
  },
};

export const workspaceSlice = createSlice({
  name: 'workspace',
  initialState,
  reducers: {
    setWorkspace: (state, action: PayloadAction<Workspace>) => {
      state.currentWorkspace = action.payload;
    },
    setHarEntries: (state, action: PayloadAction<SemanticHarEntry[]>) => {
        if (state.currentWorkspace) {
            state.currentWorkspace.harEntries = action.payload;
        }
    }
  },
});

export const { setWorkspace, setHarEntries } = workspaceSlice.actions;
export default workspaceSlice.reducer;
