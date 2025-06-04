'use client';

import React from 'react';
import { WikiPage } from '@/types/wiki/wikipage';
import Markdown from './Markdown';
import WikiEditor from './WikiEditor';
import { useWikiPage } from '@/hooks/useWikiPage';

interface WikiPageViewProps {
  page: WikiPage;
  owner: string;
  repo: string;
  repoType: string;
  language: string;
  onPageUpdate?: (updatedPage: WikiPage) => void;
  className?: string;
}

export default function WikiPageView({
  page,
  owner,
  repo,
  repoType,
  language,
  onPageUpdate,
  className = '',
}: WikiPageViewProps) {
  const { updatePage, isUpdating } = useWikiPage({
    owner,
    repo,
    repoType,
    language,
  });

  const handleSave = async (updatedPage: WikiPage) => {
    try {
      await updatePage(updatedPage);
      onPageUpdate?.(updatedPage);
    } catch (error) {
      // Error handling is done in the WikiEditor component
      throw error;
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div className="absolute top-4 right-4 z-10">
        <WikiEditor
          page={page}
          onSave={handleSave}
        />
      </div>
      <article className="prose prose-sm md:prose-base lg:prose-lg dark:prose-invert max-w-none">
        <h1>{page.title}</h1>
        <Markdown content={page.content} />
      </article>
    </div>
  );
} 