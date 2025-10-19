import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { DependencyMatrix } from '@har2lolicode/analyzer';

export interface AnalysisState {
  isAnalyzing: boolean;
  progress: number;
  results: {
    dependencyMatrix: DependencyMatrix | null;
    // other analysis results
  };
}

const initialState: AnalysisState = {
  isAnalyzing: false,
  progress: 0,
  results: {
    dependencyMatrix: null,
  },
};

export const analysisSlice = createSlice({
  name: 'analysis',
  initialState,
  reducers: {
    setAnalyzing: (state, action: PayloadAction<boolean>) => {
      state.isAnalyzing = action.payload;
    },
    setProgress: (state, action: PayloadAction<number>) => {
      state.progress = action.payload;
    },
    setAnalysisResults: (state, action: PayloadAction<AnalysisState['results']>) => {
      state.results = action.payload;
    },
  },
});

export const { setAnalyzing, setProgress, setAnalysisResults } = analysisSlice.actions;
export default analysisSlice.reducer;
