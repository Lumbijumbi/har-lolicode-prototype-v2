'use client';

import React, { useState, useCallback, memo } from 'react';
import { useAppDispatch } from '@/store';
import { setHarEntries } from '@/store/slices/workspaceSlice';

export const HARUploader = memo(() => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dispatch = useAppDispatch();

  const processHARFile = useCallback(async (file: File) => {
    setIsProcessing(true);
    setError(null);

    try {
      const text = await file.text();
      const harData = JSON.parse(text);

      // Basic validation
      if (!harData.log || !harData.log.entries) {
        throw new Error('Invalid HAR file format');
      }

      // Convert HAR entries to semantic entries (simplified for now)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const semanticEntries = harData.log.entries.map((entry: any, index: number) => ({
        entryId: `entry-${index}`,
        timestamp: entry.startedDateTime,
        duration: entry.time,
        request: {
          method: entry.request.method,
          url: entry.request.url,
          headers: entry.request.headers || [],
          body: entry.request.postData ? {
            mimeType: entry.request.postData.mimeType,
            text: entry.request.postData.text,
            size: entry.request.bodySize || 0,
          } : null,
          cookies: entry.request.cookies || [],
          queryString: entry.request.queryString || [],
        },
        response: {
          status: entry.response.status,
          statusText: entry.response.statusText,
          headers: entry.response.headers || [],
          body: entry.response.content ? {
            mimeType: entry.response.content.mimeType,
            text: entry.response.content.text,
            size: entry.response.content.size || 0,
          } : null,
          cookies: entry.response.cookies || [],
        },
        tokens: [],
        dependencies: [],
      }));

      dispatch(setHarEntries(semanticEntries));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to parse HAR file';
      setError(errorMessage);
      console.error('Error processing HAR file:', err);
    } finally {
      setIsProcessing(false);
    }
  }, [dispatch]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    const harFile = files.find(f => f.name.endsWith('.har') || f.type === 'application/json');

    if (harFile) {
      await processHARFile(harFile);
    } else {
      setError('Please drop a valid HAR file');
    }
  }, [processHARFile]);

  const handleFileInput = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await processHARFile(file);
    }
  }, [processHARFile]);

  return (
    <div className="border border-gold-primary/30 rounded-lg bg-gradient-to-br from-black to-gold-primary/5 p-8">
      <h2 className="text-2xl font-bold text-gold-primary mb-4 flex items-center gap-2">
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        Upload HAR File
      </h2>

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-12 text-center transition-all duration-200 ${
          isDragging
            ? 'border-gold-primary bg-gold-primary/10 scale-105'
            : 'border-gray-700 hover:border-gold-primary/50'
        }`}
      >
        {isProcessing ? (
          <div className="space-y-4">
            <div className="loading-spinner mx-auto"></div>
            <p className="text-gray-400">Processing HAR file...</p>
          </div>
        ) : (
          <>
            <div className="text-6xl mb-4">📁</div>
            <p className="text-xl text-white mb-2">
              Drag and drop your HAR file here
            </p>
            <p className="text-sm text-gray-400 mb-6">
              or click to browse
            </p>
            <input
              type="file"
              accept=".har,application/json"
              onChange={handleFileInput}
              className="hidden"
              id="har-file-input"
            />
            <label htmlFor="har-file-input">
              <span className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-gold-primary hover:bg-gold-secondary text-black font-semibold px-8 py-3 cursor-pointer">
                Select HAR File
              </span>
            </label>
          </>
        )}
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-600/20 border border-red-600/50 rounded-lg">
          <p className="text-red-400 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </p>
        </div>
      )}

      <div className="mt-6 p-4 bg-blue-600/10 border border-blue-600/30 rounded-lg">
        <p className="text-sm text-blue-400 flex items-start gap-2">
          <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>
            <strong>How to export HAR files:</strong><br />
            Chrome: DevTools → Network → Right-click → "Save all as HAR with content"<br />
            Firefox: DevTools → Network → Settings icon → "Save All As HAR"
          </span>
        </p>
      </div>
    </div>
  );
});

HARUploader.displayName = 'HARUploader';
