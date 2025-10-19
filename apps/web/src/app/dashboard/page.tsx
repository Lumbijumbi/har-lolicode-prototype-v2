/**
 * @fileoverview Main dashboard page with integrated HAR analysis
 * @module @har2lolicode/ui
 */

'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useAppSelector } from '@/store';
import { applyFilters } from '@har2lolicode/filter';
import { buildDependencyMatrix } from '@har2lolicode/analyzer';
import { generateLoliCode } from '@har2lolicode/generator';
import type { SemanticHarEntry } from '@har2lolicode/parser';
import type { LoliCodeConfig } from '@har2lolicode/generator';

// Components
import { FilterManager } from '@/components/filter/FilterManager';
import { RequestDataTable } from '@/components/analysis/RequestDataTable';
import { RequestDetailModal } from '@/components/analysis/RequestDetailModal';
import { TokenDetectionPanel } from '@/components/analysis/TokenDetectionPanel';
import { LoliCodeCustomizer } from '@/components/generator/LoliCodeCustomizer';
import { LoliCodePreview } from '@/components/generator/LoliCodePreview';
import { DependencyGraphLazy } from '@/components/analysis/DependencyGraphLazy';
import { HARUploader } from '@/components/upload/HARUploader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';

export default function DashboardPage() {
  // Redux state
  const { currentWorkspace } = useAppSelector(state => state.workspace);
  const filterState = useAppSelector(state => state.filter);

  // Local state
  const [selectedEntry, setSelectedEntry] = useState<SemanticHarEntry | null>(null);
  const [selectedEntryIndex, setSelectedEntryIndex] = useState<number>(-1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'requests' | 'dependencies' | 'generator'>('requests');

  // Get HAR entries from workspace
  const harEntries = currentWorkspace?.harEntries || [];

  // Show uploader if no HAR data
  if (harEntries.length === 0) {
    return (
      <div className="min-h-screen bg-black p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          <HARUploader />
        </div>
      </div>
    );
  }

  // Memoized filtered entries
  const filteredEntries = useMemo(() => {
    if (harEntries.length === 0) return [];
    return applyFilters(harEntries, filterState);
  }, [harEntries, filterState]);

  // Build dependency matrix from filtered entries
  const dependencyMatrix = useMemo(() => {
    if (filteredEntries.length === 0) return null;
    return buildDependencyMatrix(filteredEntries);
  }, [filteredEntries]);

  // Statistics
  const statistics = useMemo(() => {
    if (filteredEntries.length === 0) {
      return {
        totalRequests: 0,
        uniqueDomains: 0,
        totalDataTransferred: 0,
        averageResponseTime: 0,
        successRate: 0
      };
    }

    const domains = new Set(
      filteredEntries.map(e => {
        try {
          return new URL(e.request.url).hostname;
        } catch {
          return 'invalid';
        }
      })
    );

    const totalData = filteredEntries.reduce((sum, e) =>
      sum + (e.response.body?.size || 0) + (e.request.body?.size || 0), 0
    );

    const avgTime = filteredEntries.reduce((sum, e) =>
      sum + e.duration, 0
    ) / filteredEntries.length;

    const successCount = filteredEntries.filter(e =>
      e.response.status >= 200 && e.response.status < 400
    ).length;

    return {
      totalRequests: filteredEntries.length,
      uniqueDomains: domains.size,
      totalDataTransferred: totalData,
      averageResponseTime: avgTime,
      successRate: (successCount / filteredEntries.length) * 100
    };
  }, [filteredEntries]);

  // Handlers
  const openDetailModal = useCallback((entry: SemanticHarEntry, index: number) => {
    setSelectedEntry(entry);
    setSelectedEntryIndex(index);
    setIsModalOpen(true);
  }, []);

  const handleGenerateCode = useCallback((config: LoliCodeConfig) => {
    try {
      if (!dependencyMatrix) {
        throw new Error('No dependency matrix available');
      }

      const code = generateLoliCode(config, filteredEntries, dependencyMatrix);
      setGeneratedCode(code);
      setActiveTab('generator');

      toast({
        title: "LoliCode Generated",
        description: `Successfully generated script with ${config.selectedIndices.length} requests`,
        variant: "success"
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast({
        title: "Generation Failed",
        description: errorMessage,
        variant: "destructive"
      });
    }
  }, [filteredEntries, dependencyMatrix]);

  const handleCopyCode = useCallback(() => {
    if (generatedCode) {
      navigator.clipboard.writeText(generatedCode);
      toast({
        title: "Copied to Clipboard",
        description: "LoliCode script has been copied",
        variant: "success"
      });
    }
  }, [generatedCode]);

  // Auto-switch to generator tab when code is generated
  useEffect(() => {
    if (generatedCode) {
      setActiveTab('generator');
    }
  }, [generatedCode]);

  return (
    <div className="min-h-screen bg-black p-4 md:p-6">
      <div className="max-w-[1920px] mx-auto space-y-4 md:space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-black via-gold-primary/10 to-black rounded-lg p-6 border border-gold-primary/30">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gold-primary flex items-center">
                <svg className="w-8 h-8 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                    d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                </svg>
                HAR Analysis Dashboard
              </h1>
              <p className="text-gray-400 mt-2">
                {currentWorkspace?.name || 'No workspace loaded'}
              </p>
            </div>

            {/* Statistics */}
            <div className="flex gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gold-primary">
                  {statistics.totalRequests}
                </div>
                <div className="text-xs text-gray-400">Requests</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gold-primary">
                  {statistics.uniqueDomains}
                </div>
                <div className="text-xs text-gray-400">Domains</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gold-primary">
                  {(statistics.totalDataTransferred / 1024).toFixed(1)}KB
                </div>
                <div className="text-xs text-gray-400">Data</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gold-primary">
                  {statistics.averageResponseTime.toFixed(0)}ms
                </div>
                <div className="text-xs text-gray-400">Avg Time</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gold-primary">
                  {statistics.successRate.toFixed(0)}%
                </div>
                <div className="text-xs text-gray-400">Success</div>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Management */}
        <div className="border border-gold-primary/30 rounded-lg p-4 bg-gradient-to-br from-black to-gold-primary/5">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-gold-primary font-bold text-xl flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h16a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6z" />
              </svg>
              Filter Configuration
            </h2>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="border-gold-primary/50">
                {filterState.rules.length} Rules
              </Badge>
              <Badge variant="outline" className="border-gold-primary/50">
                {filterState.logic} Logic
              </Badge>
            </div>
          </div>

          <FilterManager
            totalEntries={harEntries.length}
            filteredCount={filteredEntries.length}
          />
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'requests' | 'dependencies' | 'generator')}>
          <TabsList className="bg-black border border-gold-primary/30">
            <TabsTrigger
              value="requests"
              className="data-[state=active]:bg-gold-primary data-[state=active]:text-black"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Requests ({filteredEntries.length})
            </TabsTrigger>
            <TabsTrigger
              value="dependencies"
              className="data-[state=active]:bg-gold-primary data-[state=active]:text-black"
              disabled={!dependencyMatrix}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              Dependencies
            </TabsTrigger>
            <TabsTrigger
              value="generator"
              className="data-[state=active]:bg-gold-primary data-[state=active]:text-black"
              disabled={filteredEntries.length === 0}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                  d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              Generator
            </TabsTrigger>
          </TabsList>

          <TabsContent value="requests" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <RequestDataTable
                  entries={filteredEntries}
                  onEntryClick={openDetailModal}
                  dependencyMatrix={dependencyMatrix}
                />
              </div>
              <div className="space-y-6">
                <TokenDetectionPanel entries={filteredEntries} />

                {dependencyMatrix && (
                  <div className="border border-gold-primary/30 rounded-lg p-4 bg-gradient-to-br from-black to-gold-primary/5">
                    <h3 className="text-gold-primary font-bold mb-3">Critical Path</h3>
                    <div className="space-y-2">
                      {dependencyMatrix.criticalPath.map((index, i) => (
                        <div
                          key={index}
                          className="flex items-center text-sm"
                        >
                          <Badge className="mr-2 bg-gold-primary text-black">
                            {i + 1}
                          </Badge>
                          <span className="text-gray-300 truncate">
                            {filteredEntries[index]?.request.method} {' '}
                            {new URL(filteredEntries[index]?.request.url || '').pathname}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="dependencies">
            {dependencyMatrix && (
              <DependencyGraphLazy
                entries={filteredEntries}
                matrix={dependencyMatrix}
                onNodeClick={(index) => openDetailModal(filteredEntries[index], index)}
              />
            )}
          </TabsContent>

          <TabsContent value="generator" className="space-y-4 md:space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
              <LoliCodeCustomizer
                entries={filteredEntries}
                dependencyMatrix={dependencyMatrix!}
                onGenerate={handleGenerateCode}
              />

              <LoliCodePreview
                code={generatedCode}
                onCopy={handleCopyCode}
                onDownload={() => {
                  const blob = new Blob([generatedCode], { type: 'text/plain' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'script.loli';
                  a.click();
                  URL.revokeObjectURL(url);
                }}
              />
            </div>
          </TabsContent>
        </Tabs>

        {/* Request Detail Modal */}
        <RequestDetailModal
          entry={selectedEntry}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          index={selectedEntryIndex}
        />
      </div>
    </div>
  );
}
