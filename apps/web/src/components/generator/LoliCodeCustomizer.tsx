import React, { memo, useState, useCallback, useMemo } from 'react';
import type { SemanticHarEntry } from '@har2lolicode/parser';
import type { DependencyMatrix } from '@har2lolicode/analyzer';
import type { LoliCodeConfig } from '@har2lolicode/generator';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface LoliCodeCustomizerProps {
  entries: SemanticHarEntry[];
  dependencyMatrix: DependencyMatrix;
  onGenerate: (config: LoliCodeConfig) => void;
}

interface CustomHeader {
  name: string;
  value: string;
}

// Placeholder interface for future feature
// interface Assertion {
//   type: 'status' | 'contains' | 'regex';
//   value: string;
// }

export const LoliCodeCustomizer = memo(({ entries, dependencyMatrix, onGenerate }: LoliCodeCustomizerProps) => {
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [useProxy, setUseProxy] = useState(true);
  const [followRedirects, setFollowRedirects] = useState(true);
  const [requestTimeout, setRequestTimeout] = useState(30);
  const [retryCount, setRetryCount] = useState(0);
  const [customHeaders, setCustomHeaders] = useState<CustomHeader[]>([]);
  // Placeholder for future features - assertions and variable extractions
  // const [assertions, setAssertions] = useState<Assertion[]>([]);
  // const [variableExtractions, setVariableExtractions] = useState<string[]>([]);
  // const [useCriticalPathOnly, setUseCriticalPathOnly] = useState(false);

  const availableIndices = useMemo(() => {
    return entries.map((_, i) => i);
  }, [entries]);

  const handleSelectAll = useCallback(() => {
    setSelectedIndices(availableIndices);
  }, [availableIndices]);

  const handleSelectNone = useCallback(() => {
    setSelectedIndices([]);
  }, []);

  const handleSelectCriticalPath = useCallback(() => {
    if (dependencyMatrix?.criticalPath) {
      setSelectedIndices(dependencyMatrix.criticalPath);
      // setUseCriticalPathOnly(true); // Commented out - for future use
    }
  }, [dependencyMatrix]);

  // Placeholder for future feature - manual index selection
  // const handleToggleIndex = useCallback((index: number) => {
  //   setSelectedIndices(prev => 
  //     prev.includes(index) 
  //       ? prev.filter(i => i !== index)
  //       : [...prev, index].sort((a, b) => a - b)
  //   );
  // }, []);

  const addCustomHeader = useCallback(() => {
    setCustomHeaders(prev => [...prev, { name: '', value: '' }]);
  }, []);

  const updateCustomHeader = useCallback((index: number, field: 'name' | 'value', value: string) => {
    setCustomHeaders(prev => {
      const updated = [...prev];
      updated[index][field] = value;
      return updated;
    });
  }, []);

  const removeCustomHeader = useCallback((index: number) => {
    setCustomHeaders(prev => prev.filter((_, i) => i !== index));
  }, []);

  // Placeholder for future features - assertions and variable extractions
  // const addAssertion = useCallback(() => {
  //   setAssertions(prev => [...prev, { type: 'status', value: '200' }]);
  // }, []);

  // const updateAssertion = useCallback((index: number, field: 'type' | 'value', value: string) => {
  //   setAssertions(prev => {
  //     const updated = [...prev];
  //     updated[index] = { ...updated[index], [field]: value };
  //     return updated;
  //   });
  // }, []);

  // const removeAssertion = useCallback((index: number) => {
  //   setAssertions(prev => prev.filter((_, i) => i !== index));
  // }, []);

  // const addVariableExtraction = useCallback(() => {
  //   setVariableExtractions(prev => [...prev, 'variableName']);
  // }, []);

  // const updateVariableExtraction = useCallback((index: number, value: string) => {
  //   setVariableExtractions(prev => {
  //     const updated = [...prev];
  //     updated[index] = value;
  //     return updated;
  //   });
  // }, []);

  // const removeVariableExtraction = useCallback((index: number) => {
  //   setVariableExtractions(prev => prev.filter((_, i) => i !== index));
  // }, []);

  const handleGenerate = useCallback(() => {
    const config: LoliCodeConfig = {
      selectedIndices: selectedIndices.length > 0 ? selectedIndices : availableIndices,
      settings: {
        useProxy,
        followRedirects,
        timeout: requestTimeout,
        retryCount,
      },
    };
    onGenerate(config);
  }, [selectedIndices, availableIndices, useProxy, followRedirects, requestTimeout, retryCount, onGenerate]);

  return (
    <div className="border border-gold-primary/30 rounded-lg bg-gradient-to-br from-black to-gold-primary/5 p-6 space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-xl font-bold text-gold-primary flex items-center gap-2 mb-2">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
              d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
          LoliCode Customizer
        </h3>
        <p className="text-sm text-gray-400">
          Configure generation options for {entries.length} requests
        </p>
      </div>

      {/* Request Selection */}
      <div className="space-y-3">
        <label className="text-sm font-semibold text-white flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          Request Selection
          <Badge  className="ml-auto border-gold-primary/50">
            {selectedIndices.length} / {entries.length}
          </Badge>
        </label>
        <div className="flex gap-2 flex-wrap">
          <Button 
            onClick={handleSelectAll} 
            
            
            className="border-gold-primary/50 hover:bg-gold-primary/10"
          >
            Select All
          </Button>
          <Button 
            onClick={handleSelectNone} 
            
            
            className="border-gray-600"
          >
            Select None
          </Button>
          {dependencyMatrix?.criticalPath && dependencyMatrix.criticalPath.length > 0 && (
            <Button 
              onClick={handleSelectCriticalPath} 
              
              
              className="border-blue-600 hover:bg-blue-600/10"
            >
              Critical Path Only
            </Button>
          )}
        </div>
      </div>

      {/* Settings */}
      <div className="space-y-3">
        <label className="text-sm font-semibold text-white flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Request Settings
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
            <input 
              type="checkbox" 
              checked={useProxy}
              onChange={(e) => setUseProxy(e.target.checked)}
              className="w-4 h-4 accent-gold-primary"
            />
            Use Proxy
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
            <input 
              type="checkbox" 
              checked={followRedirects}
              onChange={(e) => setFollowRedirects(e.target.checked)}
              className="w-4 h-4 accent-gold-primary"
            />
            Follow Redirects
          </label>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Timeout (seconds)</label>
            <input 
              type="number" 
              value={requestTimeout}
              onChange={(e) => setRequestTimeout(Math.max(1, parseInt(e.target.value) || 30))}
              className="w-full px-3 py-2 bg-black border border-gray-700 rounded-md text-white text-sm focus:border-gold-primary focus:outline-none"
              min="1"
              max="300"
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Retry Count</label>
            <input 
              type="number" 
              value={retryCount}
              onChange={(e) => setRetryCount(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-full px-3 py-2 bg-black border border-gray-700 rounded-md text-white text-sm focus:border-gold-primary focus:outline-none"
              min="0"
              max="10"
            />
          </div>
        </div>
      </div>

      {/* Custom Headers */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-white flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
            </svg>
            Custom Headers
            <Badge  className="border-gray-600">{customHeaders.length}</Badge>
          </label>
          <Button 
            onClick={addCustomHeader} 
            
            
            className="border-gold-primary/50 text-xs hover:bg-gold-primary/10"
          >
            + Add Header
          </Button>
        </div>
        {customHeaders.map((header, index) => (
          <div key={index} className="flex gap-2">
            <input 
              type="text"
              placeholder="Header Name"
              value={header.name}
              onChange={(e) => updateCustomHeader(index, 'name', e.target.value)}
              className="flex-1 px-3 py-2 bg-black border border-gray-700 rounded-md text-white text-sm focus:border-gold-primary focus:outline-none"
            />
            <input 
              type="text"
              placeholder="Header Value"
              value={header.value}
              onChange={(e) => updateCustomHeader(index, 'value', e.target.value)}
              className="flex-1 px-3 py-2 bg-black border border-gray-700 rounded-md text-white text-sm focus:border-gold-primary focus:outline-none"
            />
            <Button 
              onClick={() => removeCustomHeader(index)}
              
              
              className="border-red-600 text-red-500 hover:bg-red-600/10 shrink-0"
            >
              ✕
            </Button>
          </div>
        ))}
      </div>

      {/* Generate Button */}
      <Button 
        onClick={handleGenerate} 
        className="w-full bg-gold-primary hover:bg-gold-secondary text-black font-semibold py-6 text-lg transition-all duration-200 hover-lift"
        disabled={selectedIndices.length === 0 && availableIndices.length > 0}
      >
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
            d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        Generate LoliCode Script
      </Button>

      <p className="text-xs text-gray-500 text-center">
        💡 Tip: Select specific requests or use the critical path for optimized scripts
      </p>
    </div>
  );
});

LoliCodeCustomizer.displayName = 'LoliCodeCustomizer';
