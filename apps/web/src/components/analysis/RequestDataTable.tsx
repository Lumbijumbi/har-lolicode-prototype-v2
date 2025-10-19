import React, { memo, useMemo, useCallback } from 'react';
import type { SemanticHarEntry } from '@har2lolicode/parser';
import type { DependencyMatrix } from '@har2lolicode/analyzer';
import { Badge } from '@/components/ui/badge';

interface RequestDataTableProps {
  entries: SemanticHarEntry[];
  onEntryClick: (entry: SemanticHarEntry, index: number) => void;
  dependencyMatrix: DependencyMatrix | null;
}

interface RowProps {
  entry: SemanticHarEntry;
  index: number;
  onEntryClick: (entry: SemanticHarEntry, index: number) => void;
}

const Row = memo(({ entry, index, onEntryClick }: RowProps) => {
  
  const url = useMemo(() => {
    try {
      const parsedUrl = new URL(entry.request.url);
      return {
        hostname: parsedUrl.hostname,
        pathname: parsedUrl.pathname,
      };
    } catch {
      return {
        hostname: 'invalid',
        pathname: entry.request.url,
      };
    }
  }, [entry.request.url]);

  const statusColor = useMemo(() => {
    const status = entry.response.status;
    if (status >= 200 && status < 300) return 'bg-green-600';
    if (status >= 300 && status < 400) return 'bg-blue-600';
    if (status >= 400 && status < 500) return 'bg-yellow-600';
    return 'bg-red-600';
  }, [entry.response.status]);

  const methodColor = useMemo(() => {
    switch (entry.request.method) {
      case 'GET': return 'bg-blue-500';
      case 'POST': return 'bg-green-500';
      case 'PUT': return 'bg-yellow-500';
      case 'DELETE': return 'bg-red-500';
      case 'PATCH': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  }, [entry.request.method]);

  const handleClick = useCallback(() => {
    onEntryClick(entry, index);
  }, [entry, index, onEntryClick]);

  return (
    <div
      onClick={handleClick}
      className="cursor-pointer hover:bg-gold-primary/10 border-b border-gray-800 px-4 py-3 transition-colors duration-150 flex items-center gap-3"
      role="button"
      tabIndex={0}
      aria-label={`Request ${index + 1}: ${entry.request.method} ${entry.request.url}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleClick();
        }
      }}
    >
      <span className="text-xs text-gray-500 w-10 shrink-0">#{index + 1}</span>
      
      <Badge className={`${methodColor} text-white text-xs w-16 justify-center shrink-0`}>
        {entry.request.method}
      </Badge>
      
      <Badge className={`${statusColor} text-white text-xs w-12 justify-center shrink-0`}>
        {entry.response.status}
      </Badge>
      
      <div className="flex-1 min-w-0">
        <div className="text-sm text-white truncate" title={entry.request.url}>
          <span className="text-gold-primary">{url.hostname}</span>
          <span className="text-gray-300">{url.pathname}</span>
        </div>
      </div>
      
      <div className="text-xs text-gray-400 w-20 text-right shrink-0">
        {entry.duration.toFixed(0)}ms
      </div>
      
      <div className="text-xs text-gray-400 w-24 text-right shrink-0">
        {((entry.response.body?.size || 0) / 1024).toFixed(1)}KB
      </div>
    </div>
  );
});

Row.displayName = 'RequestTableRow';

export const RequestDataTable = memo(({ entries, onEntryClick, dependencyMatrix }: RequestDataTableProps) => {
  const dependencyCount = useMemo(() => {
    if (!dependencyMatrix) return 0;
    // Count dependencies from adjacency matrix
    let count = 0;
    for (let i = 0; i < dependencyMatrix.adjacencyMatrix.length; i++) {
      for (let j = 0; j < dependencyMatrix.adjacencyMatrix[i].length; j++) {
        if (dependencyMatrix.adjacencyMatrix[i][j] === 1) {
          count++;
        }
      }
    }
    return count;
  }, [dependencyMatrix]);

  if (entries.length === 0) {
    return (
      <div className="border border-gold-primary/30 rounded-lg p-8 bg-gradient-to-br from-black to-gold-primary/5 h-[600px] flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-xl font-semibold text-gold-primary mb-2">No Requests Found</h3>
          <p className="text-gray-400">Upload a HAR file to analyze network requests</p>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-gold-primary/30 rounded-lg bg-gradient-to-br from-black to-gold-primary/5 overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-black/50 border-b border-gold-primary/30">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-bold text-gold-primary flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Request Data Table
            </h3>
            <p className="text-sm text-gray-400 mt-1">
              Displaying {entries.length} requests
              {dependencyCount > 0 && ` · ${dependencyCount} dependencies detected`}
            </p>
          </div>
        </div>
      </div>

      {/* Column Headers */}
      <div className="bg-black/30 px-4 py-2 flex items-center gap-3 text-xs font-semibold text-gray-400 border-b border-gray-800">
        <span className="w-10 shrink-0">#</span>
        <span className="w-16 shrink-0">Method</span>
        <span className="w-12 shrink-0">Status</span>
        <span className="flex-1">URL</span>
        <span className="w-20 text-right shrink-0">Time</span>
        <span className="w-24 text-right shrink-0">Size</span>
      </div>

      {/* Request List with Smooth Scrolling */}
      <div className="h-[480px] overflow-y-auto">
        {entries.map((entry, index) => (
          <Row
            key={entry.entryId}
            entry={entry}
            index={index}
            onEntryClick={onEntryClick}
          />
        ))}
      </div>

      {/* Footer with hints */}
      <div className="p-3 bg-black/50 border-t border-gold-primary/30 text-xs text-gray-500">
        💡 Tip: Click on any request to view detailed information
      </div>
    </div>
  );
});

RequestDataTable.displayName = 'RequestDataTable';
