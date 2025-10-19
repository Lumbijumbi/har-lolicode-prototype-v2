'use client';

import dynamic from 'next/dynamic';
import React from 'react';

// Lazy load the DependencyGraph component
const DependencyGraphLazy = dynamic(
  () => import('./DependencyGraph').then(mod => ({ default: mod.DependencyGraph })),
  {
    loading: () => (
      <div className="border border-gold-primary/30 rounded-lg bg-gradient-to-br from-black to-gold-primary/5 p-8 h-96 flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-gray-400">Loading dependency graph...</p>
        </div>
      </div>
    ),
    ssr: false,
  }
);

export { DependencyGraphLazy };
