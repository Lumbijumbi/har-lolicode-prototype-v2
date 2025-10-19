import React from 'react';
import type { SemanticHarEntry } from '@har2lolicode/parser';
import type { DependencyMatrix } from '@har2lolicode/analyzer';

interface DependencyGraphProps {
  entries: SemanticHarEntry[];
  matrix: DependencyMatrix;
  onNodeClick: (index: number) => void;
}

export function DependencyGraph({ entries }: DependencyGraphProps) {
  return (
    <div className="p-4 border border-dashed border-gray-600 rounded-lg h-96">
      <h3 className="text-lg font-semibold text-white">Dependency Graph</h3>
      <p className="text-sm text-gray-400">
        Visualizing dependencies for {entries.length} entries.
      </p>
      <p className="text-xs text-gray-500 mt-2">(This is a placeholder component)</p>
    </div>
  );
}
