import { useState } from 'react';
import { WikiPage } from '@/types/wiki/wikipage';

interface UseWikiPageProps {
  owner: string;
  repo: string;
  repoType: string;
  language: string;
}

export function useWikiPage({ owner, repo, repoType, language }: UseWikiPageProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updatePage = async (page: WikiPage) => {
    setIsUpdating(true);
    setError(null);

    try {
      const response = await fetch('/api/wiki_cache/page', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          owner,
          repo,
          repo_type: repoType,
          language,
          page_id: page.id,
          title: page.title,
          content: page.content,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to update wiki page');
      }

      return await response.json();
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to update wiki page';
      setError(message);
      throw new Error(message);
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    updatePage,
    isUpdating,
    error,
  };
} 