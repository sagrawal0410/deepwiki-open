'use client';

import React, { useState } from 'react';
import { FaPencilAlt, FaSave, FaTimes } from 'react-icons/fa';
import { WikiPage } from '@/types/wiki/wikipage';

interface WikiEditorProps {
  page: WikiPage;
  onSave: (updatedPage: WikiPage) => Promise<void>;
  className?: string;
}

export default function WikiEditor({ page, onSave, className = '' }: WikiEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(page.content);
  const [editedTitle, setEditedTitle] = useState(page.title);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEdit = () => {
    setIsEditing(true);
    setEditedContent(page.content);
    setEditedTitle(page.title);
    setError(null);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedContent(page.content);
    setEditedTitle(page.title);
    setError(null);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError(null);
      
      const updatedPage: WikiPage = {
        ...page,
        title: editedTitle,
        content: editedContent,
      };

      await onSave(updatedPage);
      setIsEditing(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isEditing) {
    return (
      <button
        onClick={handleEdit}
        className="inline-flex items-center text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
        title="Edit wiki content"
      >
        <FaPencilAlt className="h-4 w-4" />
      </button>
    );
  }

  return (
    <div className={`fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 ${className}`}>
      <div className="bg-[var(--background)] rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="p-4 border-b border-[var(--border-color)] flex items-center justify-between">
          <input
            type="text"
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            className="text-xl font-semibold bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)] rounded px-2 py-1 w-full"
            placeholder="Enter title..."
          />
          <div className="flex items-center gap-2">
            <button
              onClick={handleCancel}
              className="p-2 text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
              disabled={isSaving}
            >
              <FaTimes className="h-4 w-4" />
            </button>
            <button
              onClick={handleSave}
              className="p-2 text-[var(--accent-primary)] hover:text-[var(--accent-primary)]/80 transition-colors disabled:opacity-50"
              disabled={isSaving}
            >
              <FaSave className="h-4 w-4" />
            </button>
          </div>
        </div>
        
        <div className="p-4 flex-1 overflow-auto">
          <textarea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            className="w-full h-full min-h-[400px] bg-transparent border border-[var(--border-color)] rounded-lg p-4 focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)] font-mono text-sm resize-none"
            placeholder="Enter wiki content in Markdown format..."
          />
        </div>

        {error && (
          <div className="p-4 border-t border-[var(--border-color)] bg-[var(--highlight)]/5 text-[var(--highlight)] text-sm">
            {error}
          </div>
        )}
      </div>
    </div>
  );
} 