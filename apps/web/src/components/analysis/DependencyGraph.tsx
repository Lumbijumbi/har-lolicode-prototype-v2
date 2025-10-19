import React, { memo, useMemo } from 'react';
import type { SemanticHarEntry } from '@har2lolicode/parser';
import type { DependencyMatrix } from '@har2lolicode/analyzer';
import { Badge } from '@/components/ui/badge';

export interface DependencyGraphProps {
  entries: SemanticHarEntry[];
  matrix: DependencyMatrix;
  onNodeClick: (index: number) => void;
}

export const DependencyGraph = memo(({ entries, matrix, onNodeClick }: DependencyGraphProps) => {
  // Calculate dependencies from the adjacency matrix
  const dependencies = useMemo(() => {
    const deps: Array<{ fromIndex: number; toIndex: number; }> = [];
    for (let i = 0; i < matrix.adjacencyMatrix.length; i++) {
      for (let j = 0; j < matrix.adjacencyMatrix[i].length; j++) {
        if (matrix.adjacencyMatrix[i][j] === 1) {
          deps.push({ fromIndex: i, toIndex: j });
        }
      }
    }
    return deps;
  }, [matrix.adjacencyMatrix]);

  const getEntryLabel = (index: number) => {
    const entry = entries[index];
    if (!entry) return `Request #${index}`;
    try {
      const url = new URL(entry.request.url);
      return `${entry.request.method} ${url.pathname.split('/').pop() || '/'}`;
    } catch {
      return `${entry.request.method} Request #${index}`;
    }
  };



  return (
    <div className="border border-gold-primary/30 rounded-lg bg-gradient-to-br from-black to-gold-primary/5 p-6">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gold-primary flex items-center gap-2 mb-2">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
              d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Dependency Graph
        </h3>
        <p className="text-sm text-gray-400">
          Visualizing {dependencies.length} dependencies across {entries.length} requests
        </p>
      </div>

      {/* Critical Path */}
      {matrix.criticalPath && matrix.criticalPath.length > 0 && (
        <div className="mb-6 p-4 bg-black/50 rounded-lg border border-gold-primary/20">
          <h4 className="text-lg font-semibold text-gold-primary mb-3 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            Critical Path
          </h4>
          <div className="flex flex-wrap gap-2">
            {matrix.criticalPath.map((index, i) => (
              <div key={index} className="flex items-center gap-2">
                <button
                  onClick={() => onNodeClick(index)}
                  className="px-3 py-2 bg-gold-primary/20 hover:bg-gold-primary/30 rounded-md transition-colors duration-150 border border-gold-primary/50 text-sm"
                  title={entries[index]?.request.url}
                >
                  <span className="font-semibold text-gold-primary">#{index + 1}</span>
                  <span className="ml-2 text-gray-300">{getEntryLabel(index)}</span>
                </button>
                {i < matrix.criticalPath.length - 1 && (
                  <svg className="w-4 h-4 text-gold-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dependencies List */}
      <div className="p-4 bg-black/30 rounded-lg border border-gray-800">
        <h4 className="text-md font-semibold text-white mb-3 flex items-center gap-2">
          <Badge className="bg-blue-600 text-white">
            {dependencies.length}
          </Badge>
          Request Dependencies
        </h4>
        
        {dependencies.length > 0 ? (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {dependencies.map((dep, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-black/50 rounded-md hover:bg-black/70 transition-colors duration-150">
                <button
                  onClick={() => onNodeClick(dep.fromIndex)}
                  className="px-2 py-1 bg-blue-600/20 hover:bg-blue-600/30 rounded text-xs font-mono border border-blue-600/50 transition-colors duration-150"
                  title={`Source: ${entries[dep.fromIndex]?.request.url}`}
                >
                  #{dep.fromIndex + 1}
                </button>
                
                <div className="flex-1 flex items-center gap-2">
                  <svg className="w-4 h-4 text-gold-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                  <span className="text-sm text-gray-300 font-mono truncate">
                    {getEntryLabel(dep.fromIndex)} → {getEntryLabel(dep.toIndex)}
                  </span>
                </div>
                
                <button
                  onClick={() => onNodeClick(dep.toIndex)}
                  className="px-2 py-1 bg-green-600/20 hover:bg-green-600/30 rounded text-xs font-mono border border-green-600/50 transition-colors duration-150"
                  title={`Target: ${entries[dep.toIndex]?.request.url}`}
                >
                  #{dep.toIndex + 1}
                </button>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      {dependencies.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <h4 className="text-xl font-semibold text-gray-400 mb-2">No Dependencies Found</h4>
          <p className="text-sm text-gray-500">
            No request dependencies were detected in the current set of requests
          </p>
        </div>
      )}
    </div>
  );
});

DependencyGraph.displayName = 'DependencyGraph';
