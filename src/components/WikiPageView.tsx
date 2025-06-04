'use client';

import React, { useState } from 'react';
import { WikiPage } from '@/types/wiki/wikipage';
import { FaSync, FaFileExport, FaDownload, FaSpinner } from 'react-icons/fa';
import Markdown from './Markdown';
import WikiEditor from './WikiEditor';
import { useWikiPage } from '@/hooks/useWikiPage';
import { useLanguage } from '@/contexts/LanguageContext';

interface WikiPageViewProps {
  page: WikiPage;
  owner: string;
  repo: string;
  repoType: string;
  language: string;
  onPageUpdate?: (updatedPage: WikiPage) => void;
  onRefresh?: () => Promise<void>;
  className?: string;
}

export default function WikiPageView({
  page,
  owner,
  repo,
  repoType,
  language,
  onPageUpdate,
  onRefresh,
  className = '',
}: WikiPageViewProps) {
  const { updatePage, isUpdating } = useWikiPage({
    owner,
    repo,
    repoType,
    language,
  });
  const { messages: t } = useLanguage();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const handleSave = async (updatedPage: WikiPage) => {
    try {
      await updatePage(updatedPage);
      onPageUpdate?.(updatedPage);
    } catch (error) {
      // Error handling is done in the WikiEditor component
      throw error;
    }
  };

  const handleRefresh = async () => {
    if (isRefreshing || !onRefresh) return;
    setIsRefreshing(true);
    try {
      await onRefresh();
    } catch (error) {
      console.error('Error refreshing wiki:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleExport = async (format: 'markdown' | 'json') => {
    setIsExporting(true);
    setExportError(null);
    try {
      const response = await fetch('/export/wiki', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          repo_url: `https://github.com/${owner}/${repo}`,
          pages: [page],
          format,
        }),
      });

      if (!response.ok) {
        throw new Error(`Export failed: ${response.statusText}`);
      }

      // Get the filename from the Content-Disposition header
      const contentDisposition = response.headers.get('Content-Disposition');
      const filename = contentDisposition
        ? contentDisposition.split('filename=')[1].replace(/"/g, '')
        : `wiki_export.${format}`;

      // Create a blob from the response
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting wiki:', error);
      setExportError(error instanceof Error ? error.message : 'Failed to export wiki');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
        {/* Refresh Button */}
        {onRefresh && (
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2 text-[var(--muted)] hover:text-[var(--foreground)] transition-colors disabled:opacity-50"
            title={t.actions?.refreshWiki || 'Refresh Wiki'}
          >
            <FaSync className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        )}

        {/* Export Buttons */}
        <div className="relative inline-block">
          <button
            onClick={() => handleExport('markdown')}
            disabled={isExporting}
            className="p-2 text-[var(--muted)] hover:text-[var(--foreground)] transition-colors disabled:opacity-50"
            title={t.actions?.exportMarkdown || 'Export as Markdown'}
          >
            <FaFileExport className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleExport('json')}
            disabled={isExporting}
            className="p-2 text-[var(--muted)] hover:text-[var(--foreground)] transition-colors disabled:opacity-50"
            title={t.actions?.exportJson || 'Export as JSON'}
          >
            <FaDownload className="h-4 w-4" />
          </button>
          {isExporting && (
            <FaSpinner className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-[var(--accent-primary)]" />
          )}
        </div>

        {/* Edit Button */}
        <WikiEditor
          page={page}
          onSave={handleSave}
        />
      </div>

      {/* Export Error Message */}
      {exportError && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {exportError}
        </div>
      )}

      {/* Wiki Content */}
      <article className="prose prose-sm md:prose-base lg:prose-lg dark:prose-invert max-w-none">
        <h1>{page.title}</h1>
        <Markdown content={page.content} />
      </article>
    </div>
  );
} 