import React, { memo, useState, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface LoliCodePreviewProps {
  code: string;
  onCopy: () => void;
  onDownload: () => void;
}

export const LoliCodePreview = memo(({ code, onCopy, onDownload }: LoliCodePreviewProps) => {
  const [copied, setCopied] = useState(false);
  const [shareLink, setShareLink] = useState<string | null>(null);

  const handleCopy = useCallback(async () => {
    await onCopy();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [onCopy]);

  const handleShare = useCallback(async () => {
    try {
      // Create a shareable link (in a real app, this would upload to a service)
      const blob = new Blob([code], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      setShareLink(url);
      
      // Copy to clipboard
      await navigator.clipboard.writeText(url);
      
      // Clean up after a delay
      setTimeout(() => {
        URL.revokeObjectURL(url);
        setShareLink(null);
      }, 30000);
    } catch (error) {
      console.error('Failed to create share link:', error);
    }
  }, [code]);

  const stats = useMemo(() => {
    if (!code) return { lines: 0, size: 0, requests: 0 };
    
    const lines = code.split('\n').length;
    const size = new Blob([code]).size;
    const requests = (code.match(/REQUEST/g) || []).length;
    
    return { lines, size, requests };
  }, [code]);

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)}MB`;
  };

  return (
    <div className="border border-gold-primary/30 rounded-lg bg-gradient-to-br from-black to-gold-primary/5 overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="p-4 bg-black/50 border-b border-gold-primary/30">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-bold text-gold-primary flex items-center gap-2 mb-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                  d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              LoliCode Preview
            </h3>
            {code && (
              <div className="flex gap-2 flex-wrap">
                <Badge  className="border-gray-600 text-xs">
                  {stats.lines} lines
                </Badge>
                <Badge  className="border-gray-600 text-xs">
                  {formatSize(stats.size)}
                </Badge>
                <Badge  className="border-gold-primary/50 text-xs">
                  {stats.requests} requests
                </Badge>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Code Editor/Preview */}
      <div className="flex-1 overflow-hidden">
        {code ? (
          <pre className="text-xs bg-black/80 p-4 h-full overflow-auto font-mono text-gray-300 leading-relaxed">
            {code}
          </pre>
        ) : (
          <div className="h-full flex items-center justify-center p-8">
            <div className="text-center">
              <div className="text-6xl mb-4">📝</div>
              <h4 className="text-xl font-semibold text-gray-400 mb-2">No Code Generated Yet</h4>
              <p className="text-sm text-gray-500 max-w-md">
                Configure your settings in the customizer and click "Generate LoliCode Script" to see the preview here
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      {code && (
        <div className="p-4 bg-black/50 border-t border-gold-primary/30">
          <div className="grid grid-cols-2 gap-3 mb-3">
            <Button 
              onClick={handleCopy} 
              className="bg-gold-primary hover:bg-gold-secondary text-black font-semibold transition-all duration-200 hover-lift"
              title="Copy code to clipboard"
            >
              {copied ? (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Copied!
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                      d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                  </svg>
                  Copy to Clipboard
                </>
              )}
            </Button>
            
            <Button 
              onClick={onDownload} 
              
              className="border-gold-primary/50 hover:bg-gold-primary/10 font-semibold transition-all duration-200 hover-lift"
              title="Download as .loli file"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download Script
            </Button>
          </div>

          <Button 
            onClick={handleShare} 
            
            className="w-full border-blue-600 text-blue-400 hover:bg-blue-600/10 transition-all duration-200"
            title="Create a shareable link (temporary)"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            {shareLink ? 'Link Copied!' : 'Create Share Link'}
          </Button>

          {shareLink && (
            <p className="text-xs text-gray-500 mt-2 text-center">
              ⚠️ Link expires in 30 seconds
            </p>
          )}
        </div>
      )}
    </div>
  );
});

LoliCodePreview.displayName = 'LoliCodePreview';
